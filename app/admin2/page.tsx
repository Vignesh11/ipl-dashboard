"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, onSnapshot, collection, getDocs } from "firebase/firestore";

const ADMIN_PASSWORD = "silv2026";

const PLAYERS = [
  "Aditya", "Ankit", "Harsha", "Jay", "Manju", "Pruthvi",
  "Ranjeeth", "Ravi", "Rohit", "Siddhu", "Sivakarthik", "Sreeram",
  "Sugam", "Varun", "Vignesh", "Vinay", "Shiva",
];

type Result = "skip" | "correct" | "twist_correct" | "twist_wrong";

const RESULT_CONFIG: Record<Result, { label: string; emoji: string; points: number; color: string; activeColor: string }> = {
  skip: { label: "Wrong/Skip", emoji: "⬜", points: 0, color: "text-slate-500", activeColor: "bg-slate-700/40 border-slate-500/30 text-slate-300" },
  correct: { label: "+100", emoji: "✅", points: 100, color: "text-emerald-400", activeColor: "bg-emerald-900/40 border-emerald-500/30 text-emerald-300" },
  twist_correct: { label: "🌀 +200", emoji: "🌀✅", points: 200, color: "text-yellow-400", activeColor: "bg-yellow-900/30 border-yellow-500/30 text-yellow-300" },
  twist_wrong: { label: "🌀 -100", emoji: "❌", points: -100, color: "text-red-400", activeColor: "bg-red-900/30 border-red-500/30 text-red-300" },
};

export default function Admin2Page() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, Result>>(() => {
    const init: Record<string, Result> = {};
    PLAYERS.forEach((p) => (init[p] = "skip"));
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [matchNum, setMatchNum] = useState(1);
  const [roundHistory, setRoundHistory] = useState<Array<{ matchNum: number; date: string; timestamp: string; results: Record<string, { result: Result; points: number }> }>>([]);

  useEffect(() => {
    if (!authed) return;
    const unsub = onSnapshot(doc(db, "guessGame", "scores"), (snap) => {
      if (snap.exists()) {
        setScores(snap.data().points as Record<string, number>);
      } else {
        const init: Record<string, number> = {};
        PLAYERS.forEach((p) => (init[p] = 0));
        setScores(init);
      }
    });
    return () => unsub();
  }, [authed]);

  // Load round history
  useEffect(() => {
    if (!authed) return;
    getDocs(collection(db, "guessGame")).then((snap) => {
      const rounds = snap.docs
        .filter((d) => d.id.startsWith("round_"))
        .map((d) => {
          const data = d.data();
          return {
            matchNum: data.matchNum as number,
            date: (data.date as string) || "",
            timestamp: (data.timestamp as string) || "",
            results: (data.results || {}) as Record<string, { result: Result; points: number }>,
          };
        })
        .sort((a, b) => b.matchNum - a.matchNum || b.timestamp.localeCompare(a.timestamp));
      setRoundHistory(rounds);
    }).catch(() => setRoundHistory([]));
  }, [authed, saving]); // refresh after each save

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="bg-blue-950/50 border border-blue-800/30 rounded-xl p-8 w-80">
          <h1 className="text-xl font-bold text-sky-300 mb-4 text-center">🎲 Guess Game Admin</h1>
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

  // Calculate total points for this round
  const roundSummary = PLAYERS.map((p) => ({
    name: p,
    result: results[p],
    points: RESULT_CONFIG[results[p]].points,
  }));
  const totalAwarded = roundSummary.reduce((s, r) => s + (r.points > 0 ? r.points : 0), 0);
  const totalDeducted = roundSummary.reduce((s, r) => s + (r.points < 0 ? r.points : 0), 0);

  async function handleSave() {
    const hasAny = PLAYERS.some((p) => results[p] !== "skip");
    if (!hasAny) { setMessage("Set at least one result"); return; }
    setSaving(true);
    setMessage("");
    try {
      const updated = { ...scores };
      PLAYERS.forEach((p) => {
        if (!updated[p]) updated[p] = 0;
        updated[p] += RESULT_CONFIG[results[p]].points;
      });

      await setDoc(doc(db, "guessGame", "scores"), { points: updated });

      const histRef = doc(db, "guessGame", `round_${matchNum}_${Date.now()}`);
      await setDoc(histRef, {
        matchNum,
        date: matchDate,
        results: Object.fromEntries(PLAYERS.map((p) => [p, { result: results[p], points: RESULT_CONFIG[results[p]].points }])),
        timestamp: new Date().toISOString(),
      });

      const winners = PLAYERS.filter((p) => results[p] === "correct" || results[p] === "twist_correct");
      const twisters = PLAYERS.filter((p) => results[p] === "twist_wrong");
      setMessage(`✅ M${matchNum}: ${winners.length} correct${twisters.length > 0 ? `, ${twisters.length} twist fails` : ""}`);

      // Reset for next round
      const reset: Record<string, Result> = {};
      PLAYERS.forEach((p) => (reset[p] = "skip"));
      setResults(reset);
      setMatchNum((n) => n + 1);
    } catch (err) {
      setMessage(`❌ Error: ${err}`);
    }
    setSaving(false);
  }

  const sorted = PLAYERS.map((p) => ({ name: p, pts: scores[p] || 0 })).sort((a, b) => b.pts - a.pts);

  return (
    <div className="min-h-screen bg-[#0a1628] text-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-sky-300 mb-1 text-center">🎲 Guess Game Admin</h1>
        <p className="text-xs text-blue-400/40 text-center mb-6">Set each player&apos;s result per match</p>

        {/* Match info */}
        <div className="bg-blue-950/40 border border-blue-800/25 rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-blue-400/60 block mb-1">Match #</label>
              <input type="number" min={1} value={matchNum}
                onChange={(e) => setMatchNum(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 text-center" />
            </div>
            <div>
              <label className="text-xs text-blue-400/60 block mb-1">Date</label>
              <input type="date" value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 text-center" />
            </div>
          </div>
        </div>

        {/* Scoring legend */}
        <div className="flex flex-wrap gap-2 justify-center mb-4 text-xs">
          {(Object.keys(RESULT_CONFIG) as Result[]).map((r) => (
            <span key={r} className={`px-2 py-1 rounded ${RESULT_CONFIG[r].color}`}>
              {RESULT_CONFIG[r].emoji} {RESULT_CONFIG[r].label}
            </span>
          ))}
        </div>

        {/* Player results */}
        <div className="bg-blue-950/40 border border-blue-800/25 rounded-xl overflow-hidden mb-4">
          <div className="px-4 py-2 bg-blue-900/25 border-b border-blue-800/25 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase">Player Results</span>
            <span className="text-xs text-blue-400/50">
              +{totalAwarded} / {totalDeducted}
            </span>
          </div>
          {PLAYERS.map((player) => (
            <div key={player} className={`px-3 py-2 border-b border-blue-900/15 ${results[player] !== "skip" ? "bg-blue-900/10" : ""}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${results[player] !== "skip" ? "text-blue-100 font-semibold" : "text-blue-300/50"}`}>
                  {RESULT_CONFIG[results[player]].emoji} {player}
                </span>
                <span className={`text-xs font-mono ${RESULT_CONFIG[results[player]].color}`}>
                  {scores[player] || 0} pts
                </span>
              </div>
              <div className="flex gap-1">
                {(Object.keys(RESULT_CONFIG) as Result[]).map((r) => (
                  <button key={r} onClick={() => setResults({ ...results, [player]: r })}
                    className={`flex-1 px-1 py-1 text-[10px] rounded border transition-all ${
                      results[player] === r ? RESULT_CONFIG[r].activeColor : "bg-blue-900/10 border-blue-800/15 text-blue-500/30 hover:bg-blue-800/20"
                    }`}>
                    {RESULT_CONFIG[r].emoji} {RESULT_CONFIG[r].label}
                  </button>
                ))}
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
          <p className={`text-center text-sm mt-3 ${message.startsWith("❌") ? "text-red-400" : "text-emerald-400"}`}>{message}</p>
        )}

        {/* Current standings */}
        <div className="mt-8 bg-blue-950/40 border border-blue-800/25 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-blue-900/25 border-b border-blue-800/25">
            <span className="text-xs font-bold text-sky-400 uppercase">Current Standings</span>
          </div>
          {sorted.map((p, i) => (
            <div key={p.name} className="px-4 py-2 border-b border-blue-900/15 flex items-center justify-between">
              <span className="text-sm text-blue-200">#{i + 1} {p.name}</span>
              <span className={`text-sm font-bold ${p.pts >= 0 ? "text-sky-300" : "text-red-400"}`}>{p.pts} pts</span>
            </div>
          ))}
        </div>

        {/* Round History */}
        {roundHistory.length > 0 && (
          <div className="mt-8 bg-blue-950/40 border border-blue-800/25 rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-blue-900/25 border-b border-blue-800/25">
              <span className="text-xs font-bold text-sky-400 uppercase">Round History</span>
            </div>
            {roundHistory.map((round, idx) => {
              const correct = PLAYERS.filter((p) => round.results[p]?.result === "correct" || round.results[p]?.result === "twist_correct");
              const twistWrong = PLAYERS.filter((p) => round.results[p]?.result === "twist_wrong");
              return (
                <div key={idx} className="px-4 py-3 border-b border-blue-900/15">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-blue-200">M{round.matchNum}</span>
                    <span className="text-xs text-blue-400/40">{round.date}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {correct.map((p) => (
                      <span key={p} className="text-xs bg-emerald-900/30 text-emerald-300 px-2 py-0.5 rounded-full">
                        ✅ {p} +{round.results[p].points}
                      </span>
                    ))}
                    {twistWrong.map((p) => (
                      <span key={p} className="text-xs bg-red-900/30 text-red-300 px-2 py-0.5 rounded-full">
                        ❌ {p} {round.results[p].points}
                      </span>
                    ))}
                    {correct.length === 0 && twistWrong.length === 0 && (
                      <span className="text-xs text-blue-500/30">All wrong/skipped</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-center gap-4">
          <a href="/" className="text-sky-400/60 hover:text-sky-300 text-sm underline">← Dashboard</a>
          <a href="/admin" className="text-sky-400/60 hover:text-sky-300 text-sm underline">🏏 Match Admin</a>
        </div>
      </div>
    </div>
  );
}
