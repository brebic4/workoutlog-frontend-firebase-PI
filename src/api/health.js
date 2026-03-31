import http from './http'

export const apiHealth = () => http.get('/health')
