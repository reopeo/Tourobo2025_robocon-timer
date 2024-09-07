export interface Team {
  name: string;
  id: string;
  university: string;
  is_auto: boolean;

  seedlings: number;
  immigration: boolean;
  type_1_a: boolean;
  type_1_b: boolean;
  type_2: boolean;
  v_goal: boolean;

  score: number;
}
