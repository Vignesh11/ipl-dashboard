"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

const ADMIN_PASSWORD = "bawa2026";

const PLAYERS = [
  "Harsha", "Vignesh", "Sidhu", "Jaydev", "Aditya", "Karthik",
  "Sreeram", "Manju", "Anoop", "Ravindra", "Ankit", "Prithvi",
  "Ranjith", "Shashi", "Shiva", "Vinay (Babu)",
];

interface MatchData {
  matchNum: number;
  matchInfo: string;
  betAmount: number;
  winners: string[];
  winnings: Record<string, number>;
  updatedAt: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [matchNum, setMatchNum] = useState(7);
  const [matchInfo, setMatchInfo] = useState("");
  const [betAmount, setBetAmount] = useState(3200);
  const [winners, setWinners] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [existingMatches, setExistingMatches] = useState<MatchData[]>([]);

  useEffect(() => {
    if (!authed) return;
    getDocs(collection(db, "matches")).then((snap) => {
      const matches = snap.docs.map((d) => d.data() as MatchData);
      matches.sort((a, b) => a.matchNum - b.matchNum);
      setExistingMatches(matches);
    });
  }, [authed, saving]);

  // Load existing match data when match number changes
  useEffect(() => {
    if (!authed) return;
    getDoc(doc(db, "matches", `match_${matchNum}`)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as MatchData;
        setMatchInfo(data.matchInfo || "");
        setBetAmount(data.betAmount || 3200);
        setWinners(data.winners || []);
      } else {
        setMatchInfo("");
        setBetAmount(3200);
        setWinners([]);
      }
    });
  }, [matchNum, authed]);

  function toggleWinner(name: string) {
    setWinners((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  // Calculate winnings: pot split among winners, losers get 0
  function calculateWinnings(): Record<string, number> {
    const result: Record<string, number> = {};
    const winnerShare = winners.length > 0 ? Math.floor(betAmount / winners.length) : 0;
    PLAYERS.forEach((p) => {
      result[p] = winners.includes(p) ? winnerShare : 0;
    });
    return result;
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="bg-blue-950/50 border border-blue-800/30 rounded-xl p-8 w-80">
          <h1 className="text-xl font-bold text-sky-300 mb-4 text-center">🔐 Admin Login</h1>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && password === ADMIN_PASSWORD && setAuthed(true)}
            className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 placeholder-blue-500/40 mb-3"
          />
          <button
            onClick={() => {
              if (password === ADMIN_PASSWORD) setAuthed(true);
              else setMessage("Wrong password");
            }}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition-colors"
          >
            Login
          </button>
          {message && <p className="text-red-400 text-sm mt-2 text-center">{message}</p>}
        </div>
      </div>
    );
  }

  const winnings = calculateWinnings();
  const winnerShare = winners.length > 0 ? Math.floor(betAmount / winners.length) : 0;

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      await setDoc(doc(db, "matches", `match_${matchNum}`), {
        matchNum,
        matchInfo,
        betAmount,
        winners,
        winnings,
        updatedAt: new Date().toISOString(),
      });
      setMessage(`Match ${matchNum} saved! ${winners.length} winner(s) × ₹${winnerShare} each`);
    } catch (err) {
      setMessage(`Error: ${err}`);
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-sky-300 mb-1 text-center">🏏 Admin Panel</h1>
        <p className="text-xs text-blue-400/40 text-center mb-6">Enter match results — app calculates winnings automatically</p>

        {/* Match setup */}
        <div className="bg-blue-950/40 border border-blue-800/25 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-blue-400/60 block mb-1">Match #</label>
              <input
                type="number" min={1} max={74} value={matchNum}
                onChange={(e) => setMatchNum(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 text-center"
              />
            </div>
            <div>
              <label className="text-xs text-blue-400/60 block mb-1">Total Pot (₹)</label>
              <input
                type="number" min={0} step={100} value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 text-center"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-blue-400/60 block mb-1">Match Info</label>
            <input
              type="text" placeholder="e.g. CSK vs MI at Chennai"
              value={matchInfo}
              onChange={(e) => setMatchInfo(e.target.value)}
              className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 placeholder-blue-500/30"
            />
          </div>
        </div>

        {/* Winners selection */}
        <div className="bg-blue-950/40 border border-blue-800/25 rounded-xl overflow-hidden mb-4">
          <div className="px-4 py-2 bg-blue-900/25 border-b border-blue-800/25 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase">Select Winners</span>
            <span className="text-xs text-blue-400/50">
              {winners.length} selected → ₹{winnerShare} each
            </span>
          </div>
          <div className="grid grid-cols-2 gap-0">
            {PLAYERS.map((player) => {
              const isWinner = winners.includes(player);
              return (
                <button
                  key={player}
                  onClick={() => toggleWinner(player)}
                  className={`px-4 py-3 text-left text-sm border-b border-r border-blue-900/15 transition-all ${
                    isWinner
                      ? "bg-emerald-900/30 text-emerald-300 font-semibold"
                      : "text-blue-300/60 hover:bg-blue-900/10"
                  }`}
                >
                  {isWinner ? "✅ " : "⬜ "}{player}
                  {isWinner && <span className="float-right text-emerald-400/70 text-xs">₹{winnerShare}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white font-semibold rounded-lg transition-colors"
          >
            {saving ? "Saving..." : `Save Match ${matchNum}`}
          </button>
        </div>
        {message && (
          <p className={`text-center text-sm mt-3 ${message.startsWith("Error") ? "text-red-400" : "text-emerald-400"}`}>
            {message}
          </p>
        )}

        {/* Existing matches summary */}
        {existingMatches.length > 0 && (
          <div className="mt-8 bg-blue-950/40 border border-blue-800/25 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-blue-900/25 border-b border-blue-800/25">
              <span className="text-xs font-bold text-sky-400 uppercase">Match History</span>
            </div>
            {existingMatches.map((m) => (
              <div
                key={m.matchNum}
                onClick={() => setMatchNum(m.matchNum)}
                className="px-4 py-2 border-b border-blue-900/15 hover:bg-blue-900/10 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="text-sm text-blue-200">M{m.matchNum}</span>
                  {m.matchInfo && <span className="text-xs text-blue-400/40 ml-2">{m.matchInfo}</span>}
                </div>
                <div className="text-xs text-blue-400/50">
                  {m.winners?.length || 0} winner(s) • ₹{m.betAmount}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-sky-400/60 hover:text-sky-300 text-sm underline">← Back to Dashboard</a>
        </div>
      </div>
    </div>
  );
}
