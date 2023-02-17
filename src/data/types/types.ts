export type EplResults = {
  id: string;
  matchDay: string;
  homeTeam: string;
  awayTeam: string;
  homeScored: number;
  awayScored: number;
  winner: string;
  ref: string;
};

export type ISQSEvent = {
  detail: {
    id: string;
    awayScored: number;
    awayTeam: string;
    homeScored: number;
    homeTeam: string;
    matchDay: string;
    ref: string;
    winner: string;
  };
};
