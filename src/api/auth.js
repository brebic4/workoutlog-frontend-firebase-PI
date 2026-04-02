import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const apiRegister = async ({ email, password, username }) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const user = credential.user

  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    username,
    role: 'USER',
    theme: 'light',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return credential
}

export const apiLogin = async ({ email, password }) => {
  return await signInWithEmailAndPassword(auth, email, password)
}

export const apiLoginWithGoogle = async () => {
  const provider = new GoogleAuthProvider()

  const result = await signInWithPopup(auth, provider)
  const user = result.user

  // provjeri postoji li user u Firestore
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) {
    // prvi login → kreiraj user document
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      username: user.displayName || user.email?.split('@')[0],
      role: 'USER',
      theme: 'light',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  return result
}

export const apiLogout = async () => {
  return await signOut(auth)
}

export const apiForgotPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email)
}

export const apiGetUserProfile = async (uid) => {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)

  if (!snap.exists()) return null

  return {
    id: snap.id,
    ...snap.data(),
  }
}

export const apiChangeUsername = async (uid, username) => {
  const ref = doc(db, 'users', uid)

  await updateDoc(ref, {
    username,
    updatedAt: serverTimestamp(),
  })
}

export const apiChangePassword = async (newPassword) => {
  if (!auth.currentUser) {
    throw new Error('Nema prijavljenog korisnika.')
  }

  return await updatePassword(auth.currentUser, newPassword)
}

export const apiChangeTheme = async (uid, theme) => {
  const ref = doc(db, 'users', uid)

  await updateDoc(ref, {
    theme,
    updatedAt: serverTimestamp(),
  })
}
