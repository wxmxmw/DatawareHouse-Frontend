import { api, Engine } from './client'

export function getMoviesByTime(engine: Engine, granularity = 'year', time_value?: string, limit = 10, signal?: AbortSignal) {
  return api.get('/stats/movies-by-time', { params: { engine, granularity, time_value, limit }, signal }).then(r => r.data)
}
export function getMovieVersions(engine: Engine, title?: string, signal?: AbortSignal) {
  return api.get('/stats/movie-versions', { params: { engine, title }, signal }).then(r => r.data)
}
export function getDirectorWorks(engine: Engine, director_name?: string, signal?: AbortSignal) {
  return api.get('/stats/director-works', { params: { engine, director_name }, signal }).then(r => r.data)
}
export function getActorWorks(engine: Engine, actor_name?: string, signal?: AbortSignal) {
  return api.get('/stats/actor-works', { params: { engine, actor_name }, signal }).then(r => r.data)
}
export function getCollaborations(engine: Engine, type: 'actor_actor'|'director_actor', min_count = 3, signal?: AbortSignal) {
  return api.get('/stats/collaborations', { params: { engine, type, min_count }, signal }).then(r => r.data)
}
export function getGenres(engine: Engine, genre?: string, signal?: AbortSignal) {
  return api.get('/stats/genres', { params: { engine, genre }, signal }).then(r => r.data)
}
export function getHighRated(engine: Engine, min_score = 4.5, signal?: AbortSignal) {
  const ms = Number(Number(min_score).toFixed(1))
  return api.get('/stats/high-rated', { params: { engine, min_score: ms }, signal }).then(r => r.data)
}
export type ComplexFilterBody = {
  engine: Engine
  year?: number
  genre?: string
  min_score?: number
  director?: string
  actor?: string
  limit?: number
}
export function postComplexFilter(body: ComplexFilterBody, signal?: AbortSignal) {
  return api.post('/stats/complex-filter', body, { signal }).then(r => r.data)
}
export function getPopularCombos(engine: Engine, size: 2|3, genre?: string, limit = 10, signal?: AbortSignal) {
  return api.get('/stats/popular-combos', { params: { engine, size, genre, limit }, signal }).then(r => r.data)
}
