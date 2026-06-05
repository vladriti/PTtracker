import { useState, useCallback, useRef } from "react";

const GOOGLE_FONT = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap";
const START_DATE = new Date("2026-06-04");
const SPB = 8;
const PRICE = 400;

function tueThu(from, n) {
  const a = [], d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (a.length < n) { const w = d.getDay(); if (w === 2 || w === 4) a.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return a;
}
function dk(d) { return d.toISOString().slice(0, 10); }
function fs(d) { return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
function fd(d) { return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }

/* All sections use the same 18px horizontal padding so every tab is identical width */
const STYLES = `
@import url('${GOOGLE_FONT}');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:#0a0a0a; --surface:#141414; --surface2:#1e1e1e; --surface3:#282828;
  --accent:#c8f542; --accent2:#e8ff6a;
  --text:#f0f0f0; --text2:#888; --text3:#555;
  --red:#ff4d4d; --blue:#60a5fa; --orange:#fb923c; --amber:#ffc832;
  --border:rgba(255,255,255,0.07); --border2:rgba(255,255,255,0.12);
  --r:16px; --rs:10px; --p:18px;
}
body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; min-height:100vh; -webkit-font-smoothing:antialiased; }
.app { width:100%; max-width:100%; margin:0; padding-bottom:80px; min-height:100vh; }
.nav { display:flex; justify-content:space-between; align-items:center; padding:20px var(--p) 16px; position:sticky; top:0; background:var(--bg); z-index:10; border-bottom:1px solid var(--border); }
.nav-logo { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:800; letter-spacing:.05em; color:var(--accent); text-transform:uppercase; }
.nav-date { font-size:13px; color:var(--text2); }
.tabs { display:flex; gap:4px; padding:12px var(--p); background:var(--bg); }
.tab { flex:1; padding:9px 0; border-radius:var(--rs); border:1px solid var(--border); background:transparent; color:var(--text2); font-family:'DM Sans',sans-serif; font-size:12px; font-weight:500; cursor:pointer; transition:all .18s; }
.tab.active { background:var(--accent); color:#0a0a0a; border-color:var(--accent); font-weight:600; }

/* Every tab's content gets the same horizontal padding via .pg */
.pg { padding:0 var(--p); width:100%; box-sizing:border-box; display:block; }

.hrow { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:16px 0 10px; width:100%; }
.hc { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:18px 16px; width:100%; min-width:0; }
.hc.ac { background:var(--accent); border-color:var(--accent); }
.hl { font-size:11px; font-weight:500; letter-spacing:.07em; text-transform:uppercase; color:var(--text2); margin-bottom:8px; }
.hc.ac .hl { color:#3a5000; }
.hn { font-family:'Barlow Condensed',sans-serif; font-size:40px; font-weight:800; line-height:1; color:var(--text); }
.hc.ac .hn { color:#0a0a0a; }
.hs { font-size:12px; color:var(--text3); margin-top:4px; }
.hc.ac .hs { color:#3a5000; }

.streak-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:15px 16px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; width:100%; }
.streak-left { display:flex; align-items:center; gap:11px; }
.streak-flame { font-size:26px; line-height:1; }
.streak-num { font-family:'Barlow Condensed',sans-serif; font-size:34px; font-weight:800; color:var(--orange); line-height:1; }
.streak-lbl { font-size:11px; color:var(--text2); margin-top:2px; }
.streak-best { font-size:11px; color:var(--text3); text-align:right; }
.streak-best span { display:block; font-family:'Barlow Condensed',sans-serif; font-size:20px; font-weight:700; color:var(--text2); }

.ring-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:20px; display:flex; align-items:center; gap:20px; margin-bottom:10px; width:100%; }
.ring-wrap { flex-shrink:0; position:relative; width:72px; height:72px; }
.ring-wrap svg { transform:rotate(-90deg); }
circle.bg { fill:none; stroke:var(--surface3); stroke-width:5; }
circle.fg { fill:none; stroke:var(--accent); stroke-width:5; stroke-linecap:round; transition:stroke-dashoffset .6s cubic-bezier(.4,0,.2,1); }
.ring-pct { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:'Barlow Condensed',sans-serif; font-size:18px; font-weight:800; color:var(--accent); }
.ring-title { font-size:14px; font-weight:500; color:var(--text); margin-bottom:4px; }
.ring-body { font-size:13px; color:var(--text2); line-height:1.5; }
.ring-body strong { color:var(--text); font-weight:500; }

.next-banner { background:var(--surface2); border:1px solid var(--border2); border-radius:var(--r); padding:14px 16px; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; width:100%; }
.next-label { font-size:11px; text-transform:uppercase; letter-spacing:.07em; color:var(--text3); margin-bottom:3px; font-weight:500; }
.next-date { font-size:16px; font-weight:500; color:var(--text); }
.next-pill { background:rgba(200,245,66,0.12); color:var(--accent); font-size:12px; font-weight:600; padding:5px 12px; border-radius:20px; }

.sec-h { font-family:'Barlow Condensed',sans-serif; font-size:13px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--text3); margin:16px 0 10px; }

.bc { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); margin-bottom:10px; overflow:hidden; width:100%; }
.bc.cur { border-color:var(--border2); }
.bt { display:flex; justify-content:space-between; align-items:center; padding:14px 16px 10px; }
.bn { font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:700; letter-spacing:.04em; color:var(--text); }
.badge { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; letter-spacing:.04em; text-transform:uppercase; }
.b-paid { background:rgba(200,245,66,.15); color:var(--accent); }
.b-due { background:rgba(255,200,50,.15); color:var(--amber); }
.b-active { background:rgba(96,165,250,.15); color:var(--blue); }
.b-upcoming { background:var(--surface3); color:var(--text3); }

.dots { display:flex; gap:5px; padding:2px 16px 12px; flex-wrap:wrap; }
.dot { width:30px; height:30px; border-radius:50%; border:1.5px solid var(--surface3); background:transparent; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; color:var(--text3); cursor:pointer; transition:all .15s; font-family:'DM Sans',sans-serif; }
.dot:hover { border-color:var(--border2); color:var(--text2); transform:scale(1.05); }
.dot.done { background:var(--accent); border-color:var(--accent); color:#0a0a0a; }
.dot.skipped { background:var(--red); border-color:var(--red); color:#fff; }
.dot.next { border-color:var(--blue); color:var(--blue); background:rgba(96,165,250,0.1); }
.dot.rescheduled { border-color:var(--orange); color:var(--orange); background:rgba(251,146,60,0.1); }
.dot.rescheduled.done { background:var(--accent); border-color:var(--accent); color:#0a0a0a; box-shadow:0 0 0 2px var(--orange); }
.dot.selected { outline:2px solid var(--accent); outline-offset:2px; }

.sess-ed { margin:0 16px 12px; background:var(--surface2); border:1px solid var(--border2); border-radius:var(--rs); padding:14px; animation:slin .15s ease; }
@keyframes slin { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
.se-title { font-size:12px; font-weight:500; color:var(--text2); margin-bottom:10px; }
.se-title span { color:var(--text); }
.se-row { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:10px; }
.eb { padding:6px 13px; border-radius:20px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; cursor:pointer; border:1.5px solid var(--border2); background:transparent; color:var(--text2); transition:all .13s; white-space:nowrap; }
.eb.e-done { border-color:var(--accent); color:var(--accent); }
.eb.e-done:hover, .eb.e-done.active { background:var(--accent); color:#0a0a0a; }
.eb.e-skip { border-color:var(--red); color:var(--red); }
.eb.e-skip:hover, .eb.e-skip.active { background:var(--red); color:#fff; }
.eb.e-clr { border-color:var(--text3); color:var(--text3); }
.eb.e-clr:hover { border-color:var(--text2); color:var(--text2); }
.se-date { display:flex; align-items:center; gap:6px; margin-bottom:10px; }
.se-dlbl { font-size:11px; color:var(--text3); white-space:nowrap; }
.se-di { flex:1; background:var(--surface3); border:1px solid var(--border2); border-radius:8px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:12px; padding:6px 10px; outline:none; color-scheme:dark; min-width:0; }
.se-di:focus { border-color:var(--accent); }
.se-set { padding:6px 12px; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; cursor:pointer; border:1.5px solid var(--orange); background:transparent; color:var(--orange); transition:all .13s; white-space:nowrap; }
.se-set:hover { background:var(--orange); color:#0a0a0a; }
.note-lbl { font-size:10px; color:var(--text3); margin-bottom:4px; letter-spacing:.04em; text-transform:uppercase; }
.note-area { width:100%; background:var(--surface3); border:1px solid var(--border2); border-radius:8px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:12px; padding:8px 10px; outline:none; resize:none; min-height:56px; line-height:1.5; }
.note-area:focus { border-color:var(--accent); }
.note-area::placeholder { color:var(--text3); }
.note-hint { font-size:10px; color:var(--text3); text-align:right; margin-top:4px; }

.bf { display:flex; justify-content:space-between; align-items:center; padding:10px 16px; border-top:1px solid var(--border); }
.br { font-size:12px; color:var(--text3); }
.pay-btn { padding:7px 16px; border-radius:20px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; cursor:pointer; border:1.5px solid var(--accent); background:transparent; color:var(--accent); transition:all .15s; }
.pay-btn:hover { background:var(--accent); color:#0a0a0a; }
.pay-btn.undo { border-color:var(--text3); color:var(--text3); }
.pay-btn.undo:hover { border-color:var(--red); color:var(--red); background:rgba(255,77,77,0.08); }

.add-block-btn { width:100%; box-sizing:border-box; padding:13px; border-radius:var(--r); border:1.5px dashed var(--border2); background:transparent; color:var(--text3); font-family:'Barlow Condensed',sans-serif; font-size:14px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; cursor:pointer; transition:all .18s; margin-top:4px; }
.add-block-btn:hover { border-color:var(--accent); color:var(--accent); background:rgba(200,245,66,0.04); }

.h-row { display:flex; justify-content:space-between; align-items:flex-start; padding:13px 0; border-bottom:1px solid var(--border); gap:10px; }
.h-date { font-size:14px; color:var(--text); }
.h-sub { font-size:12px; color:var(--text3); margin-top:2px; }
.h-note { font-size:12px; color:var(--text2); margin-top:4px; font-style:italic; }
.h-badge { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; text-transform:uppercase; letter-spacing:.04em; white-space:nowrap; flex-shrink:0; margin-top:2px; }
.h-done { background:rgba(200,245,66,0.12); color:var(--accent); }
.h-skipped { background:rgba(255,77,77,0.12); color:var(--red); }
.h-payment { background:rgba(200,245,66,0.2); color:var(--accent); }
.h-moved { background:rgba(251,146,60,0.12); color:var(--orange); }
.h-empty { text-align:center; padding:60px 0; color:var(--text3); font-size:14px; }

.st-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); padding:18px; margin-bottom:10px; }
.st-title { font-family:'Barlow Condensed',sans-serif; font-size:14px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--text); margin-bottom:5px; }
.st-desc { font-size:13px; color:var(--text2); margin-bottom:14px; line-height:1.5; }
.st-btn { width:100%; padding:12px; border-radius:var(--rs); font-family:'Barlow Condensed',sans-serif; font-size:14px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; border:1.5px solid var(--border2); background:transparent; color:var(--text2); margin-bottom:8px; transition:all .15s; }
.st-btn:last-child { margin-bottom:0; }
.st-btn:hover:not(:disabled) { border-color:var(--accent); color:var(--accent); background:rgba(200,245,66,0.04); }
.st-btn:disabled { opacity:.4; cursor:default; }
.import-ta { width:100%; background:var(--surface2); border:1px solid var(--border2); border-radius:var(--rs); color:var(--text); font-family:'DM Sans',sans-serif; font-size:12px; padding:10px 13px; outline:none; resize:none; min-height:80px; margin-bottom:8px; color-scheme:dark; }
.import-ta:focus { border-color:var(--accent); }
.import-ta::placeholder { color:var(--text3); }

.log-lbl { font-size:12px; color:var(--text2); margin-bottom:6px; font-weight:500; }
.log-inp { width:100%; background:var(--surface2); border:1px solid var(--border2); border-radius:var(--rs); color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; padding:10px 14px; outline:none; margin-bottom:12px; color-scheme:dark; box-sizing:border-box; min-width:0; }
.log-inp:focus { border-color:var(--accent); }
.type-row { display:flex; gap:8px; margin-bottom:12px; }
.type-btn { flex:1; padding:9px 0; border-radius:var(--rs); border:1.5px solid var(--border2); background:transparent; color:var(--text2); font-family:'DM Sans',sans-serif; font-size:13px; font-weight:500; cursor:pointer; transition:all .15s; }
.type-btn.sel-done { border-color:var(--accent); background:rgba(200,245,66,0.1); color:var(--accent); }
.type-btn.sel-skip { border-color:var(--red); background:rgba(255,77,77,0.1); color:var(--red); }
.sub-btn { width:100%; padding:13px; border-radius:var(--rs); border:none; background:var(--accent); color:#0a0a0a; font-family:'Barlow Condensed',sans-serif; font-size:16px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; transition:all .15s; }
.sub-btn:hover { background:var(--accent2); }
.sub-btn:disabled { opacity:.4; cursor:default; }
.log-toast { margin-top:10px; font-size:13px; color:var(--accent); min-height:20px; text-align:center; }

.leg { display:flex; gap:14px; flex-wrap:wrap; margin-bottom:10px; margin-top:8px; }
.li-item { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text3); }
.ld { width:9px; height:9px; border-radius:50%; }

.toast-global { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--surface2); border:1px solid var(--border2); border-radius:20px; padding:10px 20px; font-size:13px; color:var(--accent); z-index:100; pointer-events:none; white-space:nowrap; }
`;

function useLS(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = useCallback((v) => { setVal(v); try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key]);
  return [val, set];
}

function computeStreak(state, numBlocks) {
  const ad = tueThu(START_DATE, SPB * numBlocks);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let run = 0, best = 0;
  for (let bi = 0; bi < numBlocks; bi++) {
    for (let si = 0; si < SPB; si++) {
      let d = ad[bi * SPB + si];
      const sk = `${bi}-${si}`;
      if (state.reschedule?.[sk]) d = new Date(state.reschedule[sk] + "T00:00:00");
      if (d > today) continue;
      const k = dk(d);
      if (state.done[k]) { run++; if (run > best) best = run; }
      else run = 0;
    }
  }
  return { current: run, best };
}

export default function App() {
  const [tab, setTab] = useState("overview");
  const [state, setState] = useLS("pt_v4", { done: {}, skipped: {}, paid: {}, reschedule: {}, notes: {}, numBlocks: 1 });
  const [openSlot, setOpenSlot] = useState(null);
  const [pendingDate, setPendingDate] = useState("");
  const [logDate, setLogDate] = useState(() => dk(new Date()));
  const [logType, setLogType] = useState("done");
  const [logNote, setLogNote] = useState("");
  const [logToast, setLogToast] = useState("");
  const [globalToast, setGlobalToast] = useState("");
  const [importText, setImportText] = useState("");

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const numBlocks = state.numBlocks || 1;
  const allDates = tueThu(START_DATE, SPB * numBlocks);
  const blocks = Array.from({ length: numBlocks }, (_, bi) => ({ id: bi, sessions: allDates.slice(bi * SPB, (bi + 1) * SPB) }));

  function effDate(bi, si) {
    const k = `${bi}-${si}`;
    return state.reschedule?.[k] ? new Date(state.reschedule[k] + "T00:00:00") : allDates[bi * SPB + si];
  }
  function effDk(bi, si) { return dk(effDate(bi, si)); }

  const totalDone = Object.keys(state.done).length;
  const totalSkipped = Object.keys(state.skipped).length;
  const totalSessions = SPB * numBlocks;
  const totalPaid = Object.keys(state.paid).length * PRICE;
  const pct = totalSessions > 0 ? Math.round((totalDone / totalSessions) * 100) : 0;
  const C = 2 * Math.PI * 30, dashOffset = C - (pct / 100) * C;
  const streak = computeStreak(state, numBlocks);

  const nextSession = (() => {
    for (let bi = 0; bi < numBlocks; bi++)
      for (let si = 0; si < SPB; si++) {
        const k = effDk(bi, si), d = effDate(bi, si);
        if (!state.done[k] && !state.skipped[k] && d >= today) return d;
      }
    return null;
  })();

  function upd(patch) { setState({ ...state, ...patch }); }

  function showToast(msg) { setGlobalToast(msg); setTimeout(() => setGlobalToast(""), 2800); }

  function markStatus(bi, si, status) {
    const k = effDk(bi, si);
    const done = { ...state.done }, skipped = { ...state.skipped };
    if (status === "done") { done[k] = true; delete skipped[k]; }
    else if (status === "skipped") { skipped[k] = true; delete done[k]; }
    else { delete done[k]; delete skipped[k]; }
    upd({ done, skipped });
  }

  function setResched(bi, si, dateStr) {
    const sk = `${bi}-${si}`, oldK = effDk(bi, si);
    const done = { ...state.done }, skipped = { ...state.skipped };
    delete done[oldK]; delete skipped[oldK];
    upd({ done, skipped, reschedule: { ...state.reschedule, [sk]: dateStr } });
    setPendingDate(""); setOpenSlot(null);
  }

  function clearResched(bi, si) {
    const sk = `${bi}-${si}`, oldK = effDk(bi, si);
    const done = { ...state.done }, skipped = { ...state.skipped }, reschedule = { ...state.reschedule };
    delete done[oldK]; delete skipped[oldK]; delete reschedule[sk];
    upd({ done, skipped, reschedule });
  }

  function saveNote(bi, si, text) {
    const k = effDk(bi, si), notes = { ...state.notes };
    if (text.trim()) notes[k] = text.trim(); else delete notes[k];
    upd({ notes });
  }

  function blockStatus(bl, bi) {
    const dc = Array.from({ length: SPB }, (_, si) => effDk(bi, si)).filter(k => state.done[k]).length;
    const sc = Array.from({ length: SPB }, (_, si) => effDk(bi, si)).filter(k => state.skipped[k]).length;
    if (state.paid[bi]) return "paid";
    const allPast = Array.from({ length: SPB }, (_, si) => effDate(bi, si)).every(d => d < today);
    const started = dc + sc > 0 || bl.sessions[0] <= today;
    if (!started) return "upcoming";
    if (dc + sc === SPB || allPast) return "due";
    return "active";
  }

  function showOnOverview(bl, bi) {
    const s = blockStatus(bl, bi);
    if (s === "active" || s === "due") return true;
    if (s === "paid") {
      for (let si = 0; si < SPB; si++) { const k = effDk(bi, si); if (!state.done[k] && !state.skipped[k]) return true; }
    }
    return false;
  }

  function toggleOpen(bi, si) {
    const key = `${bi}-${si}`;
    if (openSlot === key) { setOpenSlot(null); setPendingDate(""); }
    else { setOpenSlot(key); setPendingDate(effDk(bi, si)); }
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = `pt-backup-${dk(today)}.json`; a.click(); URL.revokeObjectURL(url);
    showToast("Backup downloaded!");
  }

  function handleImport() {
    try {
      const p = JSON.parse(importText);
      if (typeof p !== "object" || !p.done) throw new Error();
      setState(p); setImportText(""); showToast("Data restored!");
    } catch { showToast("Invalid backup — paste the full JSON."); }
  }

  function submitLog() {
    if (!logDate) return;
    const done = { ...state.done }, skipped = { ...state.skipped }, notes = { ...state.notes };
    if (logType === "done") { done[logDate] = true; delete skipped[logDate]; }
    else { skipped[logDate] = true; delete done[logDate]; }
    if (logNote.trim()) notes[logDate] = logNote.trim();
    upd({ done, skipped, notes });
    setLogToast(`Saved!`); setLogNote("");
    setTimeout(() => setLogToast(""), 3000);
  }

  const bmap = { paid: "b-paid", due: "b-due", active: "b-active", upcoming: "b-upcoming" };
  const lmap = { paid: "Paid ✓", due: "Payment due", active: "In progress", upcoming: "Upcoming" };

  function BlockCard({ bl, bi, highlight }) {
    const status = blockStatus(bl, bi);
    const dc = Array.from({ length: SPB }, (_, si) => effDk(bi, si)).filter(k => state.done[k]).length;
    const sc = Array.from({ length: SPB }, (_, si) => effDk(bi, si)).filter(k => state.skipped[k]).length;
    const isPaid = !!state.paid[bi];
    return (
      <div className={`bc${highlight ? " cur" : ""}`}>
        <div className="bt">
          <div className="bn">Block {bi + 1}</div>
          <div className={`badge ${bmap[status]}`}>{lmap[status]}</div>
        </div>
        <div className="dots">
          {bl.sessions.map((_, si) => {
            const sk = `${bi}-${si}`, k = effDk(bi, si), d = effDate(bi, si);
            const isDone = !!state.done[k], isSk = !!state.skipped[k], isR = !!state.reschedule?.[sk];
            const isNext = nextSession && dk(d) === dk(nextSession), isOpen = openSlot === sk;
            let cls = isNext ? "next" : "";
            if (isDone) cls = "done"; if (isSk) cls = "skipped";
            if (isR) cls += " rescheduled"; if (isOpen) cls += " selected";
            return <div key={si} className={`dot ${cls.trim()}`} onClick={() => toggleOpen(bi, si)} title={isR ? `Rescheduled: ${fd(d)}` : fd(d)}>{si + 1}</div>;
          })}
        </div>
        {bl.sessions.map((_, si) => {
          if (openSlot !== `${bi}-${si}`) return null;
          const k = effDk(bi, si), d = effDate(bi, si);
          const isDone = !!state.done[k], isSk = !!state.skipped[k], isR = !!state.reschedule?.[`${bi}-${si}`];
          const note = state.notes?.[k] || "";
          return (
            <div key={si} className="sess-ed">
              <div className="se-title">Session {si + 1} — <span>{isR ? `rescheduled to ${fd(d)}` : fd(d)}</span></div>
              <div className="se-row">
                <button className={`eb e-done${isDone ? " active" : ""}`} onClick={() => markStatus(bi, si, isDone ? "clear" : "done")}>{isDone ? "Undo done" : "Mark done"}</button>
                <button className={`eb e-skip${isSk ? " active" : ""}`} onClick={() => markStatus(bi, si, isSk ? "clear" : "skipped")}>{isSk ? "Undo skip" : "Mark skipped"}</button>
                {isR && <button className="eb e-clr" onClick={() => clearResched(bi, si)}>Reset date</button>}
              </div>
              <div className="se-date">
                <span className="se-dlbl">Reschedule to:</span>
                <input type="date" className="se-di" value={pendingDate} onChange={e => setPendingDate(e.target.value)} />
                <button className="se-set" onClick={() => pendingDate && setResched(bi, si, pendingDate)}>Set</button>
              </div>
              <div className="note-lbl">Note</div>
              <textarea className="note-area" placeholder="e.g. Focused on legs…" value={note} onChange={e => saveNote(bi, si, e.target.value)} maxLength={200} />
              <div className="note-hint">{note.length}/200</div>
            </div>
          );
        })}
        <div className="bf">
          <div className="br">{fs(bl.sessions[0])} – {fs(bl.sessions[SPB - 1])}<br /><span style={{ fontSize: 11 }}>{dc} done · {sc} skipped</span></div>
          {isPaid
            ? <button className="pay-btn undo" onClick={() => { const p = { ...state.paid }; delete p[bi]; upd({ paid: p }); }}>Undo payment</button>
            : <button className="pay-btn" onClick={() => upd({ paid: { ...state.paid, [bi]: true } })}>Mark paid · 400 RON</button>}
        </div>
      </div>
    );
  }

  const history = [];
  for (let bi = 0; bi < numBlocks; bi++) {
    for (let si = 0; si < SPB; si++) {
      const k = effDk(bi, si), d = effDate(bi, si), isR = !!state.reschedule?.[`${bi}-${si}`], note = state.notes?.[k];
      if (state.done[k]) history.push({ date: d, type: "done", block: bi + 1, rescheduled: isR, note });
      if (state.skipped[k]) history.push({ date: d, type: "skipped", block: bi + 1, rescheduled: isR, note });
    }
    if (state.paid[bi]) history.push({ date: blocks[bi].sessions[0], type: "payment", block: bi + 1, amount: PRICE });
  }
  history.sort((a, b) => b.date - a.date);

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <nav className="nav">
          <div className="nav-logo">PT Tracker</div>
          <div className="nav-date">{today.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long" })}</div>
        </nav>
        <div className="tabs">
          {["overview", "blocks", "history", "settings"].map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => { setTab(t); setOpenSlot(null); }}>
              {t === "settings" ? "⚙" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="pg">
            <div className="hrow">
              <div className="hc ac">
                <div className="hl">Sessions done</div>
                <div className="hn">{totalDone}</div>
                <div className="hs">of {totalSessions} planned</div>
              </div>
              <div className="hc">
                <div className="hl">Total paid</div>
                <div className="hn" style={{ fontSize: 28, paddingTop: 4 }}>{totalPaid}</div>
                <div className="hs">RON · {Math.round(totalPaid / PRICE)} block{totalPaid / PRICE !== 1 ? "s" : ""}</div>
              </div>
            </div>
            <div className="streak-card">
              <div className="streak-left">
                <div className="streak-flame">{streak.current > 0 ? "🔥" : "💤"}</div>
                <div><div className="streak-num">{streak.current}</div><div className="streak-lbl">session streak</div></div>
              </div>
              <div className="streak-best">Best streak<span>{streak.best}</span></div>
            </div>
            <div className="ring-card">
              <div className="ring-wrap">
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle className="bg" cx="36" cy="36" r="30" />
                  <circle className="fg" cx="36" cy="36" r="30" strokeDasharray={C} strokeDashoffset={dashOffset} />
                </svg>
                <div className="ring-pct">{pct}%</div>
              </div>
              <div>
                <div className="ring-title">Overall progress</div>
                <div className="ring-body"><strong>{totalDone}</strong> done · <strong>{totalSkipped}</strong> skipped<br /><strong>{numBlocks}</strong> block{numBlocks !== 1 ? "s" : ""} · <strong>{totalSessions - totalDone - totalSkipped}</strong> remaining</div>
              </div>
            </div>
            {nextSession && (
              <div className="next-banner">
                <div><div className="next-label">Next session</div><div className="next-date">{fd(nextSession)}</div></div>
                <div className="next-pill">Upcoming</div>
              </div>
            )}
            <div className="sec-h">Current block</div>
            {blocks.filter((bl, bi) => showOnOverview(bl, bi)).map(bl => <BlockCard key={bl.id} bl={bl} bi={bl.id} highlight />)}
          </div>
        )}

        {tab === "blocks" && (
          <div className="pg">
            <div className="leg">
              <div className="li-item"><div className="ld" style={{ background: "#c8f542" }} />Done</div>
              <div className="li-item"><div className="ld" style={{ background: "#ff4d4d" }} />Skipped</div>
              <div className="li-item"><div className="ld" style={{ border: "1.5px solid #60a5fa", background: "rgba(96,165,250,0.1)" }} />Next</div>
              <div className="li-item"><div className="ld" style={{ border: "1.5px solid #fb923c", background: "rgba(251,146,60,0.1)" }} />Rescheduled</div>
            </div>
            {blocks.map((bl, bi) => <BlockCard key={bi} bl={bl} bi={bi} highlight={["active", "paid"].includes(blockStatus(bl, bi))} />)}
            <button className="add-block-btn" onClick={() => upd({ numBlocks: numBlocks + 1 })}>+ Add new block</button>
          </div>
        )}

        {tab === "history" && (
          <div className="pg">
            <div className="sec-h" style={{ marginTop: 16 }}>Activity log</div>
            {history.length === 0
              ? <div className="h-empty">No activity yet. Go crush a session!</div>
              : history.map((item, i) => (
                <div key={i} className="h-row">
                  <div style={{ flex: 1 }}>
                    <div className="h-date">{fd(item.date)}</div>
                    <div className="h-sub">Block {item.block}{item.type === "payment" ? ` · ${item.amount} RON` : ""}{item.rescheduled ? " · rescheduled" : ""}</div>
                    {item.note && <div className="h-note">"{item.note}"</div>}
                  </div>
                  <div className={`h-badge ${item.type === "done" ? (item.rescheduled ? "h-moved" : "h-done") : item.type === "skipped" ? "h-skipped" : "h-payment"}`}>
                    {item.type === "payment" ? "Paid" : item.rescheduled ? "Moved" : item.type}
                  </div>
                </div>
              ))}
          </div>
        )}

        {tab === "settings" && (
          <div className="pg">
            <div className="sec-h" style={{ marginTop: 16 }}>Backup</div>
            <div className="st-card">
              <div className="st-title">Export data</div>
              <div className="st-desc">Download a full backup of all your sessions, payments, notes, and settings as a JSON file.</div>
              <button className="st-btn" onClick={handleExport}>Download backup</button>
            </div>
            <div className="st-card">
              <div className="st-title">Import data</div>
              <div className="st-desc">Paste a previously exported JSON file to restore your data. This overwrites current data.</div>
              <textarea className="import-ta" placeholder="Paste your backup JSON here…" value={importText} onChange={e => setImportText(e.target.value)} />
              <button className="st-btn" onClick={handleImport} disabled={!importText.trim()}>Restore from backup</button>
            </div>
            <div className="sec-h">Quick log</div>
            <div className="st-card">
              <div className="st-title">Log a session</div>
              <div className="log-lbl">Date</div>
              <input type="date" className="log-inp" value={logDate} onChange={e => setLogDate(e.target.value)} />
              <div className="log-lbl">Type</div>
              <div className="type-row">
                <button className={`type-btn ${logType === "done" ? "sel-done" : ""}`} onClick={() => setLogType("done")}>Done</button>
                <button className={`type-btn ${logType === "skipped" ? "sel-skip" : ""}`} onClick={() => setLogType("skipped")}>Skipped</button>
              </div>
              <div className="log-lbl">Note (optional)</div>
              <textarea className="note-area" style={{ marginBottom: 12 }} placeholder="e.g. Great session, worked on squats…" value={logNote} onChange={e => setLogNote(e.target.value)} maxLength={200} />
              <button className="sub-btn" onClick={submitLog} disabled={!logDate}>Save session</button>
              <div className="log-toast">{logToast}</div>
            </div>
          </div>
        )}

        {globalToast && <div className="toast-global">{globalToast}</div>}
      </div>
    </>
  );
}
