import { api } from './client'

export function getLineageMovie(movieId: string) {
  return api.get(`/lineage/movie/${movieId}`).then(r => r.data)
}
export function getLineageSummary() {
  return api.get('/lineage/summary').then(r => r.data)
}
