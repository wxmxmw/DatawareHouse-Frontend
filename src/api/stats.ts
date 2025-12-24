import { api, Engine } from './client'

export function getMoviesByTime(engine: Engine, granularity = 'year', time_value?: string, limit = 10) {
  return api.get('/stats/movies-by-time', { params: { engine, granularity, time_value, limit } }).then(r => r.data)
}
export function getMovieVersions(engine: Engine, title?: string) {
  return api.get('/stats/movie-versions', { params: { engine, title } }).then(r => r.data)
}
export function getDirectorWorks(engine: Engine, director_name?: string) {
  return api.get('/stats/director-works', { params: { engine, director_name } }).then(r => r.data)
}
export function getActorWorks(engine: Engine, actor_name?: string) {
  return api.get('/stats/actor-works', { params: { engine, actor_name } }).then(r => r.data)
}
export function getCollaborations(engine: Engine, type: 'actor_actor'|'director_actor', min_count = 3) {
  return api.get('/stats/collaborations', { params: { engine, type, min_count } }).then(r => r.data)
}
export function getGenres(engine: Engine) {
  return api.get('/stats/genres', { params: { engine } }).then(r => r.data)
}
export function getHighRated(engine: Engine, min_score = 4.5) {
  const ms = Number(Number(min_score).toFixed(1))
  return api.get('/stats/high-rated', { params: { engine, min_score: ms } }).then(r => r.data)
}
export type ComplexFilterBody = {
  engine: Engine
  year?: number
  genre?: string
  min_score?: number
  director?: string
  limit?: number
}
export function postComplexFilter(body: ComplexFilterBody) {
  return api.post('/stats/complex-filter', body).then(r => r.data)
}
export function getReviews(engine: Engine, min_score?: number, sentiment?: 'positive'|'negative'|'neutral', limit = 10) {
  const ms = min_score != null ? Number(Number(min_score).toFixed(1)) : undefined
  return api.get('/stats/reviews', { params: { engine, min_score: ms, sentiment, limit } }).then(r => r.data)
}
export function getPopularCombos(engine: Engine, size: 2|3, genre?: string, limit = 10) {
  return api.get('/stats/popular-combos', { params: { engine, size, genre, limit } }).then(r => r.data)
}
