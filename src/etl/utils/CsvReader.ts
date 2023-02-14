enum PossibleOutcomes {
  HomeWin = 'H',
  AwayWin = 'A',
  Draw = 'D',
}

export type EplResults = {
  matchDay: Date;
  homeTeam: string;
  awayTeam: string;
  homeScored: number;
  awayScored: number;
  winner: PossibleOutcomes;
  ref: string;
};

const dateStringToDate = (dateString: string): Date => {
  const dateParts = dateString.split('/').map((dt: string): number => +dt);
  return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
};

export class CsvFileReader {
  data: string[][] = [];
  eplMatches: EplResults[] = [];
  constructor(public stringifiedBuffer: string) {}

  read(): EplResults[] {
    return this.stringifiedBuffer
      .split('\n')
      .map((row: string): string[] => row.split(','))
      .map((row: string[]): EplResults => {
        return {
          matchDay: dateStringToDate(row[0]),
          homeTeam: row[1],
          awayTeam: row[2],
          homeScored: parseInt(row[3]),
          awayScored: parseInt(row[4]),
          winner: row[5] as PossibleOutcomes,
          ref: row[6],
        };
      });
  }
}
