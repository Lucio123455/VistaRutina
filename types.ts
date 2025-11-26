export interface Exercise {
  name: string;
  sets: number;
  reps: string;
}

export interface DayRoutine {
  day: string;
  title: string;
  exercises: Exercise[];
}

export type WorkoutPlan = DayRoutine[];