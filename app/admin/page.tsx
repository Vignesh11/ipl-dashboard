"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

const ADMIN_PASSWORD = "bawa2026";

const PLAYERS = [
  "Aditya", "Ankit", "Anoop", "Harsha", "Jaydev", "Karthik",
  "Manju", "Prithvi", "Ranjith", "Ravindra", "Shashi", "Shiva",
  "Sidhu", "Sreeram", "Vignesh", "Vinay (Babu)",
];

const PRIZE_OPTIONS = [0, 200, 400, 500, 1000, 1500, 2000, 3000];

interface MatchData {
  matchNum: number;
  matchDate: string;
  matchInfo: string;
  betAmount: number;
  contestLink: string;
  contestCode: string;
  winners: string[];
  winnings: Record<string, number>;
  updatedAt: string;
}

function initWinnings(): Record<string, number> {
  const r: Record<string, number> = {};
  PLAYERS.forEach((p) => (r[p] = 0));
  return r;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [matchNum, setMatchNum] = useState(0);
  const [matchDate, setMatchDate] = useState("");
  const [matchInfo, setMatchInfo] = useState("");
  const [betAmount, setBetAmount] = useState(3200);
  const [contestLink, setContestLink] = useState("");
  const [contestCode, setContestCode] = useState("");
  const [winnings, setWinnings] = useState<Record<string, number>>(initWinnings);
  const [cancelled, setCancelled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [existingMatches, setExistingMatches] = useState<MatchData[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authed) return;
    getDocs(collection(db, "matches")).then((snap) => {
      const matches = snap.docs.map((d) => d.data() as MatchData);
      matches.sort((a, b) => a.matchNum - b.matchNum);
      setExistingMatches(matches);
    });
  }, [authed, refreshKey]);

  useEffect(() => {
    if (!authed) return;
    getDoc(doc(db, "matches", `match_${matchNum}`)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as MatchData;
        setMatchDate(data.matchDate || new Date().toISOString().split("T")[0]);
        setMatchInfo(data.matchInfo || "");
        setBetAmount(data.betAmount || 3200);
        setContestLink(data.contestLink || "");
        setContestCode(data.contestCode || "");
        setWinnings(data.winnings || initWinnings());
        setCancelled(!!(data as MatchData & { cancelled?: boolean }).cancelled);
      } else {
        setMatchDate("");
        setMatchInfo("");
        setBetAmount(3200);
        setContestLink("");
        setContestCode("");
        setWinnings(initWinnings());
        setCancelled(false);
      }
    });
  }, [matchNum, authed]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="bg-blue-950/50 border border-blue-800/30 rounded-xl p-8 w-80">
          <h1 className="text-xl font-bold text-sky-300 mb-4 text-center">🔐 Admin Login</h1>
          <input type="password" placeholder="Enter password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && password === ADMIN_PASSWORD && setAuthed(true)}
            className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 placeholder-blue-500/40 mb-3" />
          <button onClick={() => { if (password === ADMIN_PASSWORD) setAuthed(true); else setMessage("Wrong password"); }}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg">Login</button>
          {message && <p className="text-red-400 text-sm mt-2 text-center">{message}</p>}
        </div>
      </div>
    );
  }

  const totalAwarded = Object.values(winnings).reduce((a, b) => a + b, 0);
  const winners = PLAYERS.filter((p) => winnings[p] > 0);

  function handleRainRefund() {
    const refundPerPlayer = Math.floor(betAmount / PLAYERS.length);
    const refund: Record<string, number> = {};
    PLAYERS.forEach((p) => (refund[p] = refundPerPlayer));
    setWinnings(refund);
    setCancelled(true);
    setMatchInfo((prev) => prev ? prev + " — ☔ Rained Out" : "☔ Rained Out");
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await setDoc(doc(db, "matches", `match_${matchNum}`), {
        matchNum, matchDate, matchInfo, betAmount, contestLink, contestCode, winners, winnings,
        cancelled,
        updatedAt: new Date().toISOString(),
      });
      setMessage(`Match ${matchNum} saved!`);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setMessage(`Error: ${err}`);
    }
    setSaving(false);
  }

  function exportCSV(matches: MatchData[]) {
    const sorted = [...matches].sort((a, b) => a.matchNum - b.matchNum);
    const header = ["Match", "Date", "Info", "Pot", ...PLAYERS];
    const rows = sorted.map((m) => [
      m.matchNum,
      m.matchDate || "",
      m.matchInfo || "",
      m.betAmount,
      ...PLAYERS.map((p) => m.winnings?.[p] || 0),
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ipl-2026-matches-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-sky-300 mb-1 text-center">🏏 Admin Panel</h1>
        <p className="text-xs text-blue-400/40 text-center mb-6">Enter match results — select prize for each winner</p>

        {/* Match setup */}
        <div className="bg-blue-950/40 border border-blue-800/25 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-blue-400/60 block mb-1">Match #</label>
              <input type="number" min={1} max={74} value={matchNum}
                onChange={(e) => setMatchNum(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 text-center" />
            </div>
            <div>
              <label className="text-xs text-blue-400/60 block mb-1">Date</label>
              <input type="date" value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 text-center" />
            </div>
            <div>
              <label className="text-xs text-blue-400/60 block mb-1">Total Pot (₹)</label>
              <input type="number" min={0} step={100} value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 text-center" />
            </div>
          </div>
          <div>
            <label className="text-xs text-blue-400/60 block mb-1">Match Info</label>
            <input type="text" placeholder="e.g. CSK vs MI at Chennai" value={matchInfo}
              onChange={(e) => setMatchInfo(e.target.value)}
              className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 placeholder-blue-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-blue-400/60 block mb-1">Contest Link</label>
              <input type="text" placeholder="https://..." value={contestLink}
                onChange={(e) => setContestLink(e.target.value)}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 placeholder-blue-500/30 text-sm" />
            </div>
            <div>
              <label className="text-xs text-blue-400/60 block mb-1">Contest Code</label>
              <input type="text" placeholder="e.g. ABC123" value={contestCode}
                onChange={(e) => setContestCode(e.target.value)}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 placeholder-blue-500/30 text-sm" />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={handleRainRefund}
            className="px-4 py-2 bg-amber-700/30 hover:bg-amber-600/30 text-amber-300 text-sm rounded-lg border border-amber-700/20 transition-colors">
            ☔ Rain Out (₹{Math.floor(betAmount / PLAYERS.length)} refund each)
          </button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={cancelled} onChange={(e) => setCancelled(e.target.checked)}
              className="w-4 h-4 rounded bg-blue-900/30 border-blue-700/30 accent-amber-500" />
            <span className={`text-sm ${cancelled ? "text-amber-300" : "text-blue-400/50"}`}>
              {cancelled ? "☔ Cancelled (no medals)" : "Mark as cancelled"}
            </span>
          </label>
        </div>

        {/* Player prize selection */}
        <div className="bg-blue-950/40 border border-blue-800/25 rounded-xl overflow-hidden mb-4">
          <div className="px-4 py-2 bg-blue-900/25 border-b border-blue-800/25 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase">Set Prize Per Player</span>
            <span className="text-xs text-blue-400/50">Total: ₹{totalAwarded.toLocaleString("en-IN")} / ₹{betAmount.toLocaleString("en-IN")}</span>
          </div>
          {PLAYERS.map((player) => (
            <div key={player} className={`px-4 py-2.5 border-b border-blue-900/15 flex items-center justify-between ${winnings[player] > 0 ? "bg-emerald-900/15" : ""}`}>
              <span className={`text-sm ${winnings[player] > 0 ? "text-emerald-300 font-semibold" : "text-blue-300/60"}`}>
                {winnings[player] > 0 ? "🏆 " : ""}{player}
              </span>
              <div className="flex items-center gap-1">
                {PRIZE_OPTIONS.map((amt) => (
                  <button key={amt} onClick={() => setWinnings({ ...winnings, [player]: amt })}
                    className={`px-2 py-1 text-xs rounded transition-all ${
                      winnings[player] === amt
                        ? amt > 0 ? "bg-emerald-600 text-white font-bold" : "bg-blue-700/40 text-blue-300"
                        : "bg-blue-900/20 text-blue-400/40 hover:bg-blue-800/30"
                    }`}>
                    {amt === 0 ? "–" : `₹${amt}`}
                  </button>
                ))}
                <input type="number" min={0} step={100}
                  value={winnings[player] || ""}
                  onChange={(e) => setWinnings({ ...winnings, [player]: parseInt(e.target.value) || 0 })}
                  placeholder="Custom"
                  className="w-16 px-1 py-1 text-xs bg-blue-900/20 border border-blue-700/20 rounded text-blue-100 text-right placeholder-blue-600/30" />
              </div>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 justify-center">
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white font-semibold rounded-lg transition-colors">
            {saving ? "Saving..." : `Save Match ${matchNum}`}
          </button>
        </div>
        {message && (
          <p className={`text-center text-sm mt-3 ${message.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}>{message}</p>
        )}

        {/* Match History */}
        {existingMatches.length > 0 && (
          <div className="mt-8 bg-blue-950/40 border border-blue-800/25 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-blue-900/25 border-b border-blue-800/25">
              <span className="text-xs font-bold text-sky-400 uppercase">Match History</span>
            </div>
            {existingMatches.map((m) => {
              const mWinners = PLAYERS.filter((p) => (m.winnings?.[p] || 0) > 0)
                .sort((a, b) => (m.winnings[b] || 0) - (m.winnings[a] || 0));
              return (
                <div key={m.matchNum} onClick={() => setMatchNum(m.matchNum)}
                  className="px-4 py-3 border-b border-blue-900/15 hover:bg-blue-900/10 cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-blue-200">M{m.matchNum} {m.matchInfo && `— ${m.matchInfo}`}</span>
                    <span className="text-xs text-blue-400/40">₹{m.betAmount}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {mWinners.map((w) => (
                      <span key={w} className="text-xs bg-emerald-900/30 text-emerald-300 px-2 py-0.5 rounded-full">
                        {w}: ₹{m.winnings[w]}
                      </span>
                    ))}
                    {mWinners.length === 0 && <span className="text-xs text-blue-500/30">No winners set</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Export */}
        <div className="mt-8 flex justify-center">
          <button onClick={() => exportCSV(existingMatches)}
            className="px-4 py-2 bg-blue-800/30 hover:bg-blue-700/30 text-sky-300 text-sm rounded-lg border border-blue-700/20 transition-colors">
            📥 Export CSV
          </button>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <a href="/" className="text-sky-400/60 hover:text-sky-300 text-sm underline">← Dashboard</a>
        </div>
      </div>
    </div>
  );
}
