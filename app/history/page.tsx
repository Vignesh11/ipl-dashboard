"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

const PLAYERS = [
  "Harsha", "Vignesh", "Sidhu", "Jaydev", "Aditya", "Karthik",
  "Sreeram", "Manju", "Anoop", "Ravindra", "Ankit", "Prithvi",
  "Ranjith", "Shashi", "Shiva", "Vinay (Babu)",
];

interface MatchData {
  matchNum: number;
  matchInfo: string;
  betAmount: number;
  winnings: Record<string, number>;
}

function formatNum(n: number) {
  return n.toLocaleString("en-IN");
}

function getPrizeLabel(amount: number) {
  if (amount === 1500) return { label: "🥇", color: "text-yellow-400" };
  if (amount === 1000) return { label: "🥈", color: "text-gray-300" };
  if (amount === 500) return { label: "🥉", color: "text-amber-600" };
  if (amount === 200) return { label: "🎖️", color: "text-blue-400/60" };
  return { label: "", color: "" };
}

export default function HistoryPage() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "matches"), (snap) => {
      const data = snap.docs.map((d) => d.data() as MatchData);
      data.sort((a, b) => a.matchNum - b.matchNum);
      setMatches(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center text-blue-400/50">Loading...</div>
  );

  return (
    <div className="min-h-screen bg-[#0a1628] text-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center pt-6 pb-6">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-300">
            📋 Match Overview
          </h1>
          <p className="text-xs text-blue-400/40 mt-1">Game vs Winners — IPL 2026</p>
        </header>

        {/* Match cards */}
        <div className="space-y-4">
          {matches.map((m) => {
            const winners = PLAYERS
              .filter((p) => (m.winnings?.[p] || 0) > 0)
              .sort((a, b) => (m.winnings[b] || 0) - (m.winnings[a] || 0));

            return (
              <div key={m.matchNum} className="bg-blue-950/40 border border-blue-800/25 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-blue-900/25 border-b border-blue-800/25 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-sky-300">Match {m.matchNum}</span>
                    {m.matchInfo && <span className="text-xs text-blue-400/40 ml-2">{m.matchInfo}</span>}
                  </div>
                  <span className="text-xs text-blue-400/40">Pot: ₹{formatNum(m.betAmount)}</span>
                </div>
                <div className="p-4">
                  {winners.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {winners.map((w, i) => {
                        const amount = m.winnings[w];
                        const { label, color } = getPrizeLabel(amount);
                        return (
                          <div key={w} className="flex items-center gap-2 bg-blue-900/20 rounded-lg px-3 py-2">
                            <span className="text-lg">{label}</span>
                            <div>
                              <p className="text-sm font-semibold text-blue-100">{w}</p>
                              <p className={`text-xs font-bold ${color}`}>₹{formatNum(amount)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-blue-500/30">No winners recorded</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {matches.length === 0 && (
          <p className="text-center text-blue-400/40 py-10">No matches yet</p>
        )}

        {/* Summary table */}
        {matches.length > 0 && (
          <div className="mt-8 border border-blue-800/25 rounded-xl overflow-hidden bg-blue-950/30">
            <div className="px-4 py-2 bg-blue-900/25 border-b border-blue-800/25">
              <span className="text-xs font-bold text-sky-400 uppercase">Player Summary</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-800/25 text-xs text-sky-400 uppercase">
                    <th className="px-3 py-2 text-left">Player</th>
                    <th className="px-3 py-2 text-center">🥇</th>
                    <th className="px-3 py-2 text-center">🥈</th>
                    <th className="px-3 py-2 text-center">🥉</th>
                    <th className="px-3 py-2 text-center">🎖️</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {PLAYERS
                    .map((p) => {
                      let gold = 0, silver = 0, bronze = 0, consolation = 0, total = 0;
                      matches.forEach((m) => {
                        const amt = m.winnings?.[p] || 0;
                        total += amt;
                        if (amt === 1500) gold++;
                        else if (amt === 1000) silver++;
                        else if (amt === 500) bronze++;
                        else if (amt === 200) consolation++;
                      });
                      return { name: p, gold, silver, bronze, consolation, total };
                    })
                    .sort((a, b) => b.total - a.total)
                    .map((p) => (
                      <tr key={p.name} className="border-b border-blue-900/15 hover:bg-blue-900/10">
                        <td className="px-3 py-2 font-semibold text-blue-100">{p.name}</td>
                        <td className="px-3 py-2 text-center text-yellow-400">{p.gold || "–"}</td>
                        <td className="px-3 py-2 text-center text-gray-300">{p.silver || "–"}</td>
                        <td className="px-3 py-2 text-center text-amber-600">{p.bronze || "–"}</td>
                        <td className="px-3 py-2 text-center text-blue-400/50">{p.consolation || "–"}</td>
                        <td className={`px-3 py-2 text-right font-bold ${p.total > 0 ? "text-sky-300" : "text-blue-800/40"}`}>
                          {p.total > 0 ? `₹${formatNum(p.total)}` : "–"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <a href="/" className="text-sky-400/60 hover:text-sky-300 text-sm underline">← Dashboard</a>
          <a href="/admin" className="text-sky-400/60 hover:text-sky-300 text-sm underline">🔐 Admin</a>
        </div>
      </div>
    </div>
  );
}
