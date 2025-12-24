import { api } from './client'

export type EtlOptions = {
  rebuild_indexes?: boolean
  deduplicate_by?: string[]
}

export function getSourceInfo() {
  return api.get('/etl/source-info').then(r => r.data)
}
export function runEtl(tasks: string[], options?: EtlOptions) {
  return api.post('/etl/run', { tasks, options }).then(r => r.data)
}
export function getEtlStatus(job_id?: string) {
  return api.get('/etl/status', { params: { job_id } }).then(r => r.data)
}
