/**
 * Food Database
 * Nutritional values per 100g unless specified
 * Values: calories (kcal), protein (g), carbs (g), fats (g), fiber (g)
 * Sourced/verified against USDA FoodData Central where a direct match exists;
 * composite/cooked Indian dishes are reasonable estimates (recipes vary).
 */

const FOOD_DATABASE = {
  // GRAINS
  'white rice': { calories: 130, protein: 2.7, carbs: 28.2, fats: 0.3, fiber: 0.4 },
  'brown rice': { calories: 111, protein: 2.6, carbs: 23.0, fats: 0.9, fiber: 1.8 },
  'oats': { calories: 389, protein: 16.9, carbs: 66.3, fats: 6.9, fiber: 10.6 },
  'wheat bread': { calories: 265, protein: 9.0, carbs: 49.0, fats: 3.2, fiber: 2.7 },
  'white bread': { calories: 265, protein: 8.0, carbs: 50.0, fats: 3.3, fiber: 1.2 },
  'whole wheat bread': { calories: 247, protein: 13.0, carbs: 41.0, fats: 3.4, fiber: 6.0 },
  'multigrain bread': { calories: 250, protein: 11.0, carbs: 43.0, fats: 3.5, fiber: 6.0 },
  'roti': { calories: 297, protein: 9.0, carbs: 57.0, fats: 3.7, fiber: 4.0 },
  'chapati': { calories: 297, protein: 9.0, carbs: 57.0, fats: 3.7, fiber: 4.0 },
  'paratha': { calories: 326, protein: 8.0, carbs: 51.0, fats: 9.0, fiber: 3.0 },
  'idli': { calories: 58, protein: 2.0, carbs: 11.0, fats: 0.4, fiber: 0.5 },
  'dosa': { calories: 168, protein: 3.9, carbs: 31.0, fats: 3.7, fiber: 1.0 },
  'poha': { calories: 110, protein: 2.5, carbs: 23.0, fats: 0.8, fiber: 0.6 },
  'upma': { calories: 130, protein: 3.0, carbs: 18.0, fats: 5.0, fiber: 1.5 },
  'pasta': { calories: 157, protein: 5.8, carbs: 31.0, fats: 0.9, fiber: 1.8 },
  'noodles': { calories: 138, protein: 4.5, carbs: 25.0, fats: 2.1, fiber: 1.5 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 21.3, fats: 1.9, fiber: 2.8 },
  'ragi': { calories: 336, protein: 7.3, carbs: 72.0, fats: 1.3, fiber: 3.6 },
  'jowar': { calories: 349, protein: 10.4, carbs: 72.6, fats: 1.9, fiber: 1.6 },
  'bajra': { calories: 361, protein: 11.6, carbs: 67.5, fats: 5.0, fiber: 1.2 },
  'cornflakes': { calories: 357, protein: 7.5, carbs: 84.0, fats: 0.4, fiber: 3.0 },
  'suji': { calories: 360, protein: 12.7, carbs: 72.8, fats: 1.1, fiber: 3.9 },
  'semolina': { calories: 360, protein: 12.7, carbs: 72.8, fats: 1.1, fiber: 3.9 },
  'vermicelli': { calories: 348, protein: 10.4, carbs: 76.0, fats: 0.6, fiber: 2.7 },
  'semiya': { calories: 348, protein: 10.4, carbs: 76.0, fats: 0.6, fiber: 2.7 },
  'muesli': { calories: 367, protein: 8.6, carbs: 66.0, fats: 6.0, fiber: 8.0 },

  // PROTEINS
  // egg unitGrams = 50g (1 large egg without shell, USDA) → 72 kcal, 6.3g protein, 4.75g fat
  'egg':          { calories: 143, protein: 12.6, carbs: 0.7, fats: 9.5,  fiber: 0.0, unit: 'piece', unitGrams: 50 },
  'boiled egg':   { calories: 155, protein: 12.6, carbs: 1.1, fats: 10.6, fiber: 0.0, unit: 'piece', unitGrams: 50 },
  'scrambled eggs': { calories: 170, protein: 12.0, carbs: 1.6, fats: 13.0, fiber: 0.0, unit: 'piece', unitGrams: 50 },
  'fried egg':    { calories: 196, protein: 13.6, carbs: 0.4, fats: 15.0, fiber: 0.0, unit: 'piece', unitGrams: 50 },
  'egg white':    { calories: 52,  protein: 10.9, carbs: 0.7, fats: 0.2,  fiber: 0.0, unit: 'piece', unitGrams: 33 },
  'egg yolk':     { calories: 322, protein: 15.9, carbs: 3.6, fats: 26.5, fiber: 0.0, unit: 'piece', unitGrams: 17 },
  'duck egg':     { calories: 185, protein: 12.8, carbs: 1.5, fats: 13.8, fiber: 0.0, unit: 'piece', unitGrams: 70 },
  'chicken breast': { calories: 165, protein: 31.0, carbs: 0.0, fats: 3.6, fiber: 0.0 },
  'grilled chicken': { calories: 165, protein: 31.0, carbs: 0.0, fats: 3.6, fiber: 0.0 },
  'chicken curry': { calories: 190, protein: 18.0, carbs: 6.0, fats: 10.0, fiber: 1.0 },
  'turkey breast': { calories: 135, protein: 30.1, carbs: 0.0, fats: 0.7, fiber: 0.0 },
  'mutton': { calories: 294, protein: 25.6, carbs: 0.0, fats: 20.9, fiber: 0.0 },
  'beef': { calories: 250, protein: 26.0, carbs: 0.0, fats: 15.0, fiber: 0.0 },
  'pork': { calories: 242, protein: 27.3, carbs: 0.0, fats: 14.0, fiber: 0.0 },
  'bacon': { calories: 541, protein: 37.0, carbs: 1.4, fats: 42.0, fiber: 0.0 },
  'sausage': { calories: 301, protein: 12.0, carbs: 2.0, fats: 27.0, fiber: 0.0 },
  'ham': { calories: 145, protein: 21.0, carbs: 1.5, fats: 5.5, fiber: 0.0 },
  'fish': { calories: 206, protein: 22.0, carbs: 0.0, fats: 12.0, fiber: 0.0 },
  'salmon': { calories: 208, protein: 22.1, carbs: 0.0, fats: 12.4, fiber: 0.0 },
  'tuna': { calories: 132, protein: 28.0, carbs: 0.0, fats: 1.0, fiber: 0.0 },
  'shrimp': { calories: 99, protein: 24.0, carbs: 0.2, fats: 0.3, fiber: 0.0 },
  'prawn': { calories: 99, protein: 24.0, carbs: 0.2, fats: 0.3, fiber: 0.0 },
  'crab': { calories: 97, protein: 20.3, carbs: 0.0, fats: 1.5, fiber: 0.0 },
  'paneer': { calories: 265, protein: 18.0, carbs: 3.4, fats: 20.8, fiber: 0.0 },
  'tofu': { calories: 76, protein: 8.0, carbs: 2.0, fats: 4.8, fiber: 0.3 },
  'soya chunks': { calories: 345, protein: 52.0, carbs: 33.0, fats: 0.5, fiber: 13.0 },
  'sprouts': { calories: 30, protein: 3.0, carbs: 6.0, fats: 0.2, fiber: 1.8 },
  'dal': { calories: 116, protein: 9.0, carbs: 20.0, fats: 0.4, fiber: 7.9 },
  'lentils': { calories: 116, protein: 9.0, carbs: 20.0, fats: 0.4, fiber: 7.9 },
  'rajma': { calories: 127, protein: 8.7, carbs: 22.8, fats: 0.5, fiber: 6.4 },
  'chickpeas': { calories: 164, protein: 8.9, carbs: 27.4, fats: 2.6, fiber: 7.6 },
  'chole': { calories: 164, protein: 8.9, carbs: 27.4, fats: 2.6, fiber: 7.6 },
  'whey protein': { calories: 400, protein: 80.0, carbs: 8.0, fats: 8.0, fiber: 0.0 },
  'protein shake': { calories: 150, protein: 25.0, carbs: 10.0, fats: 3.0, fiber: 0.0 },

  // DAIRY
  'milk': { calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0.0 },
  'skim milk': { calories: 34, protein: 3.4, carbs: 5.0, fats: 0.1, fiber: 0.0 },
  'low fat milk': { calories: 50, protein: 3.4, carbs: 4.9, fats: 2.0, fiber: 0.0 },
  'curd': { calories: 61, protein: 3.3, carbs: 4.7, fats: 3.3, fiber: 0.0 },
  'yogurt': { calories: 59, protein: 10.0, carbs: 3.6, fats: 0.4, fiber: 0.0 },
  'greek yogurt': { calories: 59, protein: 10.0, carbs: 3.6, fats: 0.4, fiber: 0.0 },
  'buttermilk': { calories: 40, protein: 3.3, carbs: 4.8, fats: 0.9, fiber: 0.0 },
  'chaas': { calories: 40, protein: 3.3, carbs: 4.8, fats: 0.9, fiber: 0.0 },
  'lassi': { calories: 89, protein: 3.0, carbs: 12.0, fats: 3.0, fiber: 0.0 },
  'soy milk': { calories: 33, protein: 2.9, carbs: 1.8, fats: 1.6, fiber: 0.6 },
  'almond milk': { calories: 15, protein: 0.6, carbs: 0.3, fats: 1.2, fiber: 0.3 },
  'condensed milk': { calories: 321, protein: 7.9, carbs: 54.4, fats: 8.7, fiber: 0.0 },
  'cream': { calories: 340, protein: 2.1, carbs: 2.8, fats: 36.0, fiber: 0.0 },
  'cheese': { calories: 402, protein: 23.0, carbs: 1.3, fats: 33.0, fiber: 0.0 },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fats: 81.0, fiber: 0.0 },
  'ghee': { calories: 900, protein: 0.0, carbs: 0.0, fats: 100.0, fiber: 0.0 },

  // FRUITS
  'banana': { calories: 89, protein: 1.1, carbs: 23.0, fats: 0.3, fiber: 2.6, unit: 'piece', unitGrams: 120 },
  'apple': { calories: 52, protein: 0.3, carbs: 14.0, fats: 0.2, fiber: 2.4, unit: 'piece', unitGrams: 182 },
  'orange': { calories: 47, protein: 0.9, carbs: 12.0, fats: 0.1, fiber: 2.4, unit: 'piece', unitGrams: 130 },
  'mango': { calories: 60, protein: 0.8, carbs: 15.0, fats: 0.4, fiber: 1.6 },
  'watermelon': { calories: 30, protein: 0.6, carbs: 7.6, fats: 0.2, fiber: 0.4 },
  'grapes': { calories: 69, protein: 0.7, carbs: 18.0, fats: 0.2, fiber: 0.9 },
  'papaya': { calories: 43, protein: 0.5, carbs: 11.0, fats: 0.3, fiber: 1.7 },
  'pineapple': { calories: 50, protein: 0.5, carbs: 13.1, fats: 0.1, fiber: 1.4 },
  'strawberry': { calories: 32, protein: 0.7, carbs: 7.7, fats: 0.3, fiber: 2.0 },
  'blueberry': { calories: 57, protein: 0.7, carbs: 14.5, fats: 0.3, fiber: 2.4 },
  'pear': { calories: 57, protein: 0.4, carbs: 15.2, fats: 0.1, fiber: 3.1, unit: 'piece', unitGrams: 178 },
  'kiwi': { calories: 61, protein: 1.1, carbs: 14.7, fats: 0.5, fiber: 3.0, unit: 'piece', unitGrams: 76 },
  'pomegranate': { calories: 83, protein: 1.7, carbs: 18.7, fats: 1.2, fiber: 4.0 },
  'guava': { calories: 68, protein: 2.6, carbs: 14.3, fats: 1.0, fiber: 5.4 },
  'jackfruit': { calories: 95, protein: 1.7, carbs: 23.2, fats: 0.6, fiber: 1.5 },
  'litchi': { calories: 66, protein: 0.8, carbs: 16.5, fats: 0.4, fiber: 1.3 },
  'fig': { calories: 74, protein: 0.8, carbs: 19.2, fats: 0.3, fiber: 2.9 },
  'avocado': { calories: 160, protein: 2.0, carbs: 8.5, fats: 14.7, fiber: 6.7 },

  // VEGETABLES
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2 },
  'broccoli': { calories: 34, protein: 2.8, carbs: 7.0, fats: 0.4, fiber: 2.6 },
  'carrot': { calories: 41, protein: 0.9, carbs: 10.0, fats: 0.2, fiber: 2.8 },
  'potato': { calories: 77, protein: 2.0, carbs: 17.0, fats: 0.1, fiber: 2.2 },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20.0, fats: 0.1, fiber: 3.0 },
  'tomato': { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2 },
  'cauliflower': { calories: 25, protein: 1.9, carbs: 5.0, fats: 0.3, fiber: 2.0 },
  'cabbage': { calories: 25, protein: 1.3, carbs: 5.8, fats: 0.1, fiber: 2.5 },
  'cucumber': { calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, fiber: 0.5 },
  'onion': { calories: 40, protein: 1.1, carbs: 9.3, fats: 0.1, fiber: 1.7 },
  'capsicum': { calories: 31, protein: 1.0, carbs: 6.0, fats: 0.3, fiber: 2.1 },
  'bell pepper': { calories: 31, protein: 1.0, carbs: 6.0, fats: 0.3, fiber: 2.1 },
  'beetroot': { calories: 43, protein: 1.6, carbs: 9.6, fats: 0.2, fiber: 2.8 },
  'peas': { calories: 81, protein: 5.4, carbs: 14.5, fats: 0.4, fiber: 5.7 },
  'corn': { calories: 86, protein: 3.3, carbs: 19.0, fats: 1.4, fiber: 2.7 },
  'mushroom': { calories: 22, protein: 3.1, carbs: 3.3, fats: 0.3, fiber: 1.0 },
  'okra': { calories: 33, protein: 1.9, carbs: 7.5, fats: 0.2, fiber: 3.2 },
  'ladyfinger': { calories: 33, protein: 1.9, carbs: 7.5, fats: 0.2, fiber: 3.2 },
  'bitter gourd': { calories: 17, protein: 1.0, carbs: 3.7, fats: 0.2, fiber: 2.8 },
  'karela': { calories: 17, protein: 1.0, carbs: 3.7, fats: 0.2, fiber: 2.8 },
  'brinjal': { calories: 25, protein: 1.0, carbs: 5.9, fats: 0.2, fiber: 3.0 },
  'eggplant': { calories: 25, protein: 1.0, carbs: 5.9, fats: 0.2, fiber: 3.0 },
  'drumstick': { calories: 37, protein: 2.1, carbs: 8.5, fats: 0.2, fiber: 3.2 },

  // SNACKS & NUTS (unit-based: per piece/nut)
  'peanut butter': { calories: 588, protein: 25.0, carbs: 20.0, fats: 50.0, fiber: 6.0 },
  'almonds': { calories: 579, protein: 21.0, carbs: 22.0, fats: 50.0, fiber: 12.5, unit: 'piece', unitGrams: 1.2 },
  'almond': { calories: 579, protein: 21.0, carbs: 22.0, fats: 50.0, fiber: 12.5, unit: 'piece', unitGrams: 1.2 },
  'walnuts': { calories: 654, protein: 15.0, carbs: 14.0, fats: 65.0, fiber: 6.7, unit: 'piece', unitGrams: 4 },
  'walnut': { calories: 654, protein: 15.0, carbs: 14.0, fats: 65.0, fiber: 6.7, unit: 'piece', unitGrams: 4 },
  'cashews': { calories: 553, protein: 18.0, carbs: 30.0, fats: 44.0, fiber: 3.3, unit: 'piece', unitGrams: 2 },
  'cashew': { calories: 553, protein: 18.0, carbs: 30.0, fats: 44.0, fiber: 3.3, unit: 'piece', unitGrams: 2 },
  'peanuts': { calories: 567, protein: 26.0, carbs: 16.0, fats: 49.0, fiber: 8.5, unit: 'piece', unitGrams: 1 },
  'pistachios': { calories: 560, protein: 20.2, carbs: 27.2, fats: 45.3, fiber: 10.6, unit: 'piece', unitGrams: 0.7 },
  'pistachio': { calories: 560, protein: 20.2, carbs: 27.2, fats: 45.3, fiber: 10.6, unit: 'piece', unitGrams: 0.7 },
  'hazelnuts': { calories: 628, protein: 15.0, carbs: 16.7, fats: 60.8, fiber: 9.7, unit: 'piece', unitGrams: 1.3 },
  'pecans': { calories: 691, protein: 9.2, carbs: 13.9, fats: 72.0, fiber: 9.6, unit: 'piece', unitGrams: 2 },
  'sunflower seeds': { calories: 584, protein: 20.8, carbs: 20.0, fats: 51.5, fiber: 8.6 },
  'dark chocolate': { calories: 598, protein: 7.8, carbs: 45.9, fats: 42.6, fiber: 10.9 },
  'chips': { calories: 536, protein: 7.0, carbs: 53.0, fats: 34.0, fiber: 4.8 },
  'french fries': { calories: 312, protein: 3.4, carbs: 41.0, fats: 15.0, fiber: 3.8 },
  'popcorn': { calories: 387, protein: 12.9, carbs: 78.0, fats: 4.5, fiber: 14.5 },
  'samosa': { calories: 262, protein: 5.0, carbs: 30.0, fats: 13.0, fiber: 2.0, unit: 'piece', unitGrams: 50 },
  'pizza': { calories: 266, protein: 11.0, carbs: 33.0, fats: 10.0, fiber: 2.3 },
  'burger': { calories: 295, protein: 17.0, carbs: 24.0, fats: 14.0, fiber: 1.0, unit: 'piece', unitGrams: 200 },
  'sandwich': { calories: 210, protein: 10.0, carbs: 30.0, fats: 5.0, fiber: 2.0, unit: 'piece', unitGrams: 150 },
  'salad': { calories: 20, protein: 1.5, carbs: 3.5, fats: 0.3, fiber: 2.0 },
  'biryani': { calories: 200, protein: 8.0, carbs: 25.0, fats: 8.0, fiber: 1.0 },
  'fried rice': { calories: 163, protein: 4.0, carbs: 20.0, fats: 7.0, fiber: 1.0 },
  'granola bar': { calories: 471, protein: 10.0, carbs: 64.0, fats: 20.0, fiber: 5.0 },
  'muffin': { calories: 377, protein: 6.0, carbs: 58.0, fats: 14.0, fiber: 2.0 },
  'cookie': { calories: 480, protein: 5.9, carbs: 64.0, fats: 23.0, fiber: 2.0 },
  'ice cream': { calories: 207, protein: 3.5, carbs: 23.6, fats: 11.0, fiber: 0.7 },
  'honey': { calories: 304, protein: 0.3, carbs: 82.4, fats: 0.0, fiber: 0.2 },
  'jaggery': { calories: 383, protein: 0.4, carbs: 98.0, fats: 0.1, fiber: 0.0 },
  'sugar': { calories: 387, protein: 0.0, carbs: 100.0, fats: 0.0, fiber: 0.0 },

  // INDIAN FOODS & EXTRAS
  'vada': { calories: 180, protein: 5.0, carbs: 22.0, fats: 8.0, fiber: 2.5, unit: 'piece', unitGrams: 50 },
  'wada': { calories: 180, protein: 5.0, carbs: 22.0, fats: 8.0, fiber: 2.5, unit: 'piece', unitGrams: 50 },
  'medu vada': { calories: 180, protein: 5.0, carbs: 22.0, fats: 8.0, fiber: 2.5, unit: 'piece', unitGrams: 50 },
  'dates': { calories: 277, protein: 1.8, carbs: 75.0, fats: 0.2, fiber: 6.7, unit: 'piece', unitGrams: 8 },
  'date': { calories: 277, protein: 1.8, carbs: 75.0, fats: 0.2, fiber: 6.7, unit: 'piece', unitGrams: 8 },
  'date syrup': { calories: 280, protein: 0.5, carbs: 72.0, fats: 0.1, fiber: 1.5 },
  'date serup': { calories: 280, protein: 0.5, carbs: 72.0, fats: 0.1, fiber: 1.5 },
  'mixed seeds': { calories: 490, protein: 20.0, carbs: 18.0, fats: 40.0, fiber: 8.0 },
  'chia seeds': { calories: 486, protein: 16.5, carbs: 42.1, fats: 30.7, fiber: 34.4 },
  'flax seeds': { calories: 534, protein: 18.3, carbs: 28.9, fats: 42.2, fiber: 27.3 },
  'pumpkin seeds': { calories: 559, protein: 30.2, carbs: 10.7, fats: 49.1, fiber: 6.0 },

  // BEVERAGES
  'coffee': { calories: 2, protein: 0.3, carbs: 0.0, fats: 0.0, fiber: 0.0 },
  'tea': { calories: 1, protein: 0.0, carbs: 0.3, fats: 0.0, fiber: 0.0 },
  'green tea': { calories: 1, protein: 0.2, carbs: 0.2, fats: 0.0, fiber: 0.0 },
  'orange juice': { calories: 45, protein: 0.7, carbs: 10.4, fats: 0.2, fiber: 0.2 },
  'soda': { calories: 41, protein: 0.0, carbs: 10.6, fats: 0.0, fiber: 0.0 },
  'cola': { calories: 41, protein: 0.0, carbs: 10.6, fats: 0.0, fiber: 0.0 },
  'beer': { calories: 43, protein: 0.5, carbs: 3.6, fats: 0.0, fiber: 0.0 },
  'wine': { calories: 85, protein: 0.1, carbs: 2.6, fats: 0.0, fiber: 0.0 },
  'milkshake': { calories: 112, protein: 3.5, carbs: 17.0, fats: 3.0, fiber: 0.0 },
  'coconut water': { calories: 19, protein: 0.7, carbs: 3.7, fats: 0.2, fiber: 1.1 },
};

const UNIT_CONVERSIONS = {
  'g': 1, 'gram': 1, 'grams': 1, 'kg': 1000, 'ml': 1,
  'cup': 240, 'cups': 240, 'tbsp': 15, 'tablespoon': 15, 'tsp': 5, 'teaspoon': 5,
  'bowl': 250, 'plate': 300, 'scoop': 30, 'glass': 250,
  'slice': 40, 'slices': 40,
};

function normalize(str) {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

function findFood(foodName) {
  const n = normalize(foodName);
  if (FOOD_DATABASE[n]) return { key: n, data: FOOD_DATABASE[n] };
  for (const key of Object.keys(FOOD_DATABASE)) {
    if (n.includes(key) || key.includes(n)) return { key, data: FOOD_DATABASE[key] };
  }
  return null;
}

function parseFoodEntry(input) {
  const results = [];
  const parts = normalize(input).split(/(?:,\s*|\s+and\s+|\s+with\s+|\s*\+\s*|\s*&\s*)/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    let quantity = 1;
    let unit = null;
    let foodName = trimmed;

    const fwdMatch = trimmed.match(/^(\d+\.?\d*)\s*(g|gram|grams|kg|ml|cup|cups|tbsp|tsp|bowl|plate|scoop|glass|slice|slices|piece|pieces)?\s+(.+)$/i);
    const revMatch = trimmed.match(/^(.+?)\s+(\d+\.?\d*)\s*(g|gram|grams|kg|ml)$/i);

    if (fwdMatch) {
      quantity = parseFloat(fwdMatch[1]);
      unit = fwdMatch[2] ? fwdMatch[2].toLowerCase() : null;
      foodName = fwdMatch[3];
    } else if (revMatch) {
      foodName = revMatch[1];
      quantity = parseFloat(revMatch[2]);
      unit = revMatch[3].toLowerCase();
    }

    const found = findFood(foodName);
    if (!found) continue;

    const { data } = found;
    let grams;

    if (!unit) {
      grams = data.unit === 'piece' && data.unitGrams ? quantity * data.unitGrams : quantity * 100;
    } else {
      const convFactor = UNIT_CONVERSIONS[unit] || 100;
      grams = quantity * convFactor;
    }

    const factor = grams / 100;
    results.push({
      name: found.key,
      quantity: Math.round(grams),
      calories: Math.round(data.calories * factor * 10) / 10,
      protein: Math.round(data.protein * factor * 10) / 10,
      carbs: Math.round(data.carbs * factor * 10) / 10,
      fats: Math.round(data.fats * factor * 10) / 10,
      fiber: Math.round(data.fiber * factor * 10) / 10,
    });
  }

  return results;
}

module.exports = { FOOD_DATABASE, findFood, parseFoodEntry };