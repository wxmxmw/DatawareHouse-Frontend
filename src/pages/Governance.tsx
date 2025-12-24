import { Card, Tabs, Table } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getQualityReport, getMetadata } from '../api/governance'

export default function Governance() {
  const quality = useQuery({ queryKey: ['quality'], queryFn: () => getQualityReport('pg') })
  const metadata = useQuery({ queryKey: ['metadata'], queryFn: () => getMetadata('pg') })
  type QualityRow = { name: string, row_count: number, last_updated: string }
  const qualityCols: Array<{ title: string, dataIndex: keyof QualityRow }> = [
    { title: '表名', dataIndex: 'name' },
    { title: '行数', dataIndex: 'row_count' },
    { title: '更新时间', dataIndex: 'last_updated' }
  ]
  type MetadataRow = {
    table: string
    column: string
    type: string
    description?: string
    source?: string
    nullable?: boolean
    indexed?: boolean
  }
  const metadataCols: Array<{ title: string, dataIndex: keyof MetadataRow }> = [
    { title: '表', dataIndex: 'table' },
    { title: '列', dataIndex: 'column' },
    { title: '类型', dataIndex: 'type' },
    { title: '描述', dataIndex: 'description' },
    { title: '来源', dataIndex: 'source' },
    { title: '可空', dataIndex: 'nullable' },
    { title: '索引', dataIndex: 'indexed' }
  ]
  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-title">数据治理</div>
          <div className="hero-sub">数据质量与元数据字典</div>
        </div>
      </div>
      <Tabs defaultActiveKey="quality" style={{ marginTop: 16 }} items={[
        { key: 'quality', label: '质量报告', children: (
          <Card className="card">
            {quality.isLoading && <div>加载中</div>}
            {quality.isError && <div>错误</div>}
            {!quality.isLoading && !quality.isError && (
              <Table<QualityRow> rowKey="name" columns={qualityCols} dataSource={(quality.data?.data?.tables || []) as QualityRow[]} pagination={false} />
            )}
          </Card>
        )},
        { key: 'metadata', label: '元数据字典', children: (
          <Card className="card">
            {metadata.isLoading && <div>加载中</div>}
            {metadata.isError && <div>错误</div>}
            {!metadata.isLoading && !metadata.isError && (
              <Table<MetadataRow> rowKey={(r) => r.table + r.column} columns={metadataCols} dataSource={(metadata.data?.data?.fields || []) as MetadataRow[]} pagination={false} />
            )}
          </Card>
        )}
      ]} />
    </div>
  )
}
