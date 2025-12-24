import { api, Engine } from './client'

export function getQualityReport(engine?: Engine, table?: string) {
  return api.get('/governance/quality-report', { params: { engine, table } }).then(r => r.data)
}
export function getMetadata(engine?: Engine, table?: string) {
  return api.get('/governance/metadata', { params: { engine, table } }).then(r => r.data)
}
