import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'

const normalizeWorkout = (snap) => {
  const data = snap.data()

  return {
    id: snap.id,
    ...data,
    date: data.date || '',
  }
}

const getRangeStartDate = (range = '30d') => {
  const now = new Date()
  const start = new Date(now)

  switch (range) {
    case '3d':
      start.setDate(now.getDate() - 3)
      break
    case '7d':
      start.setDate(now.getDate() - 7)
      break
    case '30d':
      start.setDate(now.getDate() - 30)
      break
    case '3m':
      start.setMonth(now.getMonth() - 3)
      break
    default:
      start.setDate(now.getDate() - 30)
  }

  start.setHours(0, 0, 0, 0)
  return start
}

const parseWorkoutDate = (value) => {
  if (!value) return null

  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null

  return d
}

const computeStats = (workouts, range = '30d') => {
  const startDate = getRangeStartDate(range)

  const inRange = workouts.filter((w) => {
    const d = parseWorkoutDate(w.date)
    return d && d >= startDate
  })

  const totalWorkouts = inRange.length
  const totalMinutes = inRange.reduce((sum, w) => sum + (Number(w.durationMin) || 0), 0)
  const avgMinutesPerWorkout = totalWorkouts ? Math.round(totalMinutes / totalWorkouts) : 0

  const byTypeMap = new Map()
  const byUserMap = new Map()

  for (const w of inRange) {
    const type = w.type || 'N/A'
    byTypeMap.set(type, (byTypeMap.get(type) || 0) + 1)

    const email = w.userEmail || 'N/A'
    const current = byUserMap.get(email) || { email, minutes: 0, workouts: 0 }
    current.minutes += Number(w.durationMin) || 0
    current.workouts += 1
    byUserMap.set(email, current)
  }

  const byType = Array.from(byTypeMap.entries())
    .map(([key, count]) => ({ _id: key, count }))
    .sort((a, b) => b.count - a.count)

  const topType = byType[0]?._id || '-'

  const mostActiveUser =
    Array.from(byUserMap.values()).sort((a, b) => {
      if (b.minutes !== a.minutes) return b.minutes - a.minutes
      return b.workouts - a.workouts
    })[0] || null

  const bucketDefs = [
    { label: '0-30', min: 0, max: 30 },
    { label: '31-60', min: 31, max: 60 },
    { label: '61-90', min: 61, max: 90 },
    { label: '91-120', min: 91, max: 120 },
    { label: '120+', min: 121, max: Infinity },
  ]

  const durationBuckets = bucketDefs.map((b) => ({
    label: b.label,
    count: inRange.filter((w) => {
      const mins = Number(w.durationMin) || 0
      return mins >= b.min && mins <= b.max
    }).length,
  }))

  return {
    totalWorkouts,
    totalMinutes,
    avgMinutesPerWorkout,
    topType,
    mostActiveUser,
    durationBuckets,
    byType,
  }
}

export const apiAdminGetWorkouts = async () => {
  const q = query(collection(db, 'workouts'), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(normalizeWorkout)
}

export const apiAdminDeleteWorkout = async (id) => {
  await deleteDoc(doc(db, 'workouts', id))
}

export const apiAdminUpdateWorkout = async (id, payload) => {
  const ref = doc(db, 'workouts', id)

  await updateDoc(ref, {
    type: payload.type,
    durationMin: Number(payload.durationMin),
    date: payload.date,
    notes: payload.notes || '',
    updatedAt: serverTimestamp(),
  })

  return {
    id,
    type: payload.type,
    durationMin: Number(payload.durationMin),
    date: payload.date,
    notes: payload.notes || '',
  }
}

export const apiAdminGetStats = async (range = '30d') => {
  const workouts = await apiAdminGetWorkouts()
  return computeStats(workouts, range)
}
