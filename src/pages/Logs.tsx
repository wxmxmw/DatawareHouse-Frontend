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
    { title: '类型', dataIndex: 'query_type' },
    { title: '参数', dataIndex: 'params' },
    { title: 'PG耗时', dataIndex: 'execution_time_pg' },
    { title: 'Spark耗时', dataIndex: 'execution_time_spark' },
    { title: 'Neo4j耗时', dataIndex: 'execution_time_neo4j' },
    { title: '时间', dataIndex: 'timestamp' }
  ]
  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-title">查询历史日志</div>
          <div className="hero-sub">记录查询参数与三引擎的执行耗时</div>
        </div>
      </div>
      <Card className="card" style={{ marginTop: 16 }}>
        {isLoading && <div>加载中</div>}
        {isError && <div>错误</div>}
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
