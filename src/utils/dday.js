export function calcDDay(lastDoneDate, intervalDays) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last = new Date(lastDoneDate)
  last.setHours(0, 0, 0, 0)
  const nextDue = new Date(last)
  nextDue.setDate(nextDue.getDate() + intervalDays)
  const diffMs = nextDue - today
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getNaggingMessage(petName, routineName, dday) {
  if (dday > 7) {
    return {
      text: `${petName}이는 지금 완벽하게 건강해! 멍멍!`,
      status: 'good',
    }
  }
  if (dday >= 1) {
    return {
      text: `주인아! ${dday}일 뒤에 ${routineName} 하는 날인 거 안 잊었지?`,
      status: 'soon',
    }
  }
  if (dday === 0) {
    return {
      text: `오늘이 바로 ${routineName} 날이야! 빨리 줘!!`,
      status: 'today',
    }
  }
  return {
    text: `주인아... 내 ${routineName} 약이 ${Math.abs(dday)}일이나 늦었어... 나 삐진다...`,
    status: 'late',
  }
}

export const STATUS_STYLES = {
  good: {
    bg: 'from-green-100 to-emerald-100',
    border: 'border-green-300',
    badge: 'bg-green-100 text-green-700',
    emoji: '😊',
    ddayColor: 'text-green-600',
  },
  soon: {
    bg: 'from-yellow-100 to-amber-100',
    border: 'border-yellow-300',
    badge: 'bg-yellow-100 text-yellow-700',
    emoji: '🥺',
    ddayColor: 'text-yellow-600',
  },
  today: {
    bg: 'from-orange-100 to-red-100',
    border: 'border-orange-400',
    badge: 'bg-orange-100 text-orange-700',
    emoji: '😤',
    ddayColor: 'text-orange-600',
  },
  late: {
    bg: 'from-red-100 to-rose-100',
    border: 'border-red-400',
    badge: 'bg-red-100 text-red-700',
    emoji: '😤',
    ddayColor: 'text-red-600',
  },
}
