import { api } from './client'

export function getLogs(page = 1, size = 20) {
  return api.get('/system/logs', { params: { page, size } }).then(r => r.data)
}
export function getModels() {
  return api.get('/system/models').then(r => r.data)
}
