"use client";
import { useState, useEffect, useRef } from "react";
import { medalTable, allTimeWinnings, combinedPodiums } from "./data";
import { useLiveSeasonData, useLiveMatches } from "./useFirestore";
import { db } from "./firebase";
import { doc, onSnapshot, collection, getDocs } from "firebase/firestore";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, Cell,
} from "recharts";

/* ───── constants ───── */
const TABS = ["🏏 Season 2026", "📊 Standings 2026", "🏅 Medals 2026", "🏆 All-Time", "🎲 Guess Game"] as const;

const PLAYER_LIST = [
  "Harsha","Vignesh","Sidhu","Jaydev","Aditya","Karthik",
  "Sreeram","Manju","Anoop","Ravindra","Ankit","Prithvi",
  "Ranjith","Shiva","Vinay (Babu)",
];

const COLORS = [
  "#38bdf8","#f472b6","#facc15","#4ade80","#fb923c","#a78bfa",
  "#22d3ee","#f87171","#34d399","#e879f9","#fbbf24","#60a5fa",
  "#c084fc","#2dd4bf","#fb7185","#a3e635",
];

const formatNum = (n: number) => n.toLocaleString("en-IN");

const getPrizeEmoji = (v: number) => {
  if (v >= 1500) return "🥇";
  if (v >= 1000) return "🥈";
  if (v >= 500) return "🥉";
  if (v > 0) return "🎖️";
  return "";
};

/* ═══════════════════════════════════════════
   TAB 1 – Season (Matches)
   ═══════════════════════════════════════════ */
function SeasonTab() {
  const { matches, loading } = useLiveMatches();
  const highlightRef = useRef<HTMLDivElement>(null);

  // Use local date (not UTC) so IST matches correctly
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const tmrw = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrow = `${tmrw.getFullYear()}-${String(tmrw.getMonth() + 1).padStart(2, "0")}-${String(tmrw.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    if (!loading && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading]);

  if (loading) return <p className="text-center text-sky-300 py-12 animate-pulse">Loading matches…</p>;

  const hasWinners = (m: { winnings: Record<string, number> }) =>
    PLAYER_LIST.some((p) => (m.winnings?.[p] ?? 0) > 0);

  const todaysGames = matches.filter((m) => m.matchDate === today);
  const tomorrowsGames = matches.filter(
    (m) => m.matchDate === tomorrow && !hasWinners(m),
  );
  const completedGames = matches
    .filter((m) => hasWinners(m) && m.matchDate !== today)
    .reverse();
  const upcomingGames = matches.filter(
    (m) => !hasWinners(m) && m.matchDate !== today && m.matchDate !== tomorrow && m.matchDate >= today,
  );

  // Catch-all: matches that don't appear in any section above (e.g. missing matchDate, future without winners, etc.)
  const shownMatchNums = new Set([
    ...todaysGames.map((m) => m.matchNum),
    ...tomorrowsGames.map((m) => m.matchNum),
    ...completedGames.map((m) => m.matchNum),
    ...upcomingGames.map((m) => m.matchNum),
  ]);
  const unlistedGames = matches.filter((m) => !shownMatchNums.has(m.matchNum) && !hasWinners(m));

  const renderWinners = (m: { winnings: Record<string, number>; winners?: string[] }) => {
    // Players with prize money
    const paidWinners = PLAYER_LIST
      .map((p) => ({ name: p, amt: m.winnings?.[p] ?? 0 }))
      .filter((w) => w.amt > 0)
      .sort((a, b) => b.amt - a.amt);
    // 4th place: in winners array but ₹0 winnings (medal only)
    const medalOnly = (m.winners || [])
      .filter((name) => PLAYER_LIST.includes(name) && (m.winnings?.[name] ?? 0) === 0)
      .map((name) => ({ name, amt: 0 }));
    const allWinners = [...paidWinners, ...medalOnly];
    if (!allWinners.length) return <span className="text-sky-400/60 text-sm">⏳ Awaiting results...</span>;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {allWinners.map((w) => (
          <span key={w.name} className="text-xs bg-sky-900/40 rounded px-1.5 py-0.5">
            {w.amt > 0 ? `${getPrizeEmoji(w.amt)} ${w.name} ₹${formatNum(w.amt)}` : `🎖️ ${w.name}`}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Today */}
      {todaysGames.length > 0 && (
        <div ref={highlightRef}>
          <h3 className="text-sky-300 font-semibold mb-2 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            Today&apos;s Matches
          </h3>
          <div className="space-y-3">
            {todaysGames.map((m) => (
              <div
                key={m.matchNum}
                className="rounded-xl border border-sky-400/50 shadow-[0_0_18px_rgba(56,189,248,0.15)] bg-gradient-to-r from-sky-950/60 to-[#0a1628] p-4"
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sky-100">M{m.matchNum}: {m.matchInfo}</span>
                </div>
                {(m.contestCode || m.contestLink) && (
                  <div className="flex items-center gap-2 mt-1">
                    {m.contestCode && <span className="text-xs bg-sky-800/40 text-sky-200 px-2 py-0.5 rounded font-mono">Code: {m.contestCode}</span>}
                    {m.contestLink && <a href={m.contestLink} target="_blank" rel="noreferrer" className="text-xs text-sky-400/80 underline">Contest ↗</a>}
                  </div>
                )}
                {renderWinners(m)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tomorrow */}
      {tomorrowsGames.length > 0 && (
        <div>
          <h3 className="text-blue-300/80 font-semibold mb-2">Tomorrow&apos;s Matches</h3>
          <div className="space-y-2">
            {tomorrowsGames.map((m) => (
              <div
                key={m.matchNum}
                className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-3"
              >
                <div className="flex justify-between items-start">
                  <span className="text-blue-100/90">M{m.matchNum}: {m.matchInfo}</span>
                  <span className="text-xs text-blue-400/60">{m.matchDate}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  {(m.contestCode || m.contestLink) && (
                    <div className="flex items-center gap-2">
                      {m.contestCode && <span className="text-xs bg-blue-800/30 text-sky-300 px-2 py-0.5 rounded font-mono">Code: {m.contestCode}</span>}
                      {m.contestLink && <a href={m.contestLink} target="_blank" rel="noreferrer" className="text-xs text-blue-400/70 underline">Contest ↗</a>}
                    </div>
                  )}
                  <span className="text-xs text-blue-300/50">Upcoming</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming (beyond tomorrow) */}
      {upcomingGames.length > 0 && (
        <div>
          <h3 className="text-indigo-300/80 font-semibold mb-2">Upcoming</h3>
          <div className="space-y-2">
            {upcomingGames.map((m) => (
              <div
                key={m.matchNum}
                className="rounded-lg border border-indigo-500/20 bg-indigo-950/15 p-3"
              >
                <div className="flex justify-between items-start">
                  <span className="text-indigo-100/80">M{m.matchNum}: {m.matchInfo}</span>
                  <span className="text-xs text-indigo-400/50">{m.matchDate}</span>
                </div>
                {(m.contestCode || m.contestLink) && (
                  <div className="flex items-center gap-2 mt-1">
                    {m.contestCode && <span className="text-xs bg-indigo-800/30 text-indigo-300 px-2 py-0.5 rounded font-mono">Code: {m.contestCode}</span>}
                    {m.contestLink && <a href={m.contestLink} target="_blank" rel="noreferrer" className="text-xs text-indigo-400/70 underline">Contest ↗</a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unlisted (missing date or other edge cases) */}
      {unlistedGames.length > 0 && (
        <div>
          <h3 className="text-amber-300/80 font-semibold mb-2">📋 Scheduled</h3>
          <div className="space-y-2">
            {unlistedGames.map((m) => (
              <div
                key={m.matchNum}
                className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-3"
              >
                <div className="flex justify-between items-start">
                  <span className="text-amber-100/80">M{m.matchNum}: {m.matchInfo || "TBD"}</span>
                  <span className="text-xs text-amber-400/50">{m.matchDate || "No date"}</span>
                </div>
                {(m.contestCode || m.contestLink) && (
                  <div className="flex items-center gap-2 mt-1">
                    {m.contestCode && <span className="text-xs bg-amber-800/30 text-amber-300 px-2 py-0.5 rounded font-mono">Code: {m.contestCode}</span>}
                    {m.contestLink && <a href={m.contestLink} target="_blank" rel="noreferrer" className="text-xs text-amber-400/70 underline">Contest ↗</a>}
                  </div>
                )}
                <span className="text-sky-400/60 text-sm">⏳ Awaiting results...</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completedGames.length > 0 && (
        <div>
          <h3 className="text-slate-400 font-semibold mb-2">Completed</h3>
          <div className="space-y-1.5">
            {completedGames.map((m) => (
              <div key={m.matchNum} className="rounded-lg bg-slate-800/30 p-2.5 opacity-70 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">M{m.matchNum}: {m.matchInfo}</span>
                  <span className="text-xs text-slate-500">{m.matchDate}</span>
                </div>
                {renderWinners(m)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════
   TAB 2 – Standings (with cumulative chart)
   ═══════════════════════════════════════════ */
function StandingsTab() {
  const { players, loading, completedMatches, totalInvested } = useLiveSeasonData();
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevOrder = useRef<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiShown = useRef(false);

  // Animate rows when order changes
  useEffect(() => {
    if (loading || !players.length) return;
    const invested = totalInvested;
    const sorted = [...players]
      .map((p) => {
        const total = p.matchWinnings.reduce((s, v) => s + v, 0);
        return { ...p, total, profit: total - invested };
      })
      .sort((a, b) => b.total - a.total);
    const newOrder = sorted.map((p) => p.name);
    const prev = prevOrder.current;

    if (prev.length && prev.join(",") !== newOrder.join(",")) {
      // Calculate position deltas and animate
      const positions: Record<string, number> = {};
      for (const name of prev) {
        const el = rowRefs.current[name];
        if (el) positions[name] = el.getBoundingClientRect().top;
      }
      // After React re-renders, apply FLIP animation
      requestAnimationFrame(() => {
        for (const name of newOrder) {
          const el = rowRefs.current[name];
          if (el && positions[name] !== undefined) {
            const newTop = el.getBoundingClientRect().top;
            const delta = positions[name] - newTop;
            if (Math.abs(delta) > 1) {
              el.style.transition = "none";
              el.style.transform = `translateY(${delta}px)`;
              requestAnimationFrame(() => {
                el.style.transition = "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)";
                el.style.transform = "translateY(0)";
              });
            }
          }
        }
      });
    }
    prevOrder.current = newOrder;
  }, [players, loading, totalInvested]);

  // Confetti: check for new topper
  useEffect(() => {
    if (loading || !players.length || completedMatches < 2) return;
    const invested = totalInvested;
    const sorted = [...players]
      .map((p) => ({ ...p, total: p.matchWinnings.reduce((s, v) => s + v, 0) }))
      .sort((a, b) => b.total - a.total);
    const prevTotals = [...players]
      .map((p) => ({ name: p.name, prevTotal: p.matchWinnings.slice(0, completedMatches - 1).reduce((s, v) => s + v, 0) }))
      .sort((a, b) => b.prevTotal - a.prevTotal);
    const newTopper = prevTotals[0]?.name !== sorted[0]?.name;
    if (newTopper && !confettiShown.current) {
      confettiShown.current = true;
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [players, loading, completedMatches, totalInvested]);

  if (loading) return <p className="text-center text-sky-300 py-12 animate-pulse">Loading standings…</p>;

  const invested = totalInvested;
  const sorted = [...players]
    .map((p) => {
      const total = p.matchWinnings.reduce((s, v) => s + v, 0);
      return { ...p, total, profit: total - invested };
    })
    .sort((a, b) => b.total - a.total);

  const maxReturn = Math.max(...sorted.map((p) => p.total), 1);

  // Bar chart data (sorted descending)
  const barData = sorted.map((p) => ({
    name: p.name,
    total: p.total,
    profit: p.profit,
  }));

  // Selected player analysis
  const selectedData = selectedPlayer
    ? sorted.find((p) => p.name === selectedPlayer)
    : null;

  const rankBadge = (i: number) => {
    if (i === 0) return <span className="text-lg">🥇</span>;
    if (i === 1) return <span className="text-lg">🥈</span>;
    if (i === 2) return <span className="text-lg">🥉</span>;
    return <span className="text-xs text-slate-500 font-mono w-6 text-center">#{i + 1}</span>;
  };

  // Streak detection: count consecutive wins/losses from the end
  const getStreak = (winnings: number[], matchCount: number) => {
    const recent = winnings.slice(0, matchCount).reverse(); // most recent first
    if (!recent.length) return null;
    let hotCount = 0;
    let coldCount = 0;
    for (const w of recent) {
      if (w > 0) hotCount++;
      else break;
    }
    if (hotCount < 3) {
      for (const w of recent) {
        if (w === 0) coldCount++;
        else break;
      }
    }
    if (hotCount >= 3) return { type: "hot" as const, count: hotCount };
    if (coldCount >= 3) return { type: "cold" as const, count: coldCount };
    return null;
  };

  // Check if #1 is a new topper (wasn't #1 after previous match)
  const isNewTopper = (() => {
    if (completedMatches < 2 || sorted.length < 2) return false;
    const prevTotals = sorted.map((p) => ({
      name: p.name,
      prevTotal: p.matchWinnings.slice(0, completedMatches - 1).reduce((s, v) => s + v, 0),
    })).sort((a, b) => b.prevTotal - a.prevTotal);
    return prevTotals[0]?.name !== sorted[0]?.name;
  })();

  // Rank change arrows: compare current rank vs rank after previous match
  const rankChanges: Record<string, number> = {};
  if (completedMatches >= 2) {
    const prevSorted = [...sorted]
      .map((p) => ({
        name: p.name,
        prevTotal: p.matchWinnings.slice(0, completedMatches - 1).reduce((s, v) => s + v, 0),
      }))
      .sort((a, b) => b.prevTotal - a.prevTotal);
    const prevRankMap: Record<string, number> = {};
    prevSorted.forEach((p, idx) => { prevRankMap[p.name] = idx; });
    sorted.forEach((p, idx) => {
      const prev = prevRankMap[p.name];
      if (prev !== undefined) rankChanges[p.name] = prev - idx; // positive = moved up
    });
  }

  const confettiColors = ["#facc15", "#38bdf8", "#f472b6", "#4ade80", "#fb923c", "#a78bfa", "#f87171", "#22d3ee"];
  const confettiPieces = showConfetti
    ? Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1}s`,
        duration: `${1.5 + Math.random() * 1.5}s`,
        color: confettiColors[i % confettiColors.length],
        size: 4 + Math.random() * 8,
        rotation: Math.random() * 360,
      }))
    : [];

  const rankArrow = (name: string) => {
    const change = rankChanges[name];
    if (change === undefined || change === 0) return <span className="text-[10px] text-slate-600 w-6 text-center">–</span>;
    if (change > 0) return <span className="text-[10px] font-bold text-emerald-400 w-6 text-center">↑{change}</span>;
    return <span className="text-[10px] font-bold text-red-400 w-6 text-center">↓{Math.abs(change)}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Confetti on new #1 */}
      {showConfetti && (
        <div className="confetti-container">
          {confettiPieces.map((p) => (
            <div key={p.id} className="confetti-piece"
              style={{
                left: p.left,
                top: "-10px",
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                animationDelay: p.delay,
                animationDuration: p.duration,
                transform: `rotate(${p.rotation}deg)`,
              }} />
          ))}
        </div>
      )}
      <p className="text-center text-sm text-sky-400/70">
        {completedMatches} matches completed • ₹{formatNum(invested)} in-points per player
      </p>

      {/* Player cards */}
      <div className="space-y-2">
        {sorted.map((p, i) => {
          const pct = maxReturn > 0 ? (p.total / maxReturn) * 100 : 0;
          const streak = getStreak(p.matchWinnings, completedMatches);
          const showNewTopper = i === 0 && isNewTopper;
          return (
            <div key={p.name} ref={(el) => { rowRefs.current[p.name] = el; }}
              className={`rounded-lg p-3 ${showNewTopper
                ? "bg-gradient-to-r from-yellow-900/30 to-slate-800/40 border border-yellow-500/30 shadow-[0_0_12px_rgba(250,204,21,0.1)]"
                : "bg-slate-800/40"}`}>
              <div className="flex items-center gap-2 mb-1">
                {rankBadge(i)}
                {rankArrow(p.name)}
                <span className="font-medium text-sky-100 flex-1">{p.name}</span>
                {showNewTopper && (
                  <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full px-2 py-0.5 animate-pulse">
                    NEW #1 👑
                  </span>
                )}
                {streak?.type === "hot" && (
                  <span className="text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-2 py-0.5">
                    🔥 {streak.count}W streak
                  </span>
                )}
                {streak?.type === "cold" && (
                  <span className="text-[10px] font-bold bg-blue-500/15 text-blue-300/70 border border-blue-500/20 rounded-full px-2 py-0.5">
                    🧊 {streak.count} dry
                  </span>
                )}
                <span className="text-xs text-slate-400">₹{formatNum(invested)}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-sky-300 flex-1">₹{formatNum(p.total)}</span>
                <span className={`text-center flex-1 ${p.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {p.profit >= 0 ? "+" : "-"}₹{formatNum(Math.abs(p.profit))}
                </span>
                <span className="flex-1" />
              </div>
              <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400"
                  style={{ width: `${Math.max(pct, 1)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Analysis Dropdown */}
      <div className="bg-slate-800/30 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <h4 className="text-sky-300 text-sm font-semibold">🔍 Player Analysis</h4>
          <select value={selectedPlayer} onChange={(e) => setSelectedPlayer(e.target.value)}
            className="bg-slate-800 border border-slate-600/30 rounded-lg px-3 py-1.5 text-sm text-sky-100 flex-1">
            <option value="">Select a player...</option>
            {sorted.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
        {selectedData && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-sky-100 font-semibold text-lg">{selectedData.name}</span>
              <span className={selectedData.profit >= 0 ? "text-emerald-400" : "text-red-400"}>
                {selectedData.profit >= 0 ? "+" : "-"}₹{formatNum(Math.abs(selectedData.profit))}
              </span>
            </div>
            {/* Match-by-match breakdown */}
            <div className="grid grid-cols-6 md:grid-cols-8 gap-1">
              {selectedData.matchWinnings.slice(0, completedMatches).map((w, i) => (
                <div key={i} className={`text-center rounded p-1.5 ${
                  w >= 1500 ? "bg-yellow-500/20 border border-yellow-500/30" :
                  w >= 1000 ? "bg-slate-400/15 border border-slate-400/20" :
                  w >= 500 ? "bg-amber-700/15 border border-amber-700/20" :
                  w > 0 ? "bg-sky-900/20 border border-sky-800/20" :
                  "bg-slate-800/20 border border-slate-800/20"
                }`}>
                  <div className="text-[9px] text-slate-500">M{i + 1}</div>
                  <div className={`text-xs font-mono font-bold ${
                    w >= 1500 ? "text-yellow-400" :
                    w >= 1000 ? "text-slate-300" :
                    w >= 500 ? "text-amber-500" :
                    w > 0 ? "text-sky-400" :
                    "text-slate-600"
                  }`}>
                    {w > 0 ? formatNum(w) : "–"}
                  </div>
                </div>
              ))}
            </div>
            {/* Stats */}
            <div className="flex gap-4 text-xs text-slate-400">
              <span>Wins: {selectedData.matchWinnings.slice(0, completedMatches).filter((w) => w > 0).length}/{completedMatches}</span>
              <span>Best: ₹{formatNum(Math.max(...selectedData.matchWinnings.slice(0, completedMatches), 0))}</span>
              <span>Avg: ₹{formatNum(Math.round(selectedData.total / Math.max(completedMatches, 1)))}</span>
            </div>
          </div>
        )}
      </div>

      {/* Horizontal bar chart — sorted by total winnings */}
      <div className="bg-slate-800/30 rounded-xl p-4">
        <h4 className="text-sky-300 text-sm font-semibold mb-3">Total Winnings</h4>
        <ResponsiveContainer width="100%" height={Math.max(barData.length * 32, 200)}>
          <BarChart data={barData} layout="vertical" margin={{ left: 70, right: 20 }}>
            <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#e2e8f0", fontSize: 11 }} width={65} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0" }}
              formatter={(v) => [`₹${formatNum(Number(v))}`, "Total"]}
            />
            <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={20}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={
                  i === 0 ? "#facc15" : i === 1 ? "#94a3b8" : i === 2 ? "#d97706" :
                  entry.profit >= 0 ? "#38bdf8" : "#ef4444"
                } />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   TAB 3 – Medals
   ═══════════════════════════════════════════ */
function MedalsTab() {
  const { matches, loading } = useLiveMatches();

  if (loading) return <p className="text-center text-sky-300 py-12 animate-pulse">Loading medals…</p>;

  // Calculate medals from live match data — rank-based (1st=🥇, 2nd=🥈, 3rd=🥉, 4th=🎖️)
  const medalData = PLAYER_LIST.map((name) => {
    let gold = 0, silver = 0, bronze = 0, consolation = 0;
    matches.forEach((m) => {
      if (m.cancelled) return; // skip rain-outs / cancelled matches
      const amt = m.winnings?.[name] || 0;
      const isInWinners = (m.winners || []).includes(name);
      // Player qualifies if they have prize money OR are in the winners array (4th place medal-only)
      if (amt <= 0 && !isInWinners) return;
      // Get all unique non-zero amounts for this match, sorted descending
      const allAmounts = [...new Set(
        PLAYER_LIST.map((p) => m.winnings?.[p] || 0).filter((v) => v > 0)
      )].sort((a, b) => b - a);
      if (amt > 0) {
        const rank = allAmounts.indexOf(amt);
        if (rank === 0) gold++;
        else if (rank === 1) silver++;
        else if (rank === 2) bronze++;
        else consolation++;
      } else if (isInWinners) {
        // 4th place: in winners array but ₹0 winnings = consolation medal
        consolation++;
      }
    });
    return { name, gold, silver, bronze, consolation, total: gold + silver + bronze + consolation };
  });

  const sorted = medalData.sort(
    (a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.total - a.total,
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-sky-400/80 border-b border-slate-700/50">
            <th className="text-left py-2 px-2">Player</th>
            <th className="text-center py-2 px-1">🥇</th>
            <th className="text-center py-2 px-1">🥈</th>
            <th className="text-center py-2 px-1">🥉</th>
            <th className="text-center py-2 px-1">🎖️</th>
            <th className="text-center py-2 px-1">Tot</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((m) => (
            <tr key={m.name} className="border-b border-slate-800/40 hover:bg-slate-800/30">
              <td className="py-1.5 px-2 text-sky-100">{m.name}</td>
              <td className="text-center text-yellow-400">{m.gold || "–"}</td>
              <td className="text-center text-slate-300">{m.silver || "–"}</td>
              <td className="text-center text-amber-600">{m.bronze || "–"}</td>
              <td className="text-center text-slate-400">{m.consolation || "–"}</td>
              <td className="text-center text-sky-300 font-semibold">{m.total || "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 4 – All-Time
   ═══════════════════════════════════════════ */
function AllTimeTab() {
  return (
    <div className="space-y-8">
      {/* Combined Winnings */}
      <div>
        <h3 className="text-sky-300 font-semibold mb-3">Combined Winnings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-sky-400/70 border-b border-slate-700/50">
                <th className="text-left py-2 px-1">#</th>
                <th className="text-left py-2 px-1">Player</th>
                <th className="text-right py-2 px-1">2025</th>
                <th className="text-right py-2 px-1">2024</th>
                <th className="text-right py-2 px-1">2023</th>
                <th className="text-right py-2 px-1">2022</th>
                <th className="text-right py-2 px-1">2021</th>
                <th className="text-right py-2 px-1">2020</th>
                <th className="text-right py-2 px-1 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {allTimeWinnings.map((e) => (
                <tr key={e.name} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                  <td className="py-1 px-1 text-slate-500">{e.rank}</td>
                  <td className="py-1 px-1 text-sky-100">{e.name}</td>
                  {[e.y2025, e.y2024, e.y2023, e.y2022, e.y2021, e.y2020].map((v, i) => (
                    <td
                      key={i}
                      className={`py-1 px-1 text-right ${v > 0 ? "text-emerald-400" : v < 0 ? "text-red-400" : "text-slate-500"}`}
                    >
                      {v === 0 ? "–" : `${v > 0 ? "+" : ""}${formatNum(v)}`}
                    </td>
                  ))}
                  <td
                    className={`py-1 px-1 text-right font-bold ${e.total > 0 ? "text-emerald-400" : e.total < 0 ? "text-red-400" : "text-slate-400"}`}
                  >
                    {e.total > 0 ? "+" : ""}{formatNum(e.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* All-Time Podium Scores */}
      <div>
        <h3 className="text-sky-300 font-semibold mb-3">All-Time Podium Scores</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-sky-400/70 border-b border-slate-700/50">
                <th className="text-left py-2 px-1">#</th>
                <th className="text-left py-2 px-1">Player</th>
                <th className="text-right py-2 px-1">2025</th>
                <th className="text-right py-2 px-1">2024</th>
                <th className="text-right py-2 px-1">2023</th>
                <th className="text-right py-2 px-1">2022</th>
                <th className="text-right py-2 px-1">2021</th>
                <th className="text-right py-2 px-1">2020</th>
                <th className="text-right py-2 px-1 font-bold">Total</th>
                <th className="text-right py-2 px-1">Avg</th>
              </tr>
            </thead>
            <tbody>
              {combinedPodiums.map((e) => (
                <tr key={e.name} className="border-b border-slate-800/30 hover:bg-slate-800/20">
                  <td className="py-1 px-1 text-slate-500">{e.rank}</td>
                  <td className="py-1 px-1 text-sky-100">{e.name}</td>
                  {[e.y2025, e.y2024, e.y2023, e.y2022, e.y2021, e.y2020].map((v, i) => (
                    <td key={i} className="py-1 px-1 text-right text-slate-300">
                      {v === null ? "–" : v}
                    </td>
                  ))}
                  <td className="py-1 px-1 text-right font-bold text-sky-300">{e.total}</td>
                  <td className="py-1 px-1 text-right text-slate-400">{e.avg.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   TAB 5 – Guess Game
   ═══════════════════════════════════════════ */
function GuessGameTab() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [roundHistory, setRoundHistory] = useState<Array<{ matchNum: number; date: string; results: Record<string, { result: string; points: number }> }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "guessGame", "scores"), (snap) => {
      if (snap.exists()) {
        setScores(snap.data().points as Record<string, number>);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    getDocs(collection(db, "guessGame")).then((snap) => {
      const rounds = snap.docs
        .filter((d) => d.id.startsWith("round_"))
        .map((d) => {
          const data = d.data();
          return {
            matchNum: data.matchNum as number,
            date: (data.date as string) || "",
            timestamp: (data.timestamp as string) || "",
            results: (data.results || {}) as Record<string, { result: string; points: number }>,
          };
        })
        .sort((a, b) => b.matchNum - a.matchNum || b.timestamp.localeCompare(a.timestamp));
      setRoundHistory(rounds);
    }).catch(() => {
      // Firestore may not have round data yet — that's fine
      setRoundHistory([]);
    });
  }, []);

  if (loading) return <p className="text-center text-sky-300 py-12 animate-pulse">Loading…</p>;

  const GUESS_PLAYERS = [
    "Shiva", "Aditya", "Ankit", "Varun", "Harsha", "Manju",
    "Ravi", "Rohit", "Siddhu", "Sivakarthik", "Sugam", "Vinay",
    "Ranjeeth", "Sreeram", "Vignesh", "Pruthvi", "Jay",
  ];

  const sorted = GUESS_PLAYERS
    .map((p) => ({ name: p, points: scores[p] || 0, seed: p }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6">
      <h3 className="text-sky-300 font-semibold text-center">🎲 Team Bawa Prediction League</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left — Standings */}
        <div>
          <h4 className="text-xs font-bold text-sky-400 uppercase mb-2">Standings</h4>
          <div className="space-y-1.5">
            {sorted.map((p, i) => {
              const rank = i + 1;
              return (
                <div key={p.name} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  rank <= 3 ? "bg-slate-800/40" : "bg-slate-800/20"
                }`}>
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                    rank === 1 ? "bg-yellow-500 text-black" : rank === 2 ? "bg-gray-400 text-black" : rank === 3 ? "bg-amber-700 text-white" : "bg-slate-700 text-slate-400"
                  }`}>{rank}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.seed}&backgroundColor=b6e3f4,c0aede`} alt={p.name}
                    className="w-7 h-7 rounded-full bg-slate-700 shrink-0" />
                  <span className="flex-1 text-sm text-sky-100">{p.name}</span>
                  <span className="text-sm font-bold text-sky-300">{p.points} <span className="text-[10px] text-slate-500">PTS</span></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — Round Results */}
        <div>
          <h4 className="text-xs font-bold text-sky-400 uppercase mb-2">Round Results</h4>
          {roundHistory.length === 0 ? (
            <p className="text-sm text-slate-500">No rounds yet</p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {roundHistory.map((round, idx) => {
                const correct = GUESS_PLAYERS.filter((p) => round.results[p]?.result === "correct" || round.results[p]?.result === "twist_correct");
                const twistWrong = GUESS_PLAYERS.filter((p) => round.results[p]?.result === "twist_wrong");
                return (
                  <div key={idx} className="bg-slate-800/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-blue-200">M{round.matchNum}</span>
                      <span className="text-xs text-slate-500">{round.date}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {correct.map((p) => (
                        <span key={p} className="text-[10px] bg-emerald-900/30 text-emerald-300 px-1.5 py-0.5 rounded-full">
                          ✅ {p} +{round.results[p].points}
                        </span>
                      ))}
                      {twistWrong.map((p) => (
                        <span key={p} className="text-[10px] bg-red-900/30 text-red-300 px-1.5 py-0.5 rounded-full">
                          ❌ {p} {round.results[p].points}
                        </span>
                      ))}
                      {correct.length === 0 && twistWrong.length === 0 && (
                        <span className="text-xs text-slate-500/40">All wrong/skipped</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Wall of Shame — negative point holders */}
      {(() => {
        const shamed = sorted.filter((p) => p.points < 0).sort((a, b) => a.points - b.points);
        if (!shamed.length) return null;
        return (
          <div className="mt-2">
            <h4 className="text-xs font-bold text-red-400 uppercase mb-2 flex items-center gap-1">
              💀 Wall of Shame
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {shamed.map((p) => (
                <div key={p.name} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-950/30 border border-red-500/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.seed}&backgroundColor=b6e3f4,c0aede`} alt={p.name}
                    className="w-7 h-7 rounded-full bg-slate-700 shrink-0 grayscale opacity-60" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-red-200 block truncate">{p.name}</span>
                    <span className="text-xs font-bold text-red-400">{p.points} PTS</span>
                  </div>
                  <span className="text-lg">💀</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}


/* ═══════════════════════════════════════════
   MAIN – Home
   ═══════════════════════════════════════════ */
export default function Home() {
  const [tab, setTab] = useState<number>(0);

  return (
    <div className="min-h-screen bg-[#0a1628] text-blue-100 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 80px, #3b82f6 80px, #3b82f6 82px)" }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10">
        <header className="text-center pt-8 pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="bat-anim">🏏</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-sky-400">IPL Stats Dashboard</span>
          </h1>
          <p className="text-xs text-blue-400/40 mt-1">Auction League • Since 2020</p>
        </header>

        <nav className="max-w-3xl mx-auto px-4 mb-6">
          <div className="flex gap-1 bg-blue-950/50 rounded-xl p-1 border border-blue-800/20">
            {TABS.map((label, i) => (
              <button key={label} onClick={() => setTab(i)}
                className={`flex-1 py-2 px-1 text-[10px] md:text-sm font-semibold rounded-lg transition-all ${
                  tab === i
                    ? "bg-blue-700/30 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.12)]"
                    : "text-blue-400/50 hover:text-sky-300 hover:bg-blue-900/20"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 pb-16">
          {tab === 0 && <SeasonTab />}
          {tab === 1 && <StandingsTab />}
          {tab === 2 && <MedalsTab />}
          {tab === 3 && <AllTimeTab />}
        {tab === 4 && <GuessGameTab />}
        </main>

        <div className="text-center pb-8">
          <a href="/admin" className="text-blue-600/30 hover:text-blue-400/50 text-xs transition-colors">⚙️</a>
        </div>
      </div>
    </div>
  );
}
