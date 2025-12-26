import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
console.log('API Base URL:', baseURL)

export const api = axios.create({
  baseURL,
  timeout: 60000
})

export type Engine = 'pg' | 'spark' | 'neo4j'
