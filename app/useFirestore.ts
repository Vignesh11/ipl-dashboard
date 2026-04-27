"use client";
import { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, onSnapshot } from "firebase/firestore";

export interface PlayerLive {
  name: string;
  matchWinnings: number[];
}

const PLAYERS = [
  "Harsha", "Vignesh", "Sidhu", "Jaydev", "Aditya", "Karthik",
  "Sreeram", "Manju", "Anoop", "Ravindra", "Ankit", "Prithvi",
  "Ranjith", "Shiva", "Vinay (Babu)",
];

export function useLiveSeasonData() {
  const [players, setPlayers] = useState<PlayerLive[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMatches, setTotalMatches] = useState(0);
  const [completedMatches, setCompletedMatches] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "matches"), (snap) => {
      const matchData: Record<number, Record<string, number>> = {};
      const matchBets: Record<number, number> = {};
      let maxMatch = 0;

      snap.docs.forEach((d) => {
        const data = d.data();
        const num = data.matchNum as number;
        matchData[num] = data.winnings as Record<string, number>;
        matchBets[num] = (data.betAmount as number) || 0;
        if (num > maxMatch) maxMatch = num;
      });

      setTotalMatches(maxMatch);

      let invested = 0;
      let completed = 0;
      for (let i = 1; i <= maxMatch; i++) {
        if (matchBets[i] && matchData[i]) {
          const hasWinners = Object.values(matchData[i]).some((v) => v > 0);
          if (hasWinners) {
            invested += Math.floor(matchBets[i] / PLAYERS.length);
            completed++;
          }
        }
      }
      setCompletedMatches(completed);
      setTotalInvested(invested);

      const result: PlayerLive[] = PLAYERS.map((name) => {
        const winnings: number[] = [];
        for (let i = 1; i <= maxMatch; i++) {
          winnings.push(matchData[i]?.[name] || 0);
        }
        return { name, matchWinnings: winnings };
      });

      setPlayers(result);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { players, loading, totalMatches, completedMatches, totalInvested };
}

export interface MatchLive {
  matchNum: number;
  matchDate: string;
  matchInfo: string;
  betAmount: number;
  contestLink: string;
  contestCode: string;
  winnings: Record<string, number>;
  winners?: string[];
  cancelled?: boolean;
}

export function useLiveMatches() {
  const [matches, setMatches] = useState<MatchLive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "matches"), (snap) => {
      const data = snap.docs.map((d) => d.data() as MatchLive);
      data.sort((a, b) => a.matchNum - b.matchNum);
      setMatches(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { matches, loading };
}
