"use client";
import { useState } from "react";
import { medalTable, allTimeWinnings, cumulativeGraph2026, combinedPodiums } from "./data";
import { useLiveSeasonData } from "./useFirestore";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, Cell,
} from "recharts";

const TABS = ["🏏 Season 2026", "🏅 Medals", "🏆 All-Time", "📈 Graphs"] as const;
type Tab = (typeof TABS)[number];

const COLORS = [
  "#60a5fa", "#f59e0b", "#34d399", "#ef4444", "#a78bfa",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#e879f9",
  "#22d3ee", "#fb7185", "#818cf8", "#84cc16", "#0ea5e9", "#d946ef",
];

function formatNum(n: number) {
  return n.toLocaleString("en-IN");
}

// ===== Tab 1: Season 2026 (Live from Firestore) =====
function SeasonTab() {
  const { players, loading } = useLiveSeasonData();
  const BET_PER_MATCH = 200;

  if (loading) return <div className="text-center text-blue-400/50 py-10">Loading live data...</div>;
  if (players.length === 0 || players.every((p) => p.matchWinnings.length === 0))
    return <div className="text-center text-blue-400/50 py-10">No match data yet. Admin needs to enter results.</div>;

  const enriched = players.map((p) => {
    const matches = p.matchWinnings.length;
    const invested = matches * BET_PER_MATCH;
    const totalReturn = p.matchWinnings.reduce((a, b) => a + b, 0);
    const profit = totalReturn - invested;
    return { ...p, invested, totalReturn, profit };
  });
  const maxReturn = Math.max(...enriched.map((p) => p.totalReturn), 1);
  const sorted = [...enriched].sort((a, b) => b.totalReturn - a.totalReturn);

  return (
    <div className="space-y-3">
      {sorted.map((p, i) => {
        const rank = i + 1;
        const barWidth = Math.max(2, (p.totalReturn / maxReturn) * 100);
        return (
          <div key={p.name} className="bg-blue-950/40 border border-blue-800/25 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0 ${
                rank === 1 ? "bg-yellow-500 text-black" : rank === 2 ? "bg-gray-400 text-black" : rank === 3 ? "bg-amber-700 text-white" : "bg-blue-900/50 text-blue-400/70"
              }`}>{rank}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-blue-100 truncate">{p.name}</p>
                <p className="text-xs text-blue-400/40">Invested: {formatNum(p.invested)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sky-400">{formatNum(p.totalReturn)} <span className="text-xs text-blue-400/40">return</span></p>
                <p className={`text-xs font-semibold ${p.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {p.profit >= 0 ? "+" : ""}{formatNum(p.profit)} profit
                </p>
              </div>
            </div>
            <div className="h-1.5 bg-blue-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-500 to-blue-400 rounded-full transition-all" style={{ width: `${barWidth}%` }} />
            </div>
            <div className="flex gap-1 mt-2">
              {p.matchWinnings.map((w, mi) => (
                <div key={mi} className="flex-1 text-center">
                  <div className={`text-[10px] font-mono ${w > 0 ? "text-sky-400" : "text-blue-800/40"}`}>
                    {w > 0 ? formatNum(w) : "·"}
                  </div>
                  <div className="text-[9px] text-blue-700/30">M{mi + 1}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ===== Tab 2: Medals =====
function MedalsTab() {
  const sorted = [...medalTable].sort((a, b) => {
    if (b.gold !== a.gold) return b.gold - a.gold;
    if (b.silver !== a.silver) return b.silver - a.silver;
    if (b.bronze !== a.bronze) return b.bronze - a.bronze;
    return b.total - a.total;
  });
  return (
    <div className="border border-blue-800/25 rounded-xl overflow-hidden bg-blue-950/30">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 px-4 py-3 bg-blue-900/25 border-b border-blue-800/25 text-xs font-bold text-sky-400 uppercase tracking-wider">
        <span>Player</span>
        <span className="text-center w-10">🥇</span>
        <span className="text-center w-10">🥈</span>
        <span className="text-center w-10">🥉</span>
        <span className="text-center w-10">🎖️</span>
        <span className="text-center w-10">Tot</span>
      </div>
      {sorted.map((m) => (
        <div key={m.name} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-2 px-4 py-2.5 border-b border-blue-900/15 hover:bg-blue-900/10 transition-colors">
          <span className="font-semibold text-blue-100 truncate">{m.name}</span>
          <span className="text-center w-10 text-yellow-400 font-bold">{m.gold || "–"}</span>
          <span className="text-center w-10 text-gray-300 font-bold">{m.silver || "–"}</span>
          <span className="text-center w-10 text-amber-600 font-bold">{m.bronze || "–"}</span>
          <span className="text-center w-10 text-blue-400/50 font-bold">{m.consolation || "–"}</span>
          <span className="text-center w-10 text-sky-300 font-bold">{m.total}</span>
        </div>
      ))}
    </div>
  );
}

// ===== Tab 3: All-Time =====
function AllTimeTab() {
  const barData = allTimeWinnings.map((e) => ({ name: e.name, total: e.total }));
  return (
    <div className="space-y-6">
      <div className="bg-blue-950/30 border border-blue-800/25 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barData} layout="vertical" margin={{ left: 80, right: 20 }}>
            <XAxis type="number" tick={{ fill: "#7dd3fc", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#bae6fd", fontSize: 11 }} width={75} />
            <Tooltip
              contentStyle={{ background: "#0c1929", border: "1px solid #1e3a5f", borderRadius: 8, color: "#bae6fd" }}
              formatter={(v) => [formatNum(Number(v)), "Total"]}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.total >= 0 ? "#38bdf8" : "#ef4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="border border-blue-800/25 rounded-xl overflow-hidden bg-blue-950/30">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-900/25 border-b border-blue-800/25 text-xs text-sky-400 uppercase tracking-wider">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Player</th>
                <th className="px-3 py-2 text-right">2025</th>
                <th className="px-3 py-2 text-right">2024</th>
                <th className="px-3 py-2 text-right">2023</th>
                <th className="px-3 py-2 text-right">2022</th>
                <th className="px-3 py-2 text-right">2021</th>
                <th className="px-3 py-2 text-right">2020</th>
                <th className="px-3 py-2 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {allTimeWinnings.map((e) => (
                <tr key={e.name} className="border-b border-blue-900/15 hover:bg-blue-900/10">
                  <td className="px-3 py-2 text-blue-400/50">{e.rank}</td>
                  <td className="px-3 py-2 font-semibold text-blue-100">{e.name}</td>
                  {[e.y2025, e.y2024, e.y2023, e.y2022, e.y2021, e.y2020].map((v, i) => (
                    <td key={i} className={`px-3 py-2 text-right ${v > 0 ? "text-emerald-400" : v < 0 ? "text-red-400" : "text-blue-800/40"}`}>
                      {v !== 0 ? formatNum(v) : "–"}
                    </td>
                  ))}
                  <td className={`px-3 py-2 text-right font-bold ${e.total >= 0 ? "text-sky-300" : "text-red-400"}`}>
                    {formatNum(e.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===== Tab 4: Graphs =====
function GraphsTab() {
  const players = Object.keys(cumulativeGraph2026[0]).filter((k) => k !== "match");
  const activePlayers = players.filter((p) =>
    cumulativeGraph2026.some((d) => (d[p] as number) > 0)
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-950/30 border border-blue-800/25 rounded-xl p-4">
        <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-4">IPL 2026 — Cumulative Winnings</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={cumulativeGraph2026}>
            <XAxis dataKey="match" tick={{ fill: "#7dd3fc", fontSize: 11 }} label={{ value: "Match", position: "insideBottom", offset: -5, fill: "#7dd3fc" }} />
            <YAxis tick={{ fill: "#7dd3fc", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
            <Tooltip
              contentStyle={{ background: "#0c1929", border: "1px solid #1e3a5f", borderRadius: 8, color: "#bae6fd", fontSize: 12 }}
              formatter={(v, name) => [formatNum(Number(v)), String(name)]}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "#bae6fd" }} />
            {activePlayers.map((player, i) => (
              <Line
                key={player}
                type="monotone"
                dataKey={player}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-blue-800/25 rounded-xl overflow-hidden bg-blue-950/30">
        <div className="bg-blue-900/25 px-4 py-3 border-b border-blue-800/25">
          <span className="text-sm font-bold text-sky-400 uppercase tracking-wider">All-Time Podium Scores</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-800/25 text-xs text-sky-400 uppercase tracking-wider">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Player</th>
                <th className="px-3 py-2 text-right">2025</th>
                <th className="px-3 py-2 text-right">2024</th>
                <th className="px-3 py-2 text-right">2023</th>
                <th className="px-3 py-2 text-right">2022</th>
                <th className="px-3 py-2 text-right">2021</th>
                <th className="px-3 py-2 text-right">2020</th>
                <th className="px-3 py-2 text-right font-bold">Total</th>
                <th className="px-3 py-2 text-right">Avg</th>
              </tr>
            </thead>
            <tbody>
              {combinedPodiums.map((e) => (
                <tr key={e.name} className="border-b border-blue-900/15 hover:bg-blue-900/10">
                  <td className="px-3 py-2 text-blue-400/50">{e.rank}</td>
                  <td className="px-3 py-2 font-semibold text-blue-100">{e.name}</td>
                  {[e.y2025, e.y2024, e.y2023, e.y2022, e.y2021, e.y2020].map((v, i) => (
                    <td key={i} className="px-3 py-2 text-right text-sky-300/60">
                      {v !== null ? v : "–"}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right font-bold text-sky-300">{e.total}</td>
                  <td className="px-3 py-2 text-right text-sky-400/50">{e.avg.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===== Main Page =====
export default function Home() {
  const [tab, setTab] = useState<Tab>(TABS[0]);

  return (
    <div className="min-h-screen bg-[#0a1628] text-blue-100 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 80px, #3b82f6 80px, #3b82f6 82px)" }}
      />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10">
        <header className="text-center pt-8 pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-sky-400">
            🏏 IPL Stats Dashboard
          </h1>
          <p className="text-xs text-blue-400/40 mt-1">Auction League • 2020–2026</p>
        </header>

        <nav className="max-w-3xl mx-auto px-4 mb-6">
          <div className="flex gap-1 bg-blue-950/50 rounded-xl p-1 border border-blue-800/20">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 px-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                  tab === t
                    ? "bg-blue-700/30 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.12)]"
                    : "text-blue-400/50 hover:text-sky-300 hover:bg-blue-900/20"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 pb-16">
          {tab === TABS[0] && <SeasonTab />}
          {tab === TABS[1] && <MedalsTab />}
          {tab === TABS[2] && <AllTimeTab />}
          {tab === TABS[3] && <GraphsTab />}
        </main>
      </div>
    </div>
  );
}
