import { Table, Card } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getLogs } from '../api/system'

export default function Logs() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['logs'], queryFn: () => getLogs(1, 20) })
  type LogRow = {
    id: number
    query_type: string
    params: string
    execution_time_pg: number
    execution_time_spark: number
    execution_time_neo4j: number
    timestamp: string
  }
  const columns: Array<{ title: string, dataIndex: keyof LogRow }> = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Type', dataIndex: 'query_type' },
    { title: 'PG time (ms)', dataIndex: 'execution_time_pg' },
    { title: 'Spark time (ms)', dataIndex: 'execution_time_spark' },
    { title: 'Neo4j time (ms)', dataIndex: 'execution_time_neo4j' },
    { title: 'Time', dataIndex: 'timestamp' }
  ]
  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-title">Query History</div>
          <div className="hero-sub">Query history and execution times for the three engines</div>
        </div>
      </div>
      <Card className="card" style={{ marginTop: 16 }}>
        {isLoading && <div>Loading</div>}
        {isError && <div>Error</div>}
        {!isLoading && !isError && (
          <Table<LogRow>
            rowKey="id"
            columns={columns}
            dataSource={(data?.data?.rows || []) as LogRow[]}
            pagination={false}
          />
        )}
      </Card>
    </div>
  )
}
