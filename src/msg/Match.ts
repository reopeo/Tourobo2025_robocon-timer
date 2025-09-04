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

  type_1_a: number;
  type_1_b: number;
  type_1_c: number;
  type_2_a: number;
  type_2_b: number;
  type_2_c: number;
  type_3_a: number;
  type_3_b: number;
  type_3_c: number;
}
