import type { Team, Time } from '.';

export const Winner = {
  UNKNOWN: 0,
  RED: 1,
  BLUE: 2,
} as const;

export interface Match {
  id: string;
  title: string;

  start_time: Time;
  end_time: Time;

  red_team: Team;
  blue_team: Team;

  winner: (typeof Winner)[keyof typeof Winner];
}
