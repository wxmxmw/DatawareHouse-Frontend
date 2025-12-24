import { Card, Form, Checkbox, Button, Row, Col, List } from 'antd'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getSourceInfo, runEtl, getEtlStatus } from '../api/etl'
import { useState } from 'react'

export default function ETL() {
  const source = useQuery({ queryKey: ['source-info'], queryFn: () => getSourceInfo() })
  const [tasks, setTasks] = useState<string[]>([])
  const run = useMutation({ mutationFn: () => runEtl(tasks, { rebuild_indexes: true }) })
  const status = useQuery({ queryKey: ['etl-status', run.data?.data?.job_id], queryFn: () => getEtlStatus(run.data?.data?.job_id || ''), enabled: !!run.data?.data?.job_id, refetchInterval: 3000 })
  type SourceItem = { name: string, records?: number }
  type TaskItem = { name: string, status: string, progress_pct?: number }
  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-title">ETL 管理</div>
          <div className="hero-sub">数据来源、任务触发与状态查询</div>
        </div>
      </div>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card className="card">
            {source.isLoading && <div>加载中</div>}
            {source.isError && <div>错误</div>}
            {!source.isLoading && !source.isError && (
              <List<SourceItem>
                header="数据来源"
                dataSource={(source.data?.data?.sources || []) as SourceItem[]}
                renderItem={(item: SourceItem) => <List.Item>{item.name} {item.records ? `(${item.records})` : ''}</List.Item>}
              />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card className="card">
            <Form layout="vertical" onFinish={() => run.mutate()}>
              <Form.Item label="选择任务">
                <Checkbox.Group
                  options={[
                    { label: 'import_pg', value: 'import_pg' },
                    { label: 'build_parquet', value: 'build_parquet' },
                    { label: 'neo4j_import', value: 'neo4j_import' }
                  ]}
                  value={tasks}
                  onChange={(v) => setTasks(v as string[])}
                />
              </Form.Item>
              <Button type="primary" htmlType="submit" disabled={tasks.length === 0}>触发</Button>
            </Form>
            {run.isPending && <div>任务启动中</div>}
            {run.data?.data?.job_id && <div>任务ID {run.data?.data?.job_id}</div>}
            {status.isLoading && run.data?.data?.job_id && <div>查询状态中</div>}
            {!status.isLoading && status.data?.data?.tasks && (
              <List<TaskItem>
                header="任务状态"
                dataSource={status.data?.data?.tasks as TaskItem[]}
                renderItem={(item: TaskItem) => <List.Item>{item.name} {item.status} {item.progress_pct ? `${item.progress_pct}%` : ''}</List.Item>}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
