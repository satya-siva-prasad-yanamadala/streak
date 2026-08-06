import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const canvasRef = useRef(null);

  // Redirect if already logged in
  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

  // ── Aurora canvas ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let W, H, t = 0, raf;
    const blobs = [
      { x:.15, y:.2,  r:.35, h:260, s:.0007, ox:.5,  oy:.4  },
      { x:.8,  y:.15, r:.3,  h:190, s:.0009, ox:-.4, oy:.5  },
      { x:.5,  y:.8,  r:.4,  h:160, s:.0006, ox:.3,  oy:-.5 },
      { x:.9,  y:.7,  r:.25, h:290, s:.001,  ox:-.6, oy:-.3 },
    ];
    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    function draw() {
      ctx.clearRect(0, 0, W, H);
      blobs.forEach(b => {
        const x = (b.x + Math.sin(t * b.s + b.ox) * .18) * W;
        const y = (b.y + Math.cos(t * b.s + b.oy) * .18) * H;
        const r = b.r * Math.min(W, H);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0,   `hsla(${b.h},80%,60%,.18)`);
        g.addColorStop(.5,  `hsla(${b.h+30},70%,50%,.08)`);
        g.addColorStop(1,   `hsla(${b.h+60},60%,40%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });
      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  // ── Custom cursor ──────────────────────────────────────────────
  useEffect(() => {
    const dot  = document.getElementById('lp-cursor');
    const ring = document.getElementById('lp-ring');
    if (!dot || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0, raf;
    const onMove = e => { mx = e.clientX; my = e.clientY; dot.style.left = mx - 6 + 'px'; dot.style.top = my - 6 + 'px'; };
    document.addEventListener('mousemove', onMove);
    function animRing() { rx += (mx - rx - 22) * .12; ry += (my - ry - 22) * .12; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; raf = requestAnimationFrame(animRing); }
    animRing();
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);

  // ── Magnetic buttons ───────────────────────────────────────────
  useEffect(() => {
    const btns = document.querySelectorAll('.lp-magnetic');
    const onMove = (el, e) => {
      const r  = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width/2) * .2}px,${(e.clientY - r.top - r.height/2) * .3}px)`;
    };
    const onLeave = el => () => el.style.transform = '';
    btns.forEach(el => {
      const mv = e => onMove(el, e);
      el.addEventListener('mousemove', mv);
      el.addEventListener('mouseleave', onLeave(el));
    });
  }, []);

  // ── Mouse parallax ─────────────────────────────────────────────
  useEffect(() => {
    const onMove = e => {
      const dx = (e.clientX / window.innerWidth  - .5) * 20;
      const dy = (e.clientY / window.innerHeight - .5) * 20;
      document.querySelectorAll('.lp-orb').forEach((o, i) => {
        o.style.transform = `translate(${dx*(i+1)*.4}px,${dy*(i+1)*.4}px)`;
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // ── Scroll reveal ──────────────────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-visible'); });
    }, { threshold: .15 });
    document.querySelectorAll('.lp-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // ── Count-up numbers ───────────────────────────────────────────
  useEffect(() => {
    function countUp(el, target, dur = 2000) {
      const start = Date.now();
      (function tick() {
        const p    = Math.min((Date.now() - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * target) + (el.dataset.suffix || '');
        if (p < 1) requestAnimationFrame(tick);
      })();
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { countUp(e.target, +e.target.dataset.target); obs.unobserve(e.target); }
      });
    }, { threshold: .5 });
    document.querySelectorAll('[data-target]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="lp-root">
      {/* Custom cursor */}
      <div id="lp-cursor" />
      <div id="lp-ring" />

      {/* Aurora background */}
      <canvas ref={canvasRef} className="lp-canvas" />

      {/* ── NAV ── */}
      <nav className="lp-nav">
        <div className="lp-logo">⚡ Streak</div>
        <div className="lp-nav-links">
          <a href="#lp-features">Features</a>
          <a href="#lp-how">How it works</a>
        </div>
        <button className="lp-btn-primary lp-magnetic" onClick={() => navigate('/auth')}>
          <span>Get started →</span>
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-orb lp-orb-3" />
        <div className="lp-badge">
          <span className="lp-badge-dot" />
          AI-Powered Daily Tracker
        </div>
        <h1 className="lp-h1">
          <span className="lp-grad">Track.</span><br />
          <span className="lp-grad">Evolve.</span><br />
          <span className="lp-grad">Dominate.</span>
        </h1>
        <p className="lp-hero-sub">
          The most intelligent daily tracker for gym nutrition and finances.
          Powered by Groq AI — not guesses.
        </p>
        <div className="lp-hero-actions">
          <button className="lp-btn-primary lp-magnetic" onClick={() => navigate('/auth')}>
            <span>Start your streak →</span>
          </button>
          <a href="#lp-features" className="lp-btn-ghost lp-magnetic">See features</a>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="lp-stats-strip">
        <div className="lp-stats-inner">
          {[
            { target: 2800, suffix: ' kcal', label: 'tracked daily avg' },
            { target: 98,   suffix: '%',     label: 'AI accuracy on macros' },
            { target: 30,   suffix: ' days', label: 'streak records broken' },
          ].map((s, i) => (
            <div key={i} className={`lp-reveal lp-reveal-d${i}`}>
              <span className="lp-stat-num" data-target={s.target} data-suffix={s.suffix}>0</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="lp-features" className="lp-features">
        <div className="lp-features-header">
          <div>
            <div className="lp-section-label lp-reveal">What Streak offers</div>
            <h2 className="lp-section-title lp-reveal lp-reveal-d1">
              Everything you need.<br />Nothing you don't.
            </h2>
          </div>
          <p className="lp-section-sub lp-reveal lp-reveal-d2">
            Three powerful modules working in harmony — gym, nutrition, and finance — all in one intelligent platform.
          </p>
        </div>
        <div className="lp-feat-grid">
          {[
            { icon:'🏋️', color:'violet', title:'Gym & Nutrition', desc:"Log meals naturally in plain language. Groq AI knows every food — from boiled eggs to medu vada — with pin-point macro accuracy." },
            { icon:'💰', color:'cyan',   title:'Money Tracker',   desc:"Tell it what you spent. AI categorises, calculates savings rate, and gives you a clear picture of your financial health every month." },
            { icon:'📊', color:'emerald',title:'Daily Analytics', desc:"Visual trends, weekly summaries, streak tracking, and personalised AI recommendations — beautifully presented on your dashboard." },
          ].map((f, i) => (
            <div key={i} className={`lp-feat-card lp-fc-${f.color} lp-reveal lp-reveal-d${i}`}>
              <div className={`lp-feat-icon lp-fi-${f.color}`}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <div className={`lp-feat-glow lp-fg-${f.color}`} />
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="lp-how" className="lp-how">
        <div className="lp-how-header lp-reveal">
          <div className="lp-section-label">Simple by design</div>
          <h2 className="lp-section-title" style={{ margin: 0 }}>How it works</h2>
        </div>
        <div className="lp-steps">
          {[
            { icon:'🔐', title:'Create your profile',    desc:"Enter your physical stats and goals. Our engine calculates your personalised macro targets instantly." },
            { icon:'💬', title:'Log in plain language',  desc:'Type "3 wada, 250ml milk, 8 almonds" and Groq AI returns exact calories, protein, carbs and fats.' },
            { icon:'🚀', title:'Watch your streaks grow', desc:"Daily progress, weekly trends, and AI coaching keep you consistent and on track toward your goals." },
          ].map((s, i) => (
            <div key={i} className={`lp-step lp-reveal lp-reveal-d${i}`}>
              <div className="lp-step-num">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta-bg" />
        <h2 className="lp-cta-title lp-reveal lp-grad">Ready to build<br />your streak?</h2>
        <p className="lp-cta-sub lp-reveal lp-reveal-d1">Join thousands who track smarter, not harder.</p>
        <button className="lp-btn-primary lp-btn-xl lp-magnetic lp-reveal lp-reveal-d2" onClick={() => navigate('/auth')}>
          <span>Start free — no credit card →</span>
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <p>© 2026 Streak · Built with ⚡ and Groq AI</p>
      </footer>
    </div>
  );
}
