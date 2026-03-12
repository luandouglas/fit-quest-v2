import { useParams } from "react-router-dom";

import { PersonalWorkspaceSections } from "@/features/personal/presentation/sections/PersonalWorkspaceSections";

export function PersonalWorkoutDetailPage() {
  const { workoutId } = useParams<{ workoutId: string }>();

  return (
    <PersonalWorkspaceSections
      forcedTab="workouts"
      forcedWorkoutId={workoutId}
    />
  );
}
