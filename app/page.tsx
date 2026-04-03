"use client";
import { useState } from "react";
import { medalTable, allTimeWinnings, combinedPodiums } from "./data";
import { useLiveSeasonData, useLiveMatches } from "./useFirestore";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const TABS = ["📋 Matches 2026", "🏏 Standings 2026", "🏅 Medals 2026", "🏆 All-Time", "📈 Graphs 2026"] as const;
type Tab = (typeof TABS)[number];

const COLORS = [
  "#60a5fa", "#f59e0b", "#34d399", "#ef4444", "#a78bfa",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#e879f9",
  "#22d3ee", "#fb7185", "#818cf8", "#84cc16", "#0ea5e9", "#d946ef",
];

function formatNum(n: number) {
  return n.toLocaleString("en-IN");
}

// ===== Tab 1: Matches 2026 =====
function MatchesTab() {
  const { matches, loading } = useLiveMatches();
  const PLAYERS = [
    "Harsha", "Vignesh", "Sidhu", "Jaydev", "Aditya", "Karthik",
    "Sreeram", "Manju", "Anoop", "Ravindra", "Ankit", "Prithvi",
    "Ranjith", "Shashi", "Shiva", "Vinay (Babu)",
  ];

  if (loading) return <div className="text-center text-blue-400/50 py-10">Loading...</div>;
  if (matches.length === 0) return <div className="text-center text-blue-400/50 py-10">No matches yet</div>;

  const reversed = [...matches].reverse(); // newest first

  // Find today's game (highest match number without winners) and completed games
  const PLAYER_LIST = [
    "Harsha", "Vignesh", "Sidhu", "Jaydev", "Aditya", "Karthik",
    "Sreeram", "Manju", "Anoop", "Ravindra", "Ankit", "Prithvi",
    "Ranjith", "Shashi", "Shiva", "Vinay (Babu)",
  ];
  const hasWinners = (m: typeof matches[0]) =>
    PLAYER_LIST.some((p) => (m.winnings?.[p] || 0) > 0);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const todaysGames = reversed.filter((m) => m.matchDate === today);
  const tomorrowsGames = reversed.filter((m) => m.matchDate === tomorrow && !hasWinners(m));
  const completedGames = reversed.filter((m) => hasWinners(m) && m.matchDate !== today);

  function getPrizeEmoji(amt: number) {
    if (amt >= 1500) return "🥇";
    if (amt >= 1000) return "🥈";
    if (amt >= 500) return "🥉";
    if (amt > 0) return "🎖️";
    return "";
  }

  return (
    <div className="space-y-4">
      {/* Today's games - highlighted */}
      {todaysGames.length > 0 && (
        <div>
          <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span></span>
            Today&apos;s Game{todaysGames.length > 1 ? "s" : ""}
          </div>
          <div className="space-y-3">
            {todaysGames.map((m) => (
              <div key={m.matchNum} className="rounded-xl border-2 border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.15)] bg-gradient-to-b from-sky-900/20 to-blue-950/40 overflow-hidden">
                <div className="px-4 py-3 bg-sky-900/20 border-b border-sky-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-sky-200">Match {m.matchNum}</span>
                    {m.matchInfo && <span className="text-xs text-sky-300/50 ml-2">{m.matchInfo}</span>}
                  </div>
                  <span className="text-xs text-sky-300/50">₹{formatNum(m.betAmount)}</span>
                </div>
                {(m.contestLink || m.contestCode) && (
                  <div className="px-4 py-2.5 border-b border-sky-500/15 flex items-center gap-3 bg-sky-900/10">
                    {m.contestCode && <span className="text-xs bg-sky-800/40 text-sky-200 px-2.5 py-1 rounded font-mono font-bold">Code: {m.contestCode}</span>}
                    {m.contestLink && <a href={m.contestLink} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-300 hover:text-sky-200 underline font-semibold">Join Contest →</a>}
                  </div>
                )}
                <div className="p-4">
                  {hasWinners(m) ? (
                    <div className="flex flex-wrap gap-2">
                      {PLAYER_LIST.filter((p) => (m.winnings?.[p] || 0) > 0)
                        .sort((a, b) => (m.winnings[b] || 0) - (m.winnings[a] || 0))
                        .map((w) => (
                          <div key={w} className="flex items-center gap-1.5 bg-sky-900/20 rounded-lg px-3 py-1.5">
                            <span className="text-sm">{getPrizeEmoji(m.winnings[w])}</span>
                            <span className="text-sm text-sky-100">{w}</span>
                            <span className="text-xs text-emerald-400/70">₹{formatNum(m.winnings[w])}</span>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-sky-300/60 italic">⏳ Awaiting results...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed games */}
      {completedGames.length > 0 && (
        <div>
          <div className="text-xs font-bold text-blue-400/50 uppercase tracking-wider mb-2 mt-4">Completed ({completedGames.length})</div>
          <div className="space-y-3">
            {completedGames.map((m) => renderMatch(m))}
          </div>
        </div>
      )}
    </div>
  );

  function renderMatch(m: typeof matches[0]) {
    const winners = PLAYER_LIST
      .filter((p) => (m.winnings?.[p] || 0) > 0)
      .sort((a, b) => (m.winnings[b] || 0) - (m.winnings[a] || 0));
    return (
      <div key={m.matchNum} className="bg-blue-950/40 border border-blue-800/25 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-blue-900/25 border-b border-blue-800/25 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-sky-300">Match {m.matchNum}</span>
            {m.matchInfo && <span className="text-xs text-blue-400/40 ml-2">{m.matchInfo}</span>}
          </div>
          <div className="text-right">
            {m.matchDate && <span className="text-[10px] text-blue-400/30 block">{m.matchDate}</span>}
            <span className="text-xs text-blue-400/40">₹{formatNum(m.betAmount)}</span>
          </div>
        </div>
        <div className="p-3">
          <div className="flex flex-wrap gap-2">
            {winners.map((w) => (
              <div key={w} className="flex items-center gap-1.5 bg-blue-900/20 rounded-lg px-3 py-1.5">
                <span className="text-sm">{getPrizeEmoji(m.winnings[w])}</span>
                <span className="text-sm text-blue-100">{w}</span>
                <span className="text-xs text-emerald-400/70">₹{formatNum(m.winnings[w])}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

// ===== Tab 2: Standings 2026 (Live) =====
function StandingsTab() {
  const { players, loading, totalMatches, completedMatches, totalInvested } = useLiveSeasonData();

  if (loading) return <div className="text-center text-blue-400/50 py-10">Loading live data...</div>;
  if (players.length === 0 || totalMatches === 0)
    return <div className="text-center text-blue-400/50 py-10">No match data yet.</div>;

  const invested = totalInvested;
  const enriched = players.map((p) => {
    const totalReturn = p.matchWinnings.reduce((a, b) => a + b, 0);
    const profit = totalReturn - invested;
    return { ...p, invested, totalReturn, profit };
  });
  const maxReturn = Math.max(...enriched.map((p) => p.totalReturn), 1);
  const sorted = [...enriched].sort((a, b) => b.totalReturn - a.totalReturn);

  return (
    <div className="space-y-3">
      <div className="text-center text-xs text-blue-400/40 mb-2">{completedMatches} matches completed • ₹{formatNum(invested)} invested per player</div>
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
                <p className="text-xs text-blue-400/40">Invested: ₹{formatNum(p.invested)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sky-400">₹{formatNum(p.totalReturn)} <span className="text-xs text-blue-400/40">return</span></p>
                <p className={`text-xs font-semibold ${p.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {p.profit >= 0 ? "+" : ""}₹{formatNum(p.profit)} profit
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

// ===== Tab 3: Medals 2026 =====
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

// ===== Tab 4: All-Time (table + podium scores) =====
function AllTimeTab() {
  return (
    <div className="space-y-6">
      {/* Winnings table */}
      <div className="border border-blue-800/25 rounded-xl overflow-hidden bg-blue-950/30">
        <div className="bg-blue-900/25 px-4 py-3 border-b border-blue-800/25">
          <span className="text-sm font-bold text-sky-400 uppercase tracking-wider">Combined Winnings (All Years)</span>
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

      {/* Podium scores table (moved from Graphs) */}
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

// ===== Tab 5: Graphs (line chart only) =====
function GraphsTab() {
  const { players, loading, totalMatches } = useLiveSeasonData();

  const liveGraphData: Record<string, number>[] = [];
  if (!loading && players.length > 0 && totalMatches > 0) {
    for (let m = 0; m <= totalMatches; m++) {
      const point: Record<string, number> = { match: m };
      players.forEach((p) => {
        let cumulative = 0;
        for (let i = 0; i < m; i++) cumulative += p.matchWinnings[i] || 0;
        point[p.name] = cumulative;
      });
      liveGraphData.push(point);
    }
  }

  if (loading) return <div className="text-center text-blue-400/50 py-10">Loading...</div>;
  if (liveGraphData.length === 0) return <div className="text-center text-blue-400/50 py-10">No data yet</div>;

  const playerKeys = Object.keys(liveGraphData[0]).filter((k) => k !== "match");
  const activePlayers = playerKeys.filter((p) =>
    liveGraphData.some((d) => (d[p] as number) > 0)
  );

  return (
    <div className="bg-blue-950/30 border border-blue-800/25 rounded-xl p-4">
      <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-4">IPL 2026 — Cumulative Winnings</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={liveGraphData}>
          <XAxis dataKey="match" tick={{ fill: "#7dd3fc", fontSize: 11 }} label={{ value: "Match", position: "insideBottom", offset: -5, fill: "#7dd3fc" }} />
          <YAxis tick={{ fill: "#7dd3fc", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
          <Tooltip
            contentStyle={{ background: "#0c1929", border: "1px solid #1e3a5f", borderRadius: 8, color: "#bae6fd", fontSize: 12 }}
            formatter={(v, name) => [formatNum(Number(v)), String(name)]}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#bae6fd" }} />
          {activePlayers.map((player, i) => (
            <Line key={player} type="monotone" dataKey={player} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ===== Main Page =====
export default function Home() {
  const [tab, setTab] = useState<Tab>(TABS[0]);

  return (
    <div className="min-h-screen bg-[#0a1628] text-blue-100 relative overflow-hidden">
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
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 px-1 text-[10px] md:text-sm font-semibold rounded-lg transition-all ${
                  tab === t
                    ? "bg-blue-700/30 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.12)]"
                    : "text-blue-400/50 hover:text-sky-300 hover:bg-blue-900/20"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 pb-16">
          {tab === TABS[0] && <MatchesTab />}
          {tab === TABS[1] && <StandingsTab />}
          {tab === TABS[2] && <MedalsTab />}
          {tab === TABS[3] && <AllTimeTab />}
          {tab === TABS[4] && <GraphsTab />}
        </main>
      </div>
    </div>
  );
}
