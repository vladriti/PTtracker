import { useState, useCallback, useRef } from "react";

const GOOGLE_FONT = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap";

const START_DATE = new Date("2026-06-04");
const SESSIONS_PER_BLOCK = 8;
const PRICE_RON = 400;

function getTueThuSchedule(from, totalSessions) {
  const dates = [];
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (dates.length < totalSessions) {
    const day = d.getDay();
    if (day === 2 || day === 4) dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function dateKey(d) { return d.toISOString().slice(0, 10); }
function fmtShort(d) { return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
function fmtDay(d) { return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
function fmtShortStr(str) { return new Date(str + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
function fmtDayStr(str) { return new Date(str + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }

const STYLES = `
@import url('${GOOGLE_FONT}');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg: #0a0a0a; --surface: #141414; --surface2: #1e1e1e; --surface3: #282828;
  --accent: #c8f542; --accent2: #e8ff6a;
  --text: #f0f0f0; --text2: #888; --text3: #555;
  --red: #ff4d4d; --blue: #60a5fa; --orange: #fb923c; --amber: #ffc832;
  --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
  --radius: 16px; --radius-sm: 10px;
}
body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; -webkit-font-smoothing: antialiased; }
.app { max-width: 420px; margin: 0 auto; padding: 0 0 80px; min-height: 100vh; }
.nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 20px 16px; position: sticky; top: 0; background: var(--bg); z-index: 10; border-bottom: 1px solid var(--border); }
.nav-logo { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: .05em; color: var(--accent); text-transform: uppercase; }
.nav-date { font-size: 13px; color: var(--text2); }
.tabs { display: flex; gap: 4px; padding: 12px 20px; background: var(--bg); }
.tab { flex: 1; padding: 9px 0; border-radius: var(--radius-sm); border: 1px solid var(--border); background: transparent; color: var(--text2); font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; cursor: pointer; transition: all .18s; }
.tab.active { background: var(--accent); color: #0a0a0a; border-color: var(--accent); font-weight: 600; }
.hero { padding: 20px 20px 12px; }
.hero-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.hero-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 16px; }
.hero-card.accent { background: var(--accent); border-color: var(--accent); }
.hero-label { font-size: 11px; font-weight: 500; letter-spacing: .07em; text-transform: uppercase; color: var(--text2); margin-bottom: 8px; }
.hero-card.accent .hero-label { color: #3a5000; }
.hero-num { font-family: 'Barlow Condensed', sans-serif; font-size: 40px; font-weight: 800; line-height: 1; color: var(--text); }
.hero-card.accent .hero-num { color: #0a0a0a; }
.hero-sub { font-size: 12px; color: var(--text3); margin-top: 4px; }
.hero-card.accent .hero-sub { color: #3a5000; }
.streak-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 18px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
.streak-left { display: flex; align-items: center; gap: 12px; }
.streak-flame { font-size: 28px; line-height: 1; }
.streak-num { font-family: 'Barlow Condensed', sans-serif; font-size: 36px; font-weight: 800; color: var(--orange); line-height: 1; }
.streak-label { font-size: 12px; color: var(--text2); margin-top: 2px; }
.streak-best { font-size: 12px; color: var(--text3); text-align: right; }
.streak-best span { display: block; font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 700; color: var(--text2); }
.ring-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; display: flex; align-items: center; gap: 20px; margin-bottom: 10px; }
.ring-wrap { flex-shrink: 0; position: relative; width: 72px; height: 72px; }
.ring-wrap svg { transform: rotate(-90deg); }
circle.bg { fill: none; stroke: var(--surface3); stroke-width: 5; }
circle.fg { fill: none; stroke: var(--accent); stroke-width: 5; stroke-linecap: round; transition: stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1); }
.ring-pct { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; color: var(--accent); }
.ring-title { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 4px; }
.ring-body { font-size: 13px; color: var(--text2); line-height: 1.5; }
.ring-body strong { color: var(--text); font-weight: 500; }
.next-banner { margin: 0 20px 10px; background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius); padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; }
.next-label { font-size: 11px; text-transform: uppercase; letter-spacing: .07em; color: var(--text3); margin-bottom: 3px; font-weight: 500; }
.next-date { font-size: 16px; font-weight: 500; color: var(--text); }
.next-pill { background: rgba(200,245,66,0.12); color: var(--accent); font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px; }
.blocks-section { padding: 0 20px; }
.section-head { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--text3); margin: 16px 0 10px; }
.block-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 10px; overflow: hidden; transition: border-color .2s; }
.block-card.active-block { border-color: var(--border2); }
.block-top { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px 10px; }
.block-name { font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: .04em; color: var(--text); }
.badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; letter-spacing: .04em; text-transform: uppercase; }
.badge-due { background: rgba(255,200,50,0.15); color: var(--amber); }
.badge-active { background: rgba(96,165,250,0.15); color: var(--blue); }
.badge-upcoming { background: var(--surface3); color: var(--text3); }
.badge-paid { background: rgba(200,245,66,0.15); color: var(--accent); }
.dots-row { display: flex; gap: 5px; padding: 2px 16px 12px; flex-wrap: wrap; }
.s-dot { width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid var(--surface3); background: transparent; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: var(--text3); cursor: pointer; transition: all .15s; font-family: 'DM Sans', sans-serif; }
.s-dot:hover { border-color: var(--border2); color: var(--text2); transform: scale(1.05); }
.s-dot.done { background: var(--accent); border-color: var(--accent); color: #0a0a0a; }
.s-dot.skipped { background: var(--red); border-color: var(--red); color: #fff; }
.s-dot.next { border-color: var(--blue); color: var(--blue); background: rgba(96,165,250,0.1); }
.s-dot.rescheduled { border-color: var(--orange); color: var(--orange); background: rgba(251,146,60,0.1); }
.s-dot.rescheduled.done { background: var(--accent); border-color: var(--accent); color: #0a0a0a; box-shadow: 0 0 0 2px var(--orange); }
.s-dot.selected { outline: 2px solid var(--accent); outline-offset: 2px; }
.block-footer { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-top: 1px solid var(--border); }
.block-range { font-size: 12px; color: var(--text3); }
.pay-btn { padding: 7px 16px; border-radius: 20px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--accent); background: transparent; color: var(--accent); transition: all .15s; }
.pay-btn:hover { background: var(--accent); color: #0a0a0a; }
.pay-btn.undo { border-color: var(--text3); color: var(--text3); }
.pay-btn.undo:hover { border-color: var(--red); color: var(--red); background: rgba(255,77,77,0.08); }
.sess-editor { margin: 0 16px 12px; background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius-sm); padding: 14px; animation: slideIn .15s ease; }
@keyframes slideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
.sess-editor-title { font-size: 12px; font-weight: 500; color: var(--text2); margin-bottom: 10px; }
.sess-editor-title span { color: var(--text); }
.editor-row { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 10px; }
.e-btn { padding: 6px 13px; border-radius: 20px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border2); background: transparent; color: var(--text2); transition: all .13s; white-space: nowrap; }
.e-btn.e-done { border-color: var(--accent); color: var(--accent); }
.e-btn.e-done:hover, .e-btn.e-done.active { background: var(--accent); color: #0a0a0a; }
.e-btn.e-skip { border-color: var(--red); color: var(--red); }
.e-btn.e-skip:hover, .e-btn.e-skip.active { background: var(--red); color: #fff; }
.e-btn.e-clear { border-color: var(--text3); color: var(--text3); }
.e-btn.e-clear:hover { border-color: var(--text2); color: var(--text2); }
.e-date-wrap { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
.e-date-label { font-size: 11px; color: var(--text3); white-space: nowrap; }
.e-date-input { flex: 1; background: var(--surface3); border: 1px solid var(--border2); border-radius: 8px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 6px 10px; outline: none; color-scheme: dark; min-width: 0; }
.e-date-input:focus { border-color: var(--accent); }
.e-date-set { padding: 6px 12px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--orange); background: transparent; color: var(--orange); transition: all .13s; white-space: nowrap; }
.e-date-set:hover { background: var(--orange); color: #0a0a0a; }
.note-area { width: 100%; background: var(--surface3); border: 1px solid var(--border2); border-radius: 8px; color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 8px 10px; outline: none; resize: none; min-height: 56px; line-height: 1.5; }
.note-area:focus { border-color: var(--accent); }
.note-area::placeholder { color: var(--text3); }
.note-label { font-size: 10px; color: var(--text3); margin-bottom: 4px; letter-spacing: .04em; text-transform: uppercase; }
.note-hint { font-size: 10px; color: var(--text3); display: flex; justify-content: space-between; margin-top: 4px; }
.add-block-btn { width: 100%; padding: 13px; border-radius: var(--radius); border: 1.5px dashed var(--border2); background: transparent; color: var(--text3); font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; transition: all .18s; margin-top: 4px; }
.add-block-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(200,245,66,0.04); }
.history-section { padding: 0 20px; }
.history-empty { text-align: center; padding: 60px 20px; color: var(--text3); font-size: 14px; }
.h-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 13px 0; border-bottom: 1px solid var(--border); gap: 10px; }
.h-date { font-size: 14px; color: var(--text); }
.h-sub { font-size: 12px; color: var(--text3); margin-top: 2px; }
.h-note { font-size: 12px; color: var(--text2); margin-top: 4px; font-style: italic; }
.h-badge { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: .04em; white-space: nowrap; flex-shrink: 0; margin-top: 2px; }
.h-done { background: rgba(200,245,66,0.12); color: var(--accent); }
.h-skipped { background: rgba(255,77,77,0.12); color: var(--red); }
.h-payment { background: rgba(200,245,66,0.2); color: var(--accent); }
.h-rescheduled { background: rgba(251,146,60,0.12); color: var(--orange); }
.settings-section { padding: 0 20px; }
.settings-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; margin-bottom: 10px; margin-top: 4px; }
.settings-title { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text); margin-bottom: 6px; }
.settings-desc { font-size: 13px; color: var(--text2); margin-bottom: 14px; line-height: 1.5; }
.settings-btn { width: 100%; padding: 12px; border-radius: var(--radius-sm); font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; transition: all .15s; border: 1.5px solid var(--border2); background: transparent; color: var(--text2); margin-bottom: 8px; }
.settings-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(200,245,66,0.04); }
.settings-btn.danger { border-color: var(--text3); color: var(--text3); }
.settings-btn.danger:hover { border-color: var(--red); color: var(--red); background: rgba(255,77,77,0.06); }
.settings-btn:last-child { margin-bottom: 0; }
.import-area { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius-sm); color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 10px 14px; outline: none; resize: none; min-height: 90px; margin-bottom: 8px; color-scheme: dark; }
.import-area:focus { border-color: var(--accent); }
.import-area::placeholder { color: var(--text3); }
.toast-global { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--surface2); border: 1px solid var(--border2); border-radius: 20px; padding: 10px 20px; font-size: 13px; color: var(--accent); z-index: 100; pointer-events: none; animation: fadeUp .2s ease; white-space: nowrap; }
@keyframes fadeUp { from { opacity: 0; transform: translateX(-50%) translateY(8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
.legend-row { display: flex; gap: 14px; padding: 0 20px 4px; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text3); }
.legend-dot { width: 9px; height: 9px; border-radius: 50%; }
.log-section { padding: 0 20px; }
.log-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 12px; }
.log-title { font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--text); margin-bottom: 14px; }
.log-label { font-size: 12px; color: var(--text2); margin-bottom: 6px; font-weight: 500; }
.log-input { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius-sm); color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px; padding: 10px 14px; outline: none; margin-bottom: 12px; -webkit-appearance: none; color-scheme: dark; }
.log-input:focus { border-color: var(--accent); }
.log-type-row { display: flex; gap: 8px; margin-bottom: 14px; }
.type-btn { flex: 1; padding: 9px 0; border-radius: var(--radius-sm); border: 1.5px solid var(--border2); background: transparent; color: var(--text2); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; }
.type-btn.sel-done { border-color: var(--accent); background: rgba(200,245,66,0.1); color: var(--accent); }
.type-btn.sel-skip { border-color: var(--red); background: rgba(255,77,77,0.1); color: var(--red); }
.submit-btn { width: 100%; padding: 13px; border-radius: var(--radius-sm); border: none; background: var(--accent); color: #0a0a0a; font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; cursor: pointer; transition: all .15s; }
.submit-btn:hover { background: var(--accent2); }
.submit-btn:disabled { opacity: .4; cursor: default; }
.toast { margin-top: 10px; font-size: 13px; color: var(--accent); min-height: 20px; text-align: center; }

/* ── Weight tab ─────────────────────────────────────────────────────────── */
.weight-section { padding: 0 20px; }
.w-hero-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.w-hero-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 16px; }
.w-hero-card.accent { background: var(--accent); border-color: var(--accent); }
.w-hero-card .hero-label { color: var(--text2); }
.w-hero-card.accent .hero-label { color: #3a5000; }
.w-hero-card .hero-num { color: var(--text); }
.w-hero-card.accent .hero-num { color: #0a0a0a; }
.w-change-pos { font-size: 12px; color: #ff6b6b; margin-top: 4px; }
.w-change-neg { font-size: 12px; color: var(--accent); margin-top: 4px; }
.w-change-flat { font-size: 12px; color: var(--text3); margin-top: 4px; }
.w-hero-card.accent .w-change-pos { color: #a03000; }
.w-hero-card.accent .w-change-neg { color: #3a5000; }
.w-hero-card.accent .w-change-flat { color: #3a5000; }
.trend-banner { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius); padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.trend-label { font-size: 11px; text-transform: uppercase; letter-spacing: .07em; color: var(--text3); margin-bottom: 3px; font-weight: 500; }
.trend-val { font-size: 15px; font-weight: 500; color: var(--text); }
.trend-pill { font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px; }
.trend-up { background: rgba(255,77,77,0.12); color: #ff6b6b; }
.trend-down { background: rgba(200,245,66,0.12); color: var(--accent); }
.trend-flat { background: var(--surface3); color: var(--text3); }
.w-chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 12px 12px; margin-bottom: 10px; }
.w-chart-empty { text-align: center; padding: 40px 20px; color: var(--text3); font-size: 13px; }
.w-log-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; margin-bottom: 10px; }
.w-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid var(--border); gap: 10px; }
.w-row:last-child { border-bottom: none; }
.w-date { font-size: 14px; color: var(--text); }
.w-note { font-size: 12px; color: var(--text2); margin-top: 4px; font-style: italic; }
.w-kg-num { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; color: var(--accent); }
.w-kg-unit { font-size: 10px; color: var(--text3); }
.w-delta-pos { font-size: 11px; font-weight: 500; color: #ff6b6b; text-align: right; margin-top: 3px; }
.w-delta-neg { font-size: 11px; font-weight: 500; color: var(--accent); text-align: right; margin-top: 3px; }
.w-delta-flat { font-size: 11px; font-weight: 500; color: var(--text3); text-align: right; margin-top: 3px; }
.w-delete-btn { background: transparent; border: none; color: var(--text3); font-size: 14px; cursor: pointer; padding: 2px 4px; transition: color .15s; flex-shrink: 0; align-self: center; }
.w-delete-btn:hover { color: var(--red); }
`;

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; }
    catch { return initial; }
  });
  const set = useCallback((v) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, set];
}

function computeStreak(state, numBlocks) {
  const doneDates = Object.keys(state.done).sort();
  if (doneDates.length === 0) return { current: 0, best: 0 };
  const allDates = getTueThuSchedule(START_DATE, SESSIONS_PER_BLOCK * numBlocks);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const outcomes = [];
  for (let bi = 0; bi < numBlocks; bi++) {
    for (let si = 0; si < SESSIONS_PER_BLOCK; si++) {
      const slotKey = `${bi}-${si}`;
      let d = allDates[bi * SESSIONS_PER_BLOCK + si];
      if (state.reschedule?.[slotKey]) d = new Date(state.reschedule[slotKey] + "T00:00:00");
      if (d > today) continue;
      const k = dateKey(d);
      if (state.done[k]) outcomes.push("done");
      else if (state.skipped[k]) outcomes.push("skip");
      else outcomes.push("none");
    }
  }
  let current = 0, best = 0, run = 0;
  for (const o of outcomes) {
    if (o === "done") { run++; if (run > best) best = run; }
    else { run = 0; }
  }
  current = run;
  return { current, best };
}

// ── Weight chart (vanilla Canvas, no external dep) ───────────────────────
function WeightChart({ entries }) {
  const canvasRef = useRef(null);

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));

  // Draw on every render when sorted.length >= 2
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || sorted.length < 2) return;
    const W = canvas.offsetWidth || 340;
    const H = 180;
    canvas.width = W * window.devicePixelRatio;
    canvas.height = H * window.devicePixelRatio;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const values = sorted.map(e => e.kg);
    const mn = Math.min(...values), mx = Math.max(...values);
    const pad = Math.max(1, (mx - mn) * 0.35) || 1;
    const yMin = mn - pad, yMax = mx + pad;

    const pl = 44, pr = 12, pt = 12, pb = 28;
    const cw = W - pl - pr, ch = H - pt - pb;

    const xOf = i => pl + (i / (sorted.length - 1)) * cw;
    const yOf = v => pt + (1 - (v - yMin) / (yMax - yMin)) * ch;

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    const ticks = 4;
    for (let t = 0; t <= ticks; t++) {
      const y = pt + (t / ticks) * ch;
      ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(pl + cw, y); ctx.stroke();
      const val = yMax - (t / ticks) * (yMax - yMin);
      ctx.fillStyle = "#555";
      ctx.font = "10px 'DM Sans', sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(val.toFixed(1), pl - 6, y + 3.5);
    }

    // X labels — show first, last, and up to 3 evenly spaced
    ctx.fillStyle = "#555";
    ctx.font = "10px 'DM Sans', sans-serif";
    ctx.textAlign = "center";
    const labelIdxs = new Set([0, sorted.length - 1]);
    if (sorted.length > 4) {
      const step = Math.floor((sorted.length - 1) / 3);
      for (let i = step; i < sorted.length - 1; i += step) labelIdxs.add(i);
    }
    labelIdxs.forEach(i => {
      ctx.fillText(fmtShortStr(sorted[i].date), xOf(i), H - pb + 14);
    });

    // Fill area
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(values[0]));
    for (let i = 1; i < sorted.length; i++) ctx.lineTo(xOf(i), yOf(values[i]));
    ctx.lineTo(xOf(sorted.length - 1), pt + ch);
    ctx.lineTo(xOf(0), pt + ch);
    ctx.closePath();
    ctx.fillStyle = "rgba(200,245,66,0.07)";
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(xOf(0), yOf(values[0]));
    for (let i = 1; i < sorted.length; i++) ctx.lineTo(xOf(i), yOf(values[i]));
    ctx.strokeStyle = "#c8f542";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Dots
    sorted.forEach((e, i) => {
      ctx.beginPath();
      ctx.arc(xOf(i), yOf(e.kg), 4, 0, Math.PI * 2);
      ctx.fillStyle = "#c8f542";
      ctx.fill();
      ctx.strokeStyle = "#0a0a0a";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [sorted]);

  // Use a layout effect via useCallback + ref callback
  const refCallback = useCallback((node) => {
    canvasRef.current = node;
    if (node) {
      // Defer so the DOM has laid out and offsetWidth is real
      setTimeout(draw, 0);
    }
  }, [draw]);

  if (sorted.length < 2) {
    return <div className="w-chart-empty">Log at least 2 entries to see the chart.</div>;
  }

  return (
    <canvas
      ref={refCallback}
      style={{ width: "100%", display: "block" }}
      aria-label="Weight over time chart"
    />
  );
}

// ── Weight tab component ─────────────────────────────────────────────────
function WeightTab() {
  const [weights, setWeights] = useLocalStorage("pt_weights_v1", []);
  const [wDate, setWDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [wKg, setWKg] = useState("");
  const [wNote, setWNote] = useState("");
  const [wToast, setWToast] = useState("");

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0] || null;
  const last = sorted[sorted.length - 1] || null;

  const totalChange = first && last && first.date !== last.date
    ? +(last.kg - first.kg).toFixed(1)
    : null;

  // 7-day trend
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recent = sorted.filter(w => new Date(w.date + "T00:00:00") >= sevenDaysAgo);
  const trend = recent.length >= 2
    ? +(recent[recent.length - 1].kg - recent[0].kg).toFixed(1)
    : null;

  function logWeight() {
    if (!wDate || !wKg) return;
    const kg = parseFloat(parseFloat(wKg).toFixed(1));
    if (isNaN(kg) || kg < 20 || kg > 300) return;
    const updated = weights.filter(w => w.date !== wDate);
    updated.push({ date: wDate, kg, note: wNote.trim() });
    setWeights(updated);
    setWKg("");
    setWNote("");
    setWToast(`Logged ${kg.toFixed(1)} kg for ${fmtDayStr(wDate)}`);
    setTimeout(() => setWToast(""), 3000);
  }

  function deleteEntry(date, kg) {
    setWeights(weights.filter(w => !(w.date === date && w.kg === kg)));
  }

  const histSorted = [...weights].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="weight-section">
      <div className="section-head" style={{ marginTop: 16 }}>Stats</div>

      <div className="w-hero-row">
        <div className="w-hero-card">
          <div className="hero-label">Start weight</div>
          <div className="hero-num" style={{ fontSize: 32 }}>
            {first ? first.kg.toFixed(1) : "—"}
          </div>
          <div className="hero-sub">{first ? fmtShortStr(first.date) : "No entries yet"}</div>
        </div>
        <div className="w-hero-card accent">
          <div className="hero-label">Current</div>
          <div className="hero-num" style={{ fontSize: 32 }}>
            {last ? last.kg.toFixed(1) : "—"}
          </div>
          {last && (
            totalChange === null
              ? <div className="w-change-flat">First entry</div>
              : totalChange === 0
                ? <div className="w-change-flat">No change</div>
                : totalChange < 0
                  ? <div className="w-change-neg">{totalChange} kg from start</div>
                  : <div className="w-change-pos">+{totalChange} kg from start</div>
          )}
        </div>
      </div>

      {trend !== null && (
        <div className="trend-banner">
          <div>
            <div className="trend-label">7-day trend</div>
            <div className="trend-val">
              {trend === 0 ? "No change this week" : trend < 0 ? "Trending down" : "Trending up"}
            </div>
          </div>
          <div className={`trend-pill ${trend === 0 ? "trend-flat" : trend < 0 ? "trend-down" : "trend-up"}`}>
            {trend === 0 ? "Stable" : trend < 0 ? `${trend} kg` : `+${trend} kg`}
          </div>
        </div>
      )}

      <div className="section-head">Chart</div>
      <div className="w-chart-card">
        <WeightChart entries={weights} />
      </div>

      <div className="section-head">Log weight</div>
      <div className="w-log-card">
        <div className="log-label">Date</div>
        <input
          type="date"
          className="log-input"
          value={wDate}
          onChange={e => setWDate(e.target.value)}
        />
        <div className="log-label">Weight (kg)</div>
        <input
          type="number"
          className="log-input"
          value={wKg}
          onChange={e => setWKg(e.target.value)}
          placeholder="e.g. 74.5"
          step="0.1"
          min="20"
          max="300"
        />
        <div className="log-label">Note (optional)</div>
        <textarea
          className="note-area"
          style={{ marginBottom: 12 }}
          placeholder="e.g. Morning, after workout…"
          value={wNote}
          onChange={e => setWNote(e.target.value)}
          maxLength={150}
        />
        <button className="submit-btn" onClick={logWeight} disabled={!wDate || !wKg}>
          Save entry
        </button>
        <div className="toast">{wToast}</div>
      </div>

      <div className="section-head">Log</div>
      {histSorted.length === 0 && (
        <div className="history-empty">No entries yet. Log your first weight!</div>
      )}
      {histSorted.map((w, i) => {
        // Find previous entry in chronological order
        const idx = sorted.findIndex(x => x.date === w.date && x.kg === w.kg);
        const prev = idx > 0 ? sorted[idx - 1] : null;
        const delta = prev ? +(w.kg - prev.kg).toFixed(1) : null;
        return (
          <div key={`${w.date}-${w.kg}-${i}`} className="w-row">
            <div style={{ flex: 1 }}>
              <div className="w-date">{fmtDayStr(w.date)}</div>
              {w.note && <div className="w-note">"{w.note}"</div>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ textAlign: "right" }}>
                <div className="w-kg-num">{w.kg.toFixed(1)}</div>
                <div className="w-kg-unit">kg</div>
                {delta !== null && (
                  delta === 0
                    ? <div className="w-delta-flat">±0.0</div>
                    : delta < 0
                      ? <div className="w-delta-neg">{delta}</div>
                      : <div className="w-delta-pos">+{delta}</div>
                )}
              </div>
              <button
                className="w-delete-btn"
                onClick={() => deleteEntry(w.date, w.kg)}
                title="Delete entry"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main app ─────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("overview");
  const [state, setState] = useLocalStorage("pt_tracker_v4", {
    done: {}, skipped: {}, paid: {}, reschedule: {}, notes: {}, numBlocks: 1
  });
  const [openSlot, setOpenSlot] = useState(null);
  const [pendingDate, setPendingDate] = useState("");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [logType, setLogType] = useState("done");
  const [logNote, setLogNote] = useState("");
  const [logToast, setLogToast] = useState("");
  const [globalToast, setGlobalToast] = useState("");
  const [importText, setImportText] = useState("");

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const numBlocks = state.numBlocks || 1;
  const allDates = getTueThuSchedule(START_DATE, SESSIONS_PER_BLOCK * numBlocks);

  const blocks = Array.from({ length: numBlocks }, (_, bi) => ({
    id: bi,
    sessions: allDates.slice(bi * SESSIONS_PER_BLOCK, (bi + 1) * SESSIONS_PER_BLOCK),
  }));

  function effectiveDate(bi, si) {
    const key = `${bi}-${si}`;
    if (state.reschedule?.[key]) return new Date(state.reschedule[key] + "T00:00:00");
    return allDates[bi * SESSIONS_PER_BLOCK + si];
  }
  function effectiveDateKey(bi, si) { return dateKey(effectiveDate(bi, si)); }

  const totalDone = Object.keys(state.done).length;
  const totalSkipped = Object.keys(state.skipped).length;
  const totalSessions = SESSIONS_PER_BLOCK * numBlocks;
  const totalPaid = Object.keys(state.paid).length * PRICE_RON;
  const pct = totalSessions > 0 ? Math.round((totalDone / totalSessions) * 100) : 0;
  const circumference = 2 * Math.PI * 30;
  const dashOffset = circumference - (pct / 100) * circumference;
  const streak = computeStreak(state, numBlocks);

  const nextSession = (() => {
    for (let bi = 0; bi < numBlocks; bi++)
      for (let si = 0; si < SESSIONS_PER_BLOCK; si++) {
        const k = effectiveDateKey(bi, si), d = effectiveDate(bi, si);
        if (!state.done[k] && !state.skipped[k] && d >= today) return d;
      }
    return null;
  })();

  function update(patch) { setState({ ...state, ...patch }); }

  function showToast(msg) {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(""), 2800);
  }

  function markStatus(bi, si, status) {
    const k = effectiveDateKey(bi, si);
    const done = { ...state.done }, skipped = { ...state.skipped };
    if (status === "done") { done[k] = true; delete skipped[k]; }
    else if (status === "skipped") { skipped[k] = true; delete done[k]; }
    else { delete done[k]; delete skipped[k]; }
    update({ done, skipped });
  }

  function setReschedule(bi, si, dateStr) {
    const slotKey = `${bi}-${si}`;
    const oldK = effectiveDateKey(bi, si);
    const done = { ...state.done }, skipped = { ...state.skipped };
    delete done[oldK]; delete skipped[oldK];
    const reschedule = { ...state.reschedule, [slotKey]: dateStr };
    update({ done, skipped, reschedule });
    setPendingDate(""); setOpenSlot(null);
  }

  function clearReschedule(bi, si) {
    const slotKey = `${bi}-${si}`;
    const oldK = effectiveDateKey(bi, si);
    const done = { ...state.done }, skipped = { ...state.skipped };
    delete done[oldK]; delete skipped[oldK];
    const reschedule = { ...state.reschedule };
    delete reschedule[slotKey];
    update({ done, skipped, reschedule });
  }

  function saveNote(bi, si, text) {
    const k = effectiveDateKey(bi, si);
    const notes = { ...state.notes };
    if (text.trim()) notes[k] = text.trim();
    else delete notes[k];
    update({ notes });
  }

  function getBlockStatus(block, bi) {
    const doneC = block.sessions.map((_, si) => effectiveDateKey(bi, si)).filter(k => state.done[k]).length;
    const skipC = block.sessions.map((_, si) => effectiveDateKey(bi, si)).filter(k => state.skipped[k]).length;
    const isPaid = !!state.paid[bi];
    const allPast = block.sessions.map((_, si) => effectiveDate(bi, si)).every(d => d < today);
    const started = doneC + skipC > 0 || block.sessions[0] <= today;
    if (!started) return "upcoming";
    if (isPaid) return "paid";
    if (doneC + skipC === SESSIONS_PER_BLOCK || allPast) return "due";
    return "active";
  }

  function showOnOverview(block, bi) {
    const s = getBlockStatus(block, bi);
    if (s === "active" || s === "due") return true;
    if (s === "paid") {
      for (let si = 0; si < SESSIONS_PER_BLOCK; si++) {
        const k = effectiveDateKey(bi, si);
        if (!state.done[k] && !state.skipped[k]) return true;
      }
    }
    return false;
  }

  function toggleOpen(bi, si) {
    const key = `${bi}-${si}`;
    if (openSlot === key) { setOpenSlot(null); setPendingDate(""); }
    else { setOpenSlot(key); setPendingDate(effectiveDateKey(bi, si)); }
  }

  function handleExport() {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pt-tracker-backup-${dateKey(today)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup downloaded!");
  }

  function handleImport() {
    try {
      const parsed = JSON.parse(importText);
      if (typeof parsed !== "object" || !parsed.done) throw new Error("Invalid format");
      setState(parsed);
      setImportText("");
      showToast("Data restored successfully!");
    } catch {
      showToast("Invalid backup file — paste the full JSON content.");
    }
  }

  function submitLog() {
    if (!logDate) return;
    const done = { ...state.done }, skipped = { ...state.skipped }, notes = { ...state.notes };
    if (logType === "done") { done[logDate] = true; delete skipped[logDate]; }
    else { skipped[logDate] = true; delete done[logDate]; }
    if (logNote.trim()) notes[logDate] = logNote.trim();
    update({ done, skipped, notes });
    setLogToast(`Session on ${fmtDay(new Date(logDate + "T00:00:00"))} logged.`);
    setLogNote("");
    setTimeout(() => setLogToast(""), 3000);
  }

  const BlockCard = ({ block, bi, highlight }) => {
    const status = getBlockStatus(block, bi);
    const doneC = block.sessions.map((_, si) => effectiveDateKey(bi, si)).filter(k => state.done[k]).length;
    const skipC = block.sessions.map((_, si) => effectiveDateKey(bi, si)).filter(k => state.skipped[k]).length;
    const badgeMap = { paid: "badge-paid", due: "badge-due", active: "badge-active", upcoming: "badge-upcoming" };
    const labelMap = { paid: "Paid ✓", due: "Payment due", active: "In progress", upcoming: "Upcoming" };
    const isPaid = !!state.paid[bi];

    return (
      <div className={`block-card ${highlight ? "active-block" : ""}`}>
        <div className="block-top">
          <div className="block-name">Block {bi + 1}</div>
          <div className={`badge ${badgeMap[status]}`}>{labelMap[status]}</div>
        </div>
        <div className="dots-row">
          {block.sessions.map((_, si) => {
            const slotKey = `${bi}-${si}`, k = effectiveDateKey(bi, si), effD = effectiveDate(bi, si);
            const isDone = !!state.done[k], isSkip = !!state.skipped[k];
            const isRescheduled = !!state.reschedule?.[slotKey];
            const isNext = nextSession && dateKey(effD) === dateKey(nextSession);
            const isOpen = openSlot === slotKey;
            let cls = isNext ? "next" : "";
            if (isDone) cls = "done"; if (isSkip) cls = "skipped";
            if (isRescheduled) cls += " rescheduled"; if (isOpen) cls += " selected";
            return (
              <div key={si} className={`s-dot ${cls}`} onClick={() => toggleOpen(bi, si)} title={isRescheduled ? `Rescheduled: ${fmtDay(effD)}` : fmtDay(effD)}>
                {si + 1}
              </div>
            );
          })}
        </div>

        {block.sessions.map((_, si) => {
          const slotKey = `${bi}-${si}`;
          if (openSlot !== slotKey) return null;
          const k = effectiveDateKey(bi, si), effD = effectiveDate(bi, si);
          const isDone = !!state.done[k], isSkip = !!state.skipped[k];
          const isRescheduled = !!state.reschedule?.[slotKey];
          const note = state.notes?.[k] || "";
          return (
            <div key={si} className="sess-editor">
              <div className="sess-editor-title">
                Session {si + 1} — <span>{isRescheduled ? `rescheduled to ${fmtDay(effD)}` : fmtDay(effD)}</span>
              </div>
              <div className="editor-row">
                <button className={`e-btn e-done ${isDone ? "active" : ""}`} onClick={() => markStatus(bi, si, isDone ? "clear" : "done")}>
                  {isDone ? "Undo done" : "Mark done"}
                </button>
                <button className={`e-btn e-skip ${isSkip ? "active" : ""}`} onClick={() => markStatus(bi, si, isSkip ? "clear" : "skipped")}>
                  {isSkip ? "Undo skip" : "Mark skipped"}
                </button>
                {isRescheduled && (
                  <button className="e-btn e-clear" onClick={() => clearReschedule(bi, si)}>Reset date</button>
                )}
              </div>
              <div className="e-date-wrap">
                <span className="e-date-label">Reschedule to:</span>
                <input type="date" className="e-date-input" value={pendingDate} onChange={e => setPendingDate(e.target.value)} />
                <button className="e-date-set" onClick={() => pendingDate && setReschedule(bi, si, pendingDate)}>Set</button>
              </div>
              <div className="note-label">Note</div>
              <textarea
                className="note-area"
                placeholder="e.g. Trainer was late, focused on legs…"
                value={note}
                onChange={e => saveNote(bi, si, e.target.value)}
                maxLength={200}
              />
              <div className="note-hint"><span /><span>{note.length}/200</span></div>
            </div>
          );
        })}

        <div className="block-footer">
          <div className="block-range">
            {fmtShort(block.sessions[0])} – {fmtShort(block.sessions[SESSIONS_PER_BLOCK - 1])}
            <br /><span style={{ fontSize: 11 }}>{doneC} done · {skipC} skipped</span>
          </div>
          {isPaid ? (
            <button className="pay-btn undo" onClick={() => { const p = { ...state.paid }; delete p[bi]; update({ paid: p }); }}>
              Undo payment
            </button>
          ) : (
            <button className="pay-btn" onClick={() => update({ paid: { ...state.paid, [bi]: true } })}>
              Mark paid · 400 RON
            </button>
          )}
        </div>
      </div>
    );
  };

  const history = [];
  for (let bi = 0; bi < numBlocks; bi++) {
    for (let si = 0; si < SESSIONS_PER_BLOCK; si++) {
      const k = effectiveDateKey(bi, si), d = effectiveDate(bi, si);
      const isR = !!state.reschedule?.[`${bi}-${si}`];
      const note = state.notes?.[k];
      if (state.done[k]) history.push({ date: d, type: "done", block: bi + 1, rescheduled: isR, note });
      if (state.skipped[k]) history.push({ date: d, type: "skipped", block: bi + 1, rescheduled: isR, note });
    }
    if (state.paid[bi]) history.push({ date: blocks[bi].sessions[0], type: "payment", block: bi + 1, amount: PRICE_RON });
  }
  history.sort((a, b) => b.date - a.date);

  const TABS = ["overview", "blocks", "history", "weight", "settings"];

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-logo">PT Tracker</div>
          <div className="nav-date">{today.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long" })}</div>
        </nav>
        <div className="tabs">
          {TABS.map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setOpenSlot(null); }}>
              {t === "settings" ? "⚙" : t === "weight" ? "Weight" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <>
            <div className="hero">
              <div className="hero-row">
                <div className="hero-card accent">
                  <div className="hero-label">Sessions done</div>
                  <div className="hero-num">{totalDone}</div>
                  <div className="hero-sub">of {totalSessions} planned</div>
                </div>
                <div className="hero-card">
                  <div className="hero-label">Total paid</div>
                  <div className="hero-num" style={{ fontSize: 28, paddingTop: 4 }}>{totalPaid}</div>
                  <div className="hero-sub">RON · {Math.round(totalPaid / PRICE_RON)} block{totalPaid / PRICE_RON !== 1 ? "s" : ""}</div>
                </div>
              </div>
              <div className="streak-card">
                <div className="streak-left">
                  <div className="streak-flame">{streak.current > 0 ? "🔥" : "💤"}</div>
                  <div>
                    <div className="streak-num">{streak.current}</div>
                    <div className="streak-label">session streak</div>
                  </div>
                </div>
                <div className="streak-best">
                  Best streak
                  <span>{streak.best}</span>
                </div>
              </div>
              <div className="ring-card">
                <div className="ring-wrap">
                  <svg width="72" height="72" viewBox="0 0 72 72">
                    <circle className="bg" cx="36" cy="36" r="30" />
                    <circle className="fg" cx="36" cy="36" r="30" strokeDasharray={circumference} strokeDashoffset={dashOffset} />
                  </svg>
                  <div className="ring-pct">{pct}%</div>
                </div>
                <div>
                  <div className="ring-title">Overall progress</div>
                  <div className="ring-body">
                    <strong>{totalDone}</strong> done · <strong>{totalSkipped}</strong> skipped<br />
                    <strong>{numBlocks}</strong> block{numBlocks !== 1 ? "s" : ""} · <strong>{totalSessions - totalDone - totalSkipped}</strong> remaining
                  </div>
                </div>
              </div>
            </div>
            {nextSession && (
              <div className="next-banner">
                <div>
                  <div className="next-label">Next session</div>
                  <div className="next-date">{fmtDay(nextSession)}</div>
                </div>
                <div className="next-pill">Upcoming</div>
              </div>
            )}
            <div className="blocks-section">
              <div className="section-head">Current block</div>
              {blocks.filter((bl, bi) => showOnOverview(bl, bi))
                .map((bl) => <BlockCard key={bl.id} block={bl} bi={bl.id} highlight />)}
            </div>
          </>
        )}

        {tab === "blocks" && (
          <div className="blocks-section">
            <div className="legend-row" style={{ marginBottom: 10, marginTop: 8 }}>
              <div className="legend-item"><div className="legend-dot" style={{ background: "#c8f542" }} />Done</div>
              <div className="legend-item"><div className="legend-dot" style={{ background: "#ff4d4d" }} />Skipped</div>
              <div className="legend-item"><div className="legend-dot" style={{ border: "1.5px solid #60a5fa", background: "rgba(96,165,250,0.1)" }} />Next</div>
              <div className="legend-item"><div className="legend-dot" style={{ border: "1.5px solid #fb923c", background: "rgba(251,146,60,0.1)" }} />Rescheduled</div>
            </div>
            {blocks.map((bl, bi) => (
              <BlockCard key={bi} block={bl} bi={bi} highlight={["active", "paid"].includes(getBlockStatus(bl, bi))} />
            ))}
            <button className="add-block-btn" onClick={() => update({ numBlocks: numBlocks + 1 })}>
              + Add new block
            </button>
          </div>
        )}

        {tab === "history" && (
          <div className="history-section">
            <div className="section-head" style={{ marginTop: 16 }}>Activity log</div>
            {history.length === 0 && <div className="history-empty">No activity yet. Go crush a session!</div>}
            {history.map((item, i) => (
              <div key={i} className="h-row">
                <div style={{ flex: 1 }}>
                  <div className="h-date">{fmtDay(item.date)}</div>
                  <div className="h-sub">Block {item.block}{item.type === "payment" ? ` · ${item.amount} RON` : ""}{item.rescheduled ? " · rescheduled" : ""}</div>
                  {item.note && <div className="h-note">"{item.note}"</div>}
                </div>
                <div className={`h-badge ${item.type === "done" ? (item.rescheduled ? "h-rescheduled" : "h-done") : item.type === "skipped" ? "h-skipped" : "h-payment"}`}>
                  {item.type === "payment" ? "Paid" : item.rescheduled ? "Moved" : item.type}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "weight" && <WeightTab />}

        {tab === "settings" && (
          <div className="settings-section">
            <div className="section-head" style={{ marginTop: 16 }}>Backup</div>
            <div className="settings-card">
              <div className="settings-title">Export data</div>
              <div className="settings-desc">Download a full backup of all your sessions, payments, notes, and settings as a JSON file. Keep it somewhere safe.</div>
              <button className="settings-btn" onClick={handleExport}>Download backup</button>
            </div>
            <div className="settings-card">
              <div className="settings-title">Import data</div>
              <div className="settings-desc">Paste the contents of a previously exported JSON file below to restore your data. This will overwrite your current data.</div>
              <textarea className="import-area" placeholder='Paste your backup JSON here…' value={importText} onChange={e => setImportText(e.target.value)} />
              <button className="settings-btn" onClick={handleImport} disabled={!importText.trim()}>Restore from backup</button>
            </div>

            <div className="section-head">Quick log</div>
            <div className="settings-card">
              <div className="settings-title">Log a session</div>
              <div className="log-label">Date</div>
              <input type="date" className="log-input" value={logDate} onChange={e => setLogDate(e.target.value)} />
              <div className="log-label">Type</div>
              <div className="log-type-row">
                <button className={`type-btn ${logType === "done" ? "sel-done" : ""}`} onClick={() => setLogType("done")}>Done</button>
                <button className={`type-btn ${logType === "skipped" ? "sel-skip" : ""}`} onClick={() => setLogType("skipped")}>Skipped</button>
              </div>
              <div className="log-label">Note (optional)</div>
              <textarea className="note-area" style={{ marginBottom: 12 }} placeholder="e.g. Great session, worked on squats…" value={logNote} onChange={e => setLogNote(e.target.value)} maxLength={200} />
              <button className="submit-btn" onClick={submitLog} disabled={!logDate}>Save session</button>
              <div className="toast">{logToast}</div>
            </div>
          </div>
        )}

        {globalToast && <div className="toast-global">{globalToast}</div>}
      </div>
    </>
  );
}
