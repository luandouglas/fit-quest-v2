import { createContext, useContext, useMemo, useState } from 'react'

type StudentWorkspaceContextValue = {
  selectedDate: string
  setSelectedDate: (date: string) => void
  highlightedGoalId: string | null
  setHighlightedGoalId: (goalId: string | null) => void
  goToPreviousDay: () => void
  goToNextDay: () => void
  isTodaySelected: boolean
}

const StudentWorkspaceContext = createContext<StudentWorkspaceContextValue | null>(null)

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(baseDate: string, days: number) {
  const date = new Date(`${baseDate}T12:00:00`)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

type StudentWorkspaceProviderProps = {
  children: React.ReactNode
}

export function StudentWorkspaceProvider({ children }: StudentWorkspaceProviderProps) {
  const today = toIsoDate(new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [highlightedGoalId, setHighlightedGoalId] = useState<string | null>(null)

  const value = useMemo<StudentWorkspaceContextValue>(
    () => ({
      selectedDate,
      setSelectedDate,
      highlightedGoalId,
      setHighlightedGoalId,
      goToPreviousDay: () => setSelectedDate((current) => addDays(current, -1)),
      goToNextDay: () =>
        setSelectedDate((current) => {
          if (current >= today) {
            return current
          }

          return addDays(current, 1)
        }),
      isTodaySelected: selectedDate === today,
    }),
    [highlightedGoalId, selectedDate, today],
  )

  return <StudentWorkspaceContext.Provider value={value}>{children}</StudentWorkspaceContext.Provider>
}

export function useStudentWorkspace() {
  const context = useContext(StudentWorkspaceContext)

  if (!context) {
    throw new Error('useStudentWorkspace must be used within StudentWorkspaceProvider')
  }

  return context
}
