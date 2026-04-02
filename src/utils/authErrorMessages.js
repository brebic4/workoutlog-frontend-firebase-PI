export const getAuthErrorMessage = (e, fallback = 'Došlo je do greške.') => {
  const code = e?.code || ''
  const message = e?.message || ''

  const codeMap = {
    'auth/invalid-credential': 'Neispravan email ili lozinka.',
    'auth/invalid-email': 'Email nije ispravan.',
    'auth/email-already-in-use': 'Email je već u upotrebi.',
    'auth/missing-password': 'Unesi lozinku.',
    'auth/missing-email': 'Unesi email.',
    'auth/too-many-requests': 'Previše pokušaja. Pokušaj ponovno kasnije.',
    'auth/network-request-failed': 'Greška s mrežom. Provjeri internet vezu.',
    'auth/user-disabled': 'Korisnički račun je onemogućen.',
    'auth/operation-not-allowed': 'Ova prijava trenutno nije omogućena.',
    'auth/weak-password': 'Lozinka je preslaba.',
  }

  if (codeMap[code]) {
    return codeMap[code]
  }

  if (message.includes('Missing password requirements')) {
    const match = message.match(/\[(.*?)\]/)

    if (match?.[1]) {
      return match[1]
        .split(',')
        .map((item) => item.trim())
        .join('\n')
    }

    return 'Lozinka ne zadovoljava sigurnosne uvjete.'
  }

  return fallback
}
