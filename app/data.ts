// ===== IPL 2026 Current Season =====
export interface PlayerSeason {
  name: string;
  returnPct: number;
  inPoints: number;
  outPoints: number;
  uptoNow: number;
  balance: number;
  matchWinnings: number[]; // per-match winnings (1-indexed by match)
}

export const currentSeason: PlayerSeason[] = [
  { name: "Harsha", returnPct: -72, inPoints: 15000, outPoints: 4200, uptoNow: 3000, balance: -10800, matchWinnings: [0, 1000, 1500, 0, 200, 1500] },
  { name: "Vignesh", returnPct: -82, inPoints: 15000, outPoints: 2700, uptoNow: 1500, balance: -12300, matchWinnings: [0, 1500, 200, 0, 0, 1000] },
  { name: "Sidhu", returnPct: -85.3, inPoints: 15000, outPoints: 2200, uptoNow: 1000, balance: -12800, matchWinnings: [200, 0, 0, 0, 1500, 500] },
  { name: "Jaydev", returnPct: -88.7, inPoints: 15000, outPoints: 1700, uptoNow: 500, balance: -13300, matchWinnings: [0, 200, 0, 1500, 0, 0] },
  { name: "Aditya", returnPct: -90, inPoints: 15000, outPoints: 1500, uptoNow: 300, balance: -13500, matchWinnings: [0, 0, 0, 1000, 500, 0] },
  { name: "Karthik", returnPct: -90, inPoints: 15000, outPoints: 1500, uptoNow: 300, balance: -13500, matchWinnings: [0, 0, 0, 500, 1000, 0] },
  { name: "Sreeram", returnPct: -90, inPoints: 15000, outPoints: 1500, uptoNow: 300, balance: -13500, matchWinnings: [1500, 0, 0, 0, 0, 0] },
  { name: "Manju", returnPct: -92, inPoints: 15000, outPoints: 1200, uptoNow: 0, balance: -13800, matchWinnings: [0, 500, 500, 200, 0, 0] },
  { name: "Anoop", returnPct: -93.3, inPoints: 15000, outPoints: 1000, uptoNow: -200, balance: -14000, matchWinnings: [0, 0, 1000, 0, 0, 0] },
  { name: "Ravindra", returnPct: -93.3, inPoints: 15000, outPoints: 1000, uptoNow: -200, balance: -14000, matchWinnings: [1000, 0, 0, 0, 0, 0] },
  { name: "Ankit", returnPct: -96.7, inPoints: 15000, outPoints: 500, uptoNow: -700, balance: -14500, matchWinnings: [500, 0, 0, 0, 0, 0] },
  { name: "Prithvi", returnPct: -98.7, inPoints: 15000, outPoints: 200, uptoNow: -1000, balance: -14800, matchWinnings: [0, 0, 0, 0, 0, 200] },
  { name: "Ranjith", returnPct: -100, inPoints: 15000, outPoints: 0, uptoNow: -1200, balance: -15000, matchWinnings: [0, 0, 0, 0, 0, 0] },
  { name: "Shiva", returnPct: -100, inPoints: 15000, outPoints: 0, uptoNow: -1200, balance: -15000, matchWinnings: [0, 0, 0, 0, 0, 0] },
  { name: "Vinay (Babu)", returnPct: -100, inPoints: 15000, outPoints: 0, uptoNow: -1200, balance: -15000, matchWinnings: [0, 0, 0, 0, 0, 0] },
];

// ===== Medal Table =====
export interface MedalEntry {
  name: string;
  gold: number;
  silver: number;
  bronze: number;
  consolation: number;
  total: number;
}

export const medalTable: MedalEntry[] = [
  { name: "Harsha", gold: 2, silver: 1, bronze: 0, consolation: 1, total: 4 },
  { name: "Vignesh", gold: 1, silver: 1, bronze: 0, consolation: 1, total: 3 },
  { name: "Sidhu", gold: 1, silver: 0, bronze: 1, consolation: 1, total: 3 },
  { name: "Jaydev", gold: 1, silver: 0, bronze: 0, consolation: 1, total: 2 },
  { name: "Sreeram", gold: 1, silver: 0, bronze: 0, consolation: 0, total: 1 },
  { name: "Aditya", gold: 0, silver: 1, bronze: 1, consolation: 0, total: 2 },
  { name: "Karthik", gold: 0, silver: 1, bronze: 1, consolation: 0, total: 2 },
  { name: "Anoop", gold: 0, silver: 1, bronze: 0, consolation: 0, total: 1 },
  { name: "Ravindra", gold: 0, silver: 1, bronze: 0, consolation: 0, total: 1 },
  { name: "Manju", gold: 0, silver: 0, bronze: 2, consolation: 1, total: 3 },
  { name: "Ankit", gold: 0, silver: 0, bronze: 1, consolation: 0, total: 1 },
  { name: "Prithvi", gold: 0, silver: 0, bronze: 0, consolation: 1, total: 1 },
  { name: "Ranjith", gold: 0, silver: 0, bronze: 0, consolation: 0, total: 0 },
  { name: "Shiva", gold: 0, silver: 0, bronze: 0, consolation: 0, total: 0 },
  { name: "Vinay (Babu)", gold: 0, silver: 0, bronze: 0, consolation: 0, total: 0 },
];

// ===== All-Time Combined Winnings =====
export interface AllTimeEntry {
  rank: number;
  name: string;
  y2025: number;
  y2024: number;
  y2023: number;
  y2022: number;
  y2021: number;
  y2020: number;
  total: number;
}

export const allTimeWinnings: AllTimeEntry[] = [
  { rank: 1, name: "Shiva", y2025: 5200, y2024: -1600, y2023: 3000, y2022: 1900, y2021: 4880, y2020: 7390, total: 20770 },
  { rank: 2, name: "Ravindra", y2025: 200, y2024: 2600, y2023: 0, y2022: 5800, y2021: 6200, y2020: 1810, total: 16610 },
  { rank: 3, name: "Sidhu", y2025: 5000, y2024: 3000, y2023: 2200, y2022: 1200, y2021: 2700, y2020: -3750, total: 10350 },
  { rank: 4, name: "Prithvi", y2025: 8000, y2024: 0, y2023: 0, y2022: 0, y2021: 0, y2020: 0, total: 8000 },
  { rank: 5, name: "Harsha", y2025: 1800, y2024: -1300, y2023: 1000, y2022: 600, y2021: 6880, y2020: -2020, total: 6960 },
  { rank: 6, name: "Rohit", y2025: 5600, y2024: 0, y2023: 0, y2022: 0, y2021: 0, y2020: 0, total: 5600 },
  { rank: 7, name: "Vinay Babu", y2025: 2200, y2024: 2100, y2023: 1000, y2022: 0, y2021: 0, y2020: 0, total: 5300 },
  { rank: 8, name: "Manju", y2025: -1800, y2024: 4100, y2023: 1200, y2022: 5100, y2021: -2660, y2020: -1040, total: 4900 },
  { rank: 9, name: "Sugam", y2025: 600, y2024: 6000, y2023: -2900, y2022: 0, y2021: 0, y2020: 0, total: 3700 },
  { rank: 10, name: "Karthik", y2025: 7400, y2024: -3600, y2023: -200, y2022: 1200, y2021: -3300, y2020: 510, total: 2010 },
  { rank: 11, name: "Ranjith", y2025: 800, y2024: 0, y2023: 0, y2022: 0, y2021: 0, y2020: 0, total: 800 },
  { rank: 12, name: "Ankit", y2025: 600, y2024: -1200, y2023: 2600, y2022: 0, y2021: -2160, y2020: 0, total: -160 },
  { rank: 13, name: "Lanka", y2025: 0, y2024: 0, y2023: 0, y2022: 0, y2021: -740, y2020: 0, total: -740 },
  { rank: 14, name: "Guru", y2025: 0, y2024: 0, y2023: 0, y2022: 0, y2021: 0, y2020: -1200, total: -1200 },
  { rank: 15, name: "Sai", y2025: 0, y2024: 0, y2023: 0, y2022: 0, y2021: -1220, y2020: 0, total: -1220 },
  { rank: 16, name: "Vignesh", y2025: 1600, y2024: -600, y2023: 0, y2022: 0, y2021: -1100, y2020: -1680, total: -1780 },
  { rank: 17, name: "Sreeram", y2025: -3600, y2024: 0, y2023: 0, y2022: 0, y2021: 0, y2020: 0, total: -3600 },
  { rank: 18, name: "Sridhar", y2025: 0, y2024: 0, y2023: 0, y2022: 0, y2021: -620, y2020: -3140, total: -3760 },
  { rank: 19, name: "Shashi", y2025: -2400, y2024: -2000, y2023: 0, y2022: 0, y2021: 40, y2020: 260, total: -4100 },
  { rank: 20, name: "Rahul", y2025: -4400, y2024: -2000, y2023: 0, y2022: 0, y2021: 0, y2020: 0, total: -6400 },
  { rank: 21, name: "Aditya", y2025: -1200, y2024: 3200, y2023: -9300, y2022: 0, y2021: -1100, y2020: 1500, total: -6900 },
  { rank: 22, name: "Anoop", y2025: -2000, y2024: -700, y2023: 1400, y2022: -6000, y2021: -180, y2020: -400, total: -7880 },
  { rank: 23, name: "Koka", y2025: 0, y2024: 0, y2023: 0, y2022: -9600, y2021: -1940, y2020: 740, total: -10800 },
  { rank: 24, name: "Partha", y2025: -10000, y2024: 0, y2023: 0, y2022: -1000, y2021: -4680, y2020: -1400, total: -17080 },
  { rank: 25, name: "Chindam", y2025: -13600, y2024: -8000, y2023: 0, y2022: 800, y2021: -1000, y2020: 2440, total: -19360 },
];

// ===== Cumulative Graph Data (2026 season) =====
export interface CumulativePoint {
  match: number;
  [player: string]: number;
}

export const cumulativeGraph2026: CumulativePoint[] = [
  { match: 0, Harsha: 0, Vignesh: 0, Sidhu: 0, Jaydev: 0, Aditya: 0, Karthik: 0, Sreeram: 0, Manju: 0, Anoop: 0, Ravindra: 0, Ankit: 0, Prithvi: 0, Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0 },
  { match: 1, Harsha: 0, Vignesh: 0, Sidhu: 200, Jaydev: 0, Aditya: 0, Karthik: 0, Sreeram: 1500, Manju: 0, Anoop: 0, Ravindra: 1000, Ankit: 500, Prithvi: 0, Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0 },
  { match: 2, Harsha: 1000, Vignesh: 1500, Sidhu: 200, Jaydev: 200, Aditya: 0, Karthik: 0, Sreeram: 1500, Manju: 500, Anoop: 0, Ravindra: 1000, Ankit: 500, Prithvi: 0, Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0 },
  { match: 3, Harsha: 2500, Vignesh: 1700, Sidhu: 200, Jaydev: 200, Aditya: 0, Karthik: 0, Sreeram: 1500, Manju: 1000, Anoop: 1000, Ravindra: 1000, Ankit: 500, Prithvi: 0, Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0 },
  { match: 4, Harsha: 2500, Vignesh: 1700, Sidhu: 200, Jaydev: 1700, Aditya: 1000, Karthik: 500, Sreeram: 1500, Manju: 1200, Anoop: 1000, Ravindra: 1000, Ankit: 500, Prithvi: 0, Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0 },
  { match: 5, Harsha: 2700, Vignesh: 1700, Sidhu: 1700, Jaydev: 1700, Aditya: 1500, Karthik: 1500, Sreeram: 1500, Manju: 1200, Anoop: 1000, Ravindra: 1000, Ankit: 500, Prithvi: 0, Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0 },
  { match: 6, Harsha: 4200, Vignesh: 2700, Sidhu: 2200, Jaydev: 1700, Aditya: 1500, Karthik: 1500, Sreeram: 1500, Manju: 1200, Anoop: 1000, Ravindra: 1000, Ankit: 500, Prithvi: 200, Ranjith: 0, Shashi: 0, Shiva: 0, "Vinay (Babu)": 0 },
];

// ===== Combined Podiums =====
export interface PodiumEntry {
  rank: number;
  name: string;
  y2025: number | null;
  y2024: number | null;
  y2023: number | null;
  y2022: number | null;
  y2021: number | null;
  y2020: number | null;
  total: number;
  avg: number;
}

export const combinedPodiums: PodiumEntry[] = [
  { rank: 1, name: "Ravindra", y2025: 14, y2024: 21, y2023: 28, y2022: 30, y2021: 27, y2020: 24, total: 144, avg: 24.0 },
  { rank: 2, name: "Shiva", y2025: 20, y2024: 15, y2023: 29, y2022: 24, y2021: 26, y2020: 28, total: 142, avg: 23.7 },
  { rank: 3, name: "Sidhu", y2025: 20, y2024: 25, y2023: 25, y2022: 23, y2021: 17, y2020: 15, total: 125, avg: 20.8 },
  { rank: 4, name: "Harsha", y2025: 16, y2024: 19, y2023: 26, y2022: 24, y2021: 27, y2020: 12, total: 124, avg: 20.7 },
  { rank: 5, name: "Manju", y2025: 16, y2024: 21, y2023: 23, y2022: 29, y2021: 15, y2020: 17, total: 121, avg: 20.2 },
  { rank: 6, name: "Karthik", y2025: 19, y2024: 14, y2023: 26, y2022: 25, y2021: 14, y2020: 16, total: 114, avg: 19.0 },
  { rank: 7, name: "Anoop", y2025: 11, y2024: 18, y2023: 24, y2022: 14, y2021: 5, y2020: 12, total: 84, avg: 14.0 },
  { rank: 8, name: "Sugam", y2025: 20, y2024: 31, y2023: 20, y2022: null, y2021: null, y2020: null, total: 71, avg: 23.7 },
  { rank: 9, name: "Vignesh", y2025: 14, y2024: 18, y2023: null, y2022: null, y2021: 23, y2020: 15, total: 70, avg: 17.5 },
  { rank: 10, name: "Ankit", y2025: 16, y2024: 18, y2023: 26, y2022: null, y2021: 4, y2020: null, total: 64, avg: 16.0 },
  { rank: 11, name: "Aditya", y2025: 15, y2024: 22, y2023: 12, y2022: null, y2021: 1, y2020: 12, total: 62, avg: 12.4 },
  { rank: 12, name: "Chindam", y2025: 2, y2024: 8, y2023: null, y2022: 25, y2021: 0, y2020: 18, total: 53, avg: 10.6 },
  { rank: 13, name: "Shashi", y2025: 10, y2024: 17, y2023: null, y2022: null, y2021: 11, y2020: 12, total: 50, avg: 12.5 },
  { rank: 14, name: "Vinay Babu", y2025: 17, y2024: 21, y2023: 9, y2022: null, y2021: null, y2020: null, total: 47, avg: 15.7 },
  { rank: 15, name: "Partha", y2025: 2, y2024: null, y2023: null, y2022: 21, y2021: 10, y2020: 13, total: 46, avg: 11.5 },
  { rank: 16, name: "Rahul", y2025: 11, y2024: 16, y2023: null, y2022: null, y2021: null, y2020: null, total: 27, avg: 13.5 },
  { rank: 17, name: "Koka", y2025: null, y2024: null, y2023: null, y2022: 6, y2021: 1, y2020: 14, total: 21, avg: 7.0 },
  { rank: 18, name: "Sridhar", y2025: null, y2024: null, y2023: null, y2022: null, y2021: 9, y2020: 12, total: 21, avg: 10.5 },
  { rank: 19, name: "Prithvi", y2025: 19, y2024: null, y2023: null, y2022: null, y2021: null, y2020: null, total: 19, avg: 19.0 },
  { rank: 20, name: "Rohit", y2025: 19, y2024: null, y2023: null, y2022: null, y2021: null, y2020: null, total: 19, avg: 19.0 },
  { rank: 21, name: "Ranjith", y2025: 15, y2024: null, y2023: null, y2022: null, y2021: null, y2020: null, total: 15, avg: 15.0 },
  { rank: 22, name: "Sreeram", y2025: 9, y2024: null, y2023: null, y2022: null, y2021: null, y2020: null, total: 9, avg: 9.0 },
  { rank: 23, name: "Lanka", y2025: null, y2024: null, y2023: null, y2022: null, y2021: 6, y2020: null, total: 6, avg: 6.0 },
  { rank: 24, name: "Guru", y2025: null, y2024: null, y2023: null, y2022: null, y2021: null, y2020: 3, total: 3, avg: 3.0 },
  { rank: 25, name: "Sai", y2025: null, y2024: null, y2023: null, y2022: null, y2021: 2, y2020: null, total: 2, avg: 2.0 },
];

// ===== Prediction League =====
export interface PredictionPlayer {
  name: string;
  points: number;
  seed: string;
}

export interface PredictionQuestion {
  question: string;
  options: string[];
}

export interface DailyPrediction {
  date: string;
  matchLabel: string;
  questions: PredictionQuestion[];
}

export const predictionPlayers: PredictionPlayer[] = [
  { name: "Shiva", points: 100, seed: "Shiva" },
  { name: "Aditya", points: 0, seed: "Aditya" },
  { name: "Ankit", points: 0, seed: "Ankit" },
  { name: "Varun", points: 0, seed: "Varun" },
  { name: "Harsha", points: 0, seed: "Harsha" },
  { name: "Manju", points: 0, seed: "Manju" },
  { name: "Ravi", points: 0, seed: "Ravi" },
  { name: "Rohit", points: 0, seed: "Rohit" },
  { name: "Siddhu", points: 0, seed: "Siddhu" },
  { name: "Sivakarthik", points: 0, seed: "Sivakarthik" },
  { name: "Sugam", points: 0, seed: "Sugam" },
  { name: "Vinay", points: 0, seed: "Vinay" },
  { name: "Ranjeeth", points: 0, seed: "Ranjeeth" },
  { name: "Sreeram", points: 0, seed: "Sreeram" },
  { name: "Vignesh", points: 0, seed: "Vignesh" },
  { name: "Pruthvi", points: 0, seed: "Pruthvi" },
  { name: "Jay", points: 0, seed: "Jay" },
];

export const dailyPredictions: DailyPrediction[] = [
  {
    date: "Apr 3, 2026",
    matchLabel: "Match 7 • CSK vs PBKS",
    questions: [
      {
        question: "How many extras in the game? (Both innings combined)",
        options: ["10 and below", "11-15", "15-20", "20-25", "Above 25"],
      },
    ],
  },
];
