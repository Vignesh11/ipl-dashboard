"use client";
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const ADMIN_PASSWORD = "silv2026";

const PLAYERS = [
  "Shiva", "Aditya", "Ankit", "Varun", "Harsha", "Manju",
  "Ravi", "Rohit", "Siddhu", "Sivakarthik", "Sugam", "Vinay",
  "Ranjeeth", "Sreeram", "Vignesh", "Pruthvi", "Jay",
];

export default function Admin2Page() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [matchLabel, setMatchLabel] = useState("");

  // Load current scores from Firestore
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

  function togglePlayer(name: string) {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  async function handleSave() {
    if (selected.length === 0) { setMessage("Select at least one winner"); return; }
    setSaving(true);
    setMessage("");
    try {
      const updated = { ...scores };
      PLAYERS.forEach((p) => { if (!updated[p]) updated[p] = 0; });
      selected.forEach((p) => { updated[p] = (updated[p] || 0) + 100; });

      // Save updated scores
      await setDoc(doc(db, "guessGame", "scores"), { points: updated });

      // Save this round's history
      const histRef = doc(db, "guessGame", `round_${Date.now()}`);
      await setDoc(histRef, {
        date: matchLabel || new Date().toISOString().split("T")[0],
        winners: selected,
        pointsAwarded: 100,
        timestamp: new Date().toISOString(),
      });

      setMessage(`✅ +100 pts to: ${selected.join(", ")}`);
      setSelected([]);
      setMatchLabel("");
    } catch (err) {
      setMessage(`❌ Error: ${err}`);
    }
    setSaving(false);
  }

  // Sort by score for display
  const sorted = PLAYERS.map((p) => ({ name: p, pts: scores[p] || 0 })).sort((a, b) => b.pts - a.pts);

  return (
    <div className="min-h-screen bg-[#0a1628] text-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-sky-300 mb-1 text-center">🎲 Guess Game Admin</h1>
        <p className="text-xs text-blue-400/40 text-center mb-6">Select today&apos;s winners — each gets +100 pts</p>

        {/* Match info */}
        <div className="bg-blue-950/40 border border-blue-800/25 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-blue-400/60 block mb-1">Date</label>
              <input type="date" value={matchLabel || new Date().toISOString().split("T")[0]}
                onChange={(e) => setMatchLabel(e.target.value)}
                className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 text-center" />
            </div>
            <div className="flex items-end">
              <span className="text-xs text-blue-400/40">{selected.length} winner{selected.length !== 1 ? "s" : ""} selected</span>
            </div>
          </div>
        </div>

        {/* Player selection */}
        <div className="bg-blue-950/40 border border-blue-800/25 rounded-xl overflow-hidden mb-4">
          <div className="px-4 py-2 bg-blue-900/25 border-b border-blue-800/25 flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 uppercase">Select Winners</span>
            <span className="text-xs text-blue-400/50">Tap to toggle</span>
          </div>
          <div className="grid grid-cols-2 gap-0">
            {PLAYERS.map((player) => {
              const isSelected = selected.includes(player);
              return (
                <button key={player} onClick={() => togglePlayer(player)}
                  className={`px-4 py-3 text-left text-sm border-b border-r border-blue-900/15 transition-all ${
                    isSelected ? "bg-emerald-900/30 text-emerald-300 font-semibold" : "text-blue-300/60 hover:bg-blue-900/10"
                  }`}>
                  {isSelected ? "✅ " : "⬜ "}{player}
                  <span className="float-right text-xs text-blue-400/40">{scores[player] || 0} pts</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 justify-center">
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white font-semibold rounded-lg transition-colors">
            {saving ? "Saving..." : "Award +100 pts"}
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
              <span className="text-sm font-bold text-sky-300">{p.pts} pts</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <a href="/" className="text-sky-400/60 hover:text-sky-300 text-sm underline">← Dashboard</a>
          <a href="/admin" className="text-sky-400/60 hover:text-sky-300 text-sm underline">🏏 Match Admin</a>
        </div>
      </div>
    </div>
  );
}
