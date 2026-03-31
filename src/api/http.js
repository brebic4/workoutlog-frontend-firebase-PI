import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const auth = useAuthStore()

    // samo ako je user bio ulogiran (ima token)
    if (err?.response?.status === 401 && auth.token) {
      auth.setSessionExpired(true)
    }

    return Promise.reject(err)
  },
)

export default http
