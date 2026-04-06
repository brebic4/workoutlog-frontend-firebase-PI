import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, auth } from '../firebase'

const templatesCol = collection(db, 'templates')

export async function apiGetTemplates() {
  const user = auth.currentUser
  console.log('apiGetTemplates -> auth.currentUser:', user)

  if (!user) {
    throw new Error('Korisnik nije prijavljen.')
  }

  const q = query(templatesCol, where('userId', '==', user.uid))

  const snap = await getDocs(q)

  const items = snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }))

  console.log('apiGetTemplates -> fetched items:', items)

  return items.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0
    const bTime = b.createdAt?.seconds || 0
    return bTime - aTime
  })
}

export async function apiCreateTemplate(payload) {
  const user = auth.currentUser
  console.log('apiCreateTemplate -> auth.currentUser:', user)
  console.log('apiCreateTemplate -> payload:', payload)

  if (!user) throw new Error('Korisnik nije prijavljen.')

  const docData = {
    userId: user.uid,
    name: payload.name?.trim() || 'Moj template',
    type: payload.type?.trim() || '',
    durationMin: Number(payload.durationMin) || 0,
    notes: payload.notes?.trim() || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const ref = await addDoc(templatesCol, docData)
  console.log('apiCreateTemplate -> saved id:', ref.id)

  return {
    id: ref.id,
    ...docData,
  }
}

export async function apiDeleteTemplate(id) {
  await deleteDoc(doc(db, 'templates', id))
}
