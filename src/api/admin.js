import http from './http'

export const apiAdminGetWorkouts = () => http.get('/admin/workouts')
export const apiAdminDeleteWorkout = (id) => http.delete(`/admin/workouts/${id}`)
export const apiAdminUpdateWorkout = (id, payload) => http.patch(`/admin/workouts/${id}`, payload)
export const apiAdminGetStats = (range = '30d') => http.get('/admin/stats', { params: { range } })
