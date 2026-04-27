"use client";
import { useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

const ADMIN_PASSWORD = "bawa2026";

interface MatchDoc {
  id: string;
  matchNum: number;
  matchInfo: string;
  betAmount: number;
  winnings: Record<string, number>;
  cancelled?: boolean;
}

interface Change {
  matchId: string;
  matchNum: number;
  matchInfo: string;
  changes: string[];
}

export default function MigratePage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [matches, setMatches] = useState<MatchDoc[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [previewed, setPreviewed] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAndPreview() {
    const snap = await getDocs(collection(db, "matches"));
    const docs: MatchDoc[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<MatchDoc, "id">),
    }));
    docs.sort((a, b) => a.matchNum - b.matchNum);
    setMatches(docs);

    const pendingChanges: Change[] = [];
    for (const m of docs) {
      const c: string[] = [];

      // 1. Remove Shashi from winnings
      if ("Shashi" in (m.winnings || {})) {
        const amt = m.winnings["Shashi"];
        c.push(`Remove Shashi (was ₹${amt})`);
      }

      // 2. Set betAmount from 3200 to 3000
      if (m.betAmount === 3200) {
        c.push(`betAmount: 3200 → 3000`);
      }

      // 3. Find 4th place (₹200) and set to 0 — skip cancelled/rained-out matches
      if (m.winnings && !m.cancelled) {
        const sorted = Object.entries(m.winnings)
          .filter(([, v]) => v > 0)
          .sort(([, a], [, b]) => b - a);
        // 4th place = index 3, should have ₹200
        if (sorted.length >= 4 && sorted[3][1] === 200) {
          c.push(`4th place ${sorted[3][0]}: ₹200 → ₹0 (medal only)`);
        }
      }

      if (c.length > 0) {
        pendingChanges.push({
          matchId: m.id,
          matchNum: m.matchNum,
          matchInfo: m.matchInfo || "",
          changes: c,
        });
      }
    }
    setChanges(pendingChanges);
    setPreviewed(true);
  }

  async function runMigration() {
    setMigrating(true);
    setMessage("");
    let updated = 0;

    for (const m of matches) {
      const updates: Record<string, unknown> = {};
      let needsUpdate = false;

      // 1. Remove Shashi
      if ("Shashi" in (m.winnings || {})) {
        const newWinnings = { ...m.winnings };
        delete newWinnings["Shashi"];
        updates["winnings"] = newWinnings;
        needsUpdate = true;
      }

      // 2. Fix betAmount
      if (m.betAmount === 3200) {
        updates["betAmount"] = 3000;
        needsUpdate = true;
      }

      // 3. Fix 4th place ₹200 → ₹0 — skip cancelled/rained-out matches
      if (!m.cancelled) {
        const winnings = (updates["winnings"] as Record<string, number>) || { ...m.winnings };
        const sorted = Object.entries(winnings)
          .filter(([, v]) => v > 0)
          .sort(([, a], [, b]) => b - a);
        if (sorted.length >= 4 && sorted[3][1] === 200) {
          winnings[sorted[3][0]] = 0;
          updates["winnings"] = winnings;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await updateDoc(doc(db, "matches", m.id), updates);
        updated++;
      }
    }

    setDone(true);
    setMigrating(false);
    setMessage(`Migration complete. ${updated} matches updated.`);
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="bg-blue-950/50 border border-blue-800/30 rounded-xl p-8 w-80">
          <h1 className="text-xl font-bold text-sky-300 mb-4 text-center">🔧 Migration Tool</h1>
          <input type="password" placeholder="Admin password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && password === ADMIN_PASSWORD && setAuthed(true)}
            className="w-full px-3 py-2 bg-blue-900/30 border border-blue-700/30 rounded-lg text-blue-100 placeholder-blue-500/40 mb-3" />
          <button onClick={() => { if (password === ADMIN_PASSWORD) setAuthed(true); }}
            className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg">Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-sky-300 mb-2 text-center">🔧 Data Migration</h1>
        <p className="text-xs text-blue-400/50 text-center mb-6">
          Removes Shashi, sets betAmount to 3000, removes ₹200 from 4th place
        </p>

        {!previewed && (
          <div className="flex justify-center">
            <button onClick={loadAndPreview}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg">
              Preview Changes
            </button>
          </div>
        )}

        {previewed && changes.length === 0 && (
          <p className="text-center text-emerald-400">No changes needed — all matches are already up to date.</p>
        )}

        {previewed && changes.length > 0 && (
          <>
            <div className="bg-blue-950/40 border border-blue-800/25 rounded-xl overflow-hidden mb-4">
              <div className="px-4 py-2 bg-blue-900/25 border-b border-blue-800/25">
                <span className="text-xs font-bold text-amber-400 uppercase">
                  {changes.length} matches will be updated
                </span>
              </div>
              {changes.map((c) => (
                <div key={c.matchId} className="px-4 py-2 border-b border-blue-900/15">
                  <div className="text-sm font-semibold text-blue-200 mb-1">
                    M{c.matchNum} {c.matchInfo && `— ${c.matchInfo}`}
                  </div>
                  {c.changes.map((ch, i) => (
                    <div key={i} className="text-xs text-amber-300/80 ml-2">• {ch}</div>
                  ))}
                </div>
              ))}
            </div>

            {!done && (
              <div className="flex justify-center gap-3">
                <button onClick={runMigration} disabled={migrating}
                  className="px-6 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-semibold rounded-lg">
                  {migrating ? "Migrating..." : `Apply to ${changes.length} matches`}
                </button>
              </div>
            )}
          </>
        )}

        {message && (
          <p className="text-center text-sm mt-4 text-emerald-400">{message}</p>
        )}

        <div className="mt-8 flex justify-center gap-4">
          <a href="/" className="text-sky-400/60 hover:text-sky-300 text-sm underline">← Dashboard</a>
          <a href="/admin" className="text-sky-400/60 hover:text-sky-300 text-sm underline">Admin →</a>
        </div>
      </div>
    </div>
  );
}
