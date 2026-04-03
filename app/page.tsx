"use client";
import { useState, useEffect, useRef } from "react";
import { medalTable, allTimeWinnings, combinedPodiums } from "./data";
import { useLiveSeasonData, useLiveMatches } from "./useFirestore";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

/* ───── constants ───── */
const TABS = ["🏏 Season 2026", "📊 Standings 2026", "🏅 Medals 2026", "🏆 All-Time"] as const;

const PLAYER_LIST = [
  "Harsha","Vignesh","Sidhu","Jaydev","Aditya","Karthik",
  "Sreeram","Manju","Anoop","Ravindra","Ankit","Prithvi",
  "Ranjith","Shashi","Shiva","Vinay (Babu)",
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

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

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
    (m) => m.matchDate === tomorrow && !hasWinners(m) && (m.contestCode || m.contestLink),
  );
  const completedGames = matches
    .filter((m) => hasWinners(m) && m.matchDate !== today)
    .reverse();

  const renderWinners = (m: { winnings: Record<string, number> }) => {
    const winners = PLAYER_LIST
      .map((p) => ({ name: p, amt: m.winnings?.[p] ?? 0 }))
      .filter((w) => w.amt > 0)
      .sort((a, b) => b.amt - a.amt);
    if (!winners.length) return <span className="text-sky-400/60 text-sm">⏳ Awaiting results...</span>;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {winners.map((w) => (
          <span key={w.name} className="text-xs bg-sky-900/40 rounded px-1.5 py-0.5">
            {getPrizeEmoji(w.amt)} {w.name} ₹{formatNum(w.amt)}
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
                  {(m.contestCode || m.contestLink) && (
                    <span className="text-xs text-sky-400/80">
                      {m.contestLink ? (
                        <a href={m.contestLink} target="_blank" rel="noreferrer" className="underline">
                          Contest ↗
                        </a>
                      ) : (
                        <>Code: {m.contestCode}</>
                      )}
                    </span>
                  )}
                </div>
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
                    <span className="text-xs text-blue-400/70">
                      {m.contestLink ? (
                        <a href={m.contestLink} target="_blank" rel="noreferrer" className="underline">
                          Contest ↗
                        </a>
                      ) : (
                        <>Code: {m.contestCode}</>
                      )}
                    </span>
                  )}
                  <span className="text-xs text-blue-300/50">Upcoming</span>
                </div>
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

  if (loading) return <p className="text-center text-sky-300 py-12 animate-pulse">Loading standings…</p>;

  const invested = totalInvested;
  const sorted = [...players]
    .map((p) => {
      const total = p.matchWinnings.reduce((s, v) => s + v, 0);
      return { ...p, total, profit: total - invested };
    })
    .sort((a, b) => b.total - a.total);

  const maxReturn = Math.max(...sorted.map((p) => p.total), 1);

  /* Build cumulative chart data from live match winnings */
  const chartData: Record<string, number | string>[] = [
    { match: "Start", ...Object.fromEntries(PLAYER_LIST.map((n) => [n, 0])) },
  ];
  const maxMatchLen = Math.max(...players.map((p) => p.matchWinnings.length), 0);
  for (let i = 0; i < maxMatchLen; i++) {
    const point: Record<string, number | string> = { match: `M${i + 1}` };
    for (const p of players) {
      const cum = p.matchWinnings.slice(0, i + 1).reduce((s, v) => s + v, 0);
      point[p.name] = cum;
    }
    chartData.push(point);
  }

  const rankBadge = (i: number) => {
    if (i === 0) return <span className="text-lg">🥇</span>;
    if (i === 1) return <span className="text-lg">🥈</span>;
    if (i === 2) return <span className="text-lg">🥉</span>;
    return <span className="text-xs text-slate-500 font-mono w-6 text-center">#{i + 1}</span>;
  };

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-sky-400/70">
        {completedMatches} matches completed • ₹{formatNum(invested)} in-points per player
      </p>

      {/* Cumulative winnings chart */}
      <div className="bg-slate-800/30 rounded-xl p-4">
        <h4 className="text-sky-300 text-sm font-semibold mb-3">Cumulative Winnings</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="match" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {PLAYER_LIST.map((name, idx) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[idx]}
                strokeWidth={1.5}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Player cards */}
      <div className="space-y-2">
        {sorted.map((p, i) => {
          const pct = maxReturn > 0 ? (p.total / maxReturn) * 100 : 0;
          return (
            <div key={p.name} className="bg-slate-800/40 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                {rankBadge(i)}
                <span className="font-medium text-sky-100 flex-1">{p.name}</span>
                <span className="text-xs text-slate-400">In-Points: ₹{formatNum(invested)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-sky-300">₹{formatNum(p.total)}</span>
                <span className={p.profit >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {p.profit >= 0 ? "+" : ""}₹{formatNum(Math.abs(p.profit))}
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400"
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   TAB 3 – Medals
   ═══════════════════════════════════════════ */
function MedalsTab() {
  const sorted = [...medalTable].sort(
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
   MAIN – Home
   ═══════════════════════════════════════════ */
export default function Home() {
  const [tab, setTab] = useState<number>(0);

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <h1 className="text-center text-2xl font-bold text-sky-300 mb-4">
          🏏 IPL Fantasy League
        </h1>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map((label, i) => (
            <button
              key={label}
              onClick={() => setTab(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === i
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 0 && <SeasonTab />}
        {tab === 1 && <StandingsTab />}
        {tab === 2 && <MedalsTab />}
        {tab === 3 && <AllTimeTab />}

        {/* Admin link */}
        <div className="mt-12 text-center">
          <a href="/admin" className="text-blue-600/30 hover:text-blue-500/50 transition-colors text-sm">
            ⚙️
          </a>
        </div>
      </div>
    </main>
  );
}
