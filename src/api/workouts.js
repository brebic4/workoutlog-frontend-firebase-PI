import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from '../firebase'

const normalizeWorkout = (snap) => {
  const data = snap.data()

  return {
    id: snap.id,
    ...data,
    date: data.date || '',
  }
}

export const apiGetWorkouts = async () => {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('Korisnik nije prijavljen.')

  const q = query(
    collection(db, 'workouts'),
    where('userId', '==', currentUser.uid),
    orderBy('date', 'desc'),
  )

  const snap = await getDocs(q)
  return snap.docs.map(normalizeWorkout)
}

export const apiCreateWorkout = async (payload) => {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('Korisnik nije prijavljen.')

  const docRef = await addDoc(collection(db, 'workouts'), {
    userId: currentUser.uid,
    userEmail: currentUser.email || '',
    type: payload.type,
    durationMin: Number(payload.durationMin),
    date: payload.date,
    notes: payload.notes || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return {
    id: docRef.id,
    userId: currentUser.uid,
    userEmail: currentUser.email || '',
    type: payload.type,
    durationMin: Number(payload.durationMin),
    date: payload.date,
    notes: payload.notes || '',
  }
}

export const apiDeleteWorkout = async (id) => {
  await deleteDoc(doc(db, 'workouts', id))
}

export const apiUpdateWorkout = async (id, payload) => {
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
