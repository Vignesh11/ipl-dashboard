"use client";
import { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

// Existing match data from the spreadsheet
const SEED_DATA = [
  {
    matchNum: 1,
    matchInfo: "Match 1",
    betAmount: 3200,
    winners: ["Sreeram", "Ravindra", "Ankit", "Sidhu"],
    winnings: {
      Harsha: 0, Vignesh: 0, Sidhu: 200, Jaydev: 0, Aditya: 0, Karthik: 0,
      Sreeram: 1500, Manju: 0, Anoop: 0, Ravindra: 1000, Ankit: 500, Prithvi: 0,
      Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0,
    },
  },
  {
    matchNum: 2,
    matchInfo: "Match 2",
    betAmount: 3200,
    winners: ["Vignesh", "Harsha", "Manju", "Jaydev"],
    winnings: {
      Harsha: 1000, Vignesh: 1500, Sidhu: 0, Jaydev: 200, Aditya: 0, Karthik: 0,
      Sreeram: 0, Manju: 500, Anoop: 0, Ravindra: 0, Ankit: 0, Prithvi: 0,
      Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0,
    },
  },
  {
    matchNum: 3,
    matchInfo: "Match 3",
    betAmount: 3200,
    winners: ["Harsha", "Anoop", "Manju", "Vignesh"],
    winnings: {
      Harsha: 1500, Vignesh: 200, Sidhu: 0, Jaydev: 0, Aditya: 0, Karthik: 0,
      Sreeram: 0, Manju: 500, Anoop: 1000, Ravindra: 0, Ankit: 0, Prithvi: 0,
      Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0,
    },
  },
  {
    matchNum: 4,
    matchInfo: "Match 4",
    betAmount: 3200,
    winners: ["Jaydev", "Aditya", "Karthik", "Manju"],
    winnings: {
      Harsha: 0, Vignesh: 0, Sidhu: 0, Jaydev: 1500, Aditya: 1000, Karthik: 500,
      Sreeram: 0, Manju: 200, Anoop: 0, Ravindra: 0, Ankit: 0, Prithvi: 0,
      Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0,
    },
  },
  {
    matchNum: 5,
    matchInfo: "Match 5",
    betAmount: 3200,
    winners: ["Sidhu", "Karthik", "Aditya", "Harsha"],
    winnings: {
      Harsha: 200, Vignesh: 0, Sidhu: 1500, Jaydev: 0, Aditya: 500, Karthik: 1000,
      Sreeram: 0, Manju: 0, Anoop: 0, Ravindra: 0, Ankit: 0, Prithvi: 0,
      Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0,
    },
  },
  {
    matchNum: 6,
    matchInfo: "Match 6",
    betAmount: 3200,
    winners: ["Harsha", "Vignesh", "Sidhu", "Prithvi"],
    winnings: {
      Harsha: 1500, Vignesh: 1000, Sidhu: 500, Jaydev: 0, Aditya: 0, Karthik: 0,
      Sreeram: 0, Manju: 0, Anoop: 0, Ravindra: 0, Ankit: 0, Prithvi: 200,
      Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0,
    },
  },
];

export default function SeedPage() {
  const [status, setStatus] = useState("Ready to seed");
  const [done, setDone] = useState(false);

  async function handleSeed() {
    setStatus("Seeding...");
    try {
      for (const match of SEED_DATA) {
        await setDoc(doc(db, "matches", `match_${match.matchNum}`), {
          ...match,
          updatedAt: new Date().toISOString(),
        });
        setStatus(`Saved match ${match.matchNum}...`);
      }
      setStatus("All 6 matches seeded successfully!");
      setDone(true);
    } catch (err) {
      setStatus(`Error: ${err}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
      <div className="bg-blue-950/50 border border-blue-800/30 rounded-xl p-8 w-96 text-center">
        <h1 className="text-xl font-bold text-sky-300 mb-4">🌱 Seed Database</h1>
        <p className="text-sm text-blue-300/60 mb-4">Push existing 6 matches to Firestore</p>
        <p className="text-sm text-blue-200 mb-4">{status}</p>
        {!done && (
          <button
            onClick={handleSeed}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition-colors"
          >
            Seed Now
          </button>
        )}
        {done && (
          <a href="/" className="text-sky-400 hover:text-sky-300 underline">Go to Dashboard →</a>
        )}
      </div>
    </div>
  );
}
