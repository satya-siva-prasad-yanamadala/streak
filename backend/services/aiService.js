/**
 * AI Service — powered by Groq (Llama 3.3-70b)
 * Free API: https://console.groq.com
 * Falls back to rule-based if no API key is set.
 */

const Groq = require('groq-sdk');

let groqClient = null;
function getGroq() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// ─────────────────────────────────────────────
// GROQ: Parse food input → structured macros
// ─────────────────────────────────────────────
async function parseFoodWithAI(userInput) {
  const groq = getGroq();
  if (!groq) return null; // fall back to rule-based

  const prompt = `You are a nutrition expert. The user described what they ate. 
Extract each food item and return ONLY a valid JSON array — no explanation, no markdown, no code block.

User input: "${userInput}"

Return format (array of objects):
[
  {
    "name": "food name",
    "quantity": <number in grams or ml>,
    "calories": <kcal>,
    "protein": <grams>,
    "carbs": <grams>,
    "fats": <grams>,
    "fiber": <grams>
  }
]

Rules:
- Use real, accurate nutritional values (per actual quantity consumed).
- For count-based items (e.g. "3 eggs", "8 almonds", "2 wada"), use the correct weight per piece:
    egg = 60g each, almond = 7g each, wada/vada = 60g each, date = 8g each
- For volume items (e.g. "250ml milk"), use ml = g for liquids.
- For "1 tablespoon date syrup" use 15g.
- All macro values must match the actual quantity (not per 100g).
- If you cannot identify a food, skip it.
- Return only the JSON array, nothing else.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return null;

    let cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
    
    // Extract just the array if the model includes conversational text
    const startIndex = cleaned.indexOf('[');
    const endIndex = cleaned.lastIndexOf(']');
    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      cleaned = cleaned.substring(startIndex, endIndex + 1);
    }

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    // Normalize and round values
    return parsed.map(item => ({
      name:     String(item.name || 'unknown'),
      quantity: Math.round(Number(item.quantity) || 0),
      calories: Math.round((Number(item.calories) || 0) * 10) / 10,
      protein:  Math.round((Number(item.protein)  || 0) * 10) / 10,
      carbs:    Math.round((Number(item.carbs)    || 0) * 10) / 10,
      fats:     Math.round((Number(item.fats)     || 0) * 10) / 10,
      fiber:    Math.round((Number(item.fiber)    || 0) * 10) / 10,
    }));
  } catch (err) {
    console.error('Groq parse error:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// GROQ: Generate smart nutrition advice
// ─────────────────────────────────────────────
async function generateAIAdvice(consumed, targets, newFoods, userGoal) {
  const groq = getGroq();
  if (!groq) return null;

  const foodList = newFoods.map(f => `${f.name} (${f.quantity}g)`).join(', ');
  const calPct   = Math.round((consumed.calories / targets.dailyCalories) * 100);
  const protPct  = Math.round((consumed.protein  / targets.dailyProtein)  * 100);

  const prompt = `You are a helpful nutrition assistant. Give short, practical advice (2-3 sentences max).

User goal: ${userGoal || 'maintain'}
Just logged: ${foodList}
Calories consumed today: ${consumed.calories} / ${targets.dailyCalories} kcal (${calPct}%)
Protein consumed today:  ${consumed.protein}g / ${targets.dailyProtein}g (${protPct}%)
Carbs today: ${consumed.carbs}g / ${targets.dailyCarbs}g
Fats today: ${consumed.fats}g / ${targets.dailyFats}g

Give a short, friendly tip. Use 1-2 emojis. Be concise — max 2-3 sentences.`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    });
    return completion.choices[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('Groq advice error:', err.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// Rule-based fallback tips (when no API key)
// ─────────────────────────────────────────────
const FALLBACK_TIPS = {
  over_calories:  '⚠️ You\'ve exceeded your calorie target. Focus on vegetables and lean protein for the rest of the day.',
  low_protein:    '💡 Protein is below target. Try eggs, paneer, dal, or a protein shake with your next meal.',
  low_calories:   '💡 You still have calories remaining. A balanced snack with nuts and fruits would help.',
  on_track:       '✅ You\'re on track with your nutrition today! Consistency is the key to results.',
};

function getFallbackTip(consumed, targets) {
  if (consumed.calories > targets.dailyCalories * 1.05) return FALLBACK_TIPS.over_calories;
  const protPct = (consumed.protein / targets.dailyProtein) * 100;
  const calPct  = (consumed.calories / targets.dailyCalories) * 100;
  if (protPct < 50) return FALLBACK_TIPS.low_protein;
  if (calPct < 40)  return FALLBACK_TIPS.low_calories;
  return FALLBACK_TIPS.on_track;
}

// ─────────────────────────────────────────────
// Build the chat response message
// ─────────────────────────────────────────────
function buildGymMessage(consumed, targets, remaining, percentLeft, newFoods, tip) {
  const foodList = newFoods.length > 0
    ? newFoods.map(f => `${f.name} (${f.quantity}g)`).join(', ')
    : 'your meal';

  return `🍽️ **Logged:** ${foodList}

**📊 Today's Nutrition Summary:**

🔥 **Calories:** ${consumed.calories.toFixed(0)} / ${targets.dailyCalories} kcal *(Remaining: ${remaining.calories.toFixed(0)} kcal)*
💪 **Protein:** ${consumed.protein.toFixed(1)}g / ${targets.dailyProtein}g *(Remaining: ${remaining.protein.toFixed(1)}g)*
🍞 **Carbs:** ${consumed.carbs.toFixed(1)}g / ${targets.dailyCarbs}g *(Remaining: ${remaining.carbs.toFixed(1)}g)*
🥑 **Fats:** ${consumed.fats.toFixed(1)}g / ${targets.dailyFats}g *(Remaining: ${remaining.fats.toFixed(1)}g)*
🌾 **Fiber:** ${consumed.fiber.toFixed(1)}g / ${targets.dailyFiber}g *(Remaining: ${remaining.fiber.toFixed(1)}g)*

${tip}`;
}

// ─────────────────────────────────────────────
// Money message
// ─────────────────────────────────────────────
const MONEY_TIPS = [
  '💰 Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.',
  '💰 Track small daily expenses — they add up quickly over a month!',
  '📈 Your savings rate looks good! Consider SIP investments to grow your wealth.',
  '📊 Review your subscriptions monthly — cancel anything you don\'t actively use.',
  '💰 Emergency fund goal: 3-6 months of expenses saved. Are you on track?',
];

function generateMoneyMessage(entry, monthlySalary, monthlyExpenses, monthlyIncome, savings) {
  const savingsRate = monthlySalary > 0
    ? Math.round((savings / monthlySalary) * 100)
    : 0;
  const tip    = MONEY_TIPS[Math.floor(Math.random() * MONEY_TIPS.length)];
  const emoji  = entry.type === 'expense' ? '💸' : '💰';
  const action = entry.type === 'expense' ? 'Spent' : 'Received';

  return `${emoji} **${action}:** ₹${entry.amount} — ${entry.category}
${entry.description ? `📝 *${entry.description}*\n` : ''}
**📊 This Month's Summary:**

💰 **Monthly Salary:** ₹${monthlySalary.toLocaleString('en-IN')}
💸 **Total Expenses:** ₹${monthlyExpenses.toLocaleString('en-IN')}
📥 **Extra Income:** ₹${monthlyIncome.toLocaleString('en-IN')}
🏦 **Net Savings:** ₹${savings.toLocaleString('en-IN')} (${savingsRate}% of salary)

${tip}`;
}

function generateDailyGymAnalysis(consumed, targets) {
  const calPct  = Math.round((consumed.calories / targets.dailyCalories) * 100);
  const protPct = Math.round((consumed.protein  / targets.dailyProtein)  * 100);
  let verdict = '';
  if (calPct >= 90 && calPct <= 110 && protPct >= 80) {
    verdict = '🏆 **Excellent day!** You nailed your nutrition goals.';
  } else if (protPct < 60) {
    verdict = '⚠️ **Protein was low today.** Try to front-load protein tomorrow.';
  } else if (calPct > 115) {
    verdict = '📉 **Slight overage today.** Be mindful tomorrow and add some movement.';
  } else {
    verdict = '👍 **Decent day overall!** Small adjustments will help you hit targets.';
  }
  return `📅 **End of Day Analysis**\n\n${verdict}\n\nCalories: ${calPct}% of target | Protein: ${protPct}% of target`;
}

function parseMoneyInput(input) {
  const lower = input.toLowerCase();
  const isIncome = /received|earned|got|salary|income|freelance|bonus|credited/i.test(lower);
  const type = isIncome ? 'income' : 'expense';
  const amountMatch = lower.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rs|rupees|inr|₹)?/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;
  let category = 'Other';
  if (/food|eat|lunch|dinner|breakfast|restaurant|zomato|swiggy|cafe|chai|coffee|meal/i.test(lower)) {
    category = isIncome ? 'Other Income' : 'Food & Dining';
  } else if (/uber|ola|auto|bus|metro|transport|petrol|fuel|cab/i.test(lower)) {
    category = 'Transport';
  } else if (/amazon|shopping|clothes|shirt|shoes|mall/i.test(lower)) {
    category = 'Shopping';
  } else if (/movie|netflix|spotify|entertainment|game/i.test(lower)) {
    category = 'Entertainment';
  } else if (/gym|medicine|doctor|hospital|health/i.test(lower)) {
    category = 'Health & Fitness';
  } else if (/bill|electricity|wifi|internet|rent|water|gas/i.test(lower)) {
    category = 'Bills & Utilities';
  } else if (/college|course|book|education|tuition/i.test(lower)) {
    category = 'Education';
  } else if (/salary|stipend/i.test(lower)) {
    category = 'Salary';
  } else if (/freelance|client|project/i.test(lower)) {
    category = 'Freelance';
  }
  return { type, amount, category };
}

module.exports = {
  parseFoodWithAI,
  generateAIAdvice,
  buildGymMessage,
  getFallbackTip,
  generateMoneyMessage,
  generateDailyGymAnalysis,
  parseMoneyInput,
};
