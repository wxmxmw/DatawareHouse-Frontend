import { Card, Row, Col, Statistic, Steps, Divider, Typography } from 'antd'
// import { useQuery } from '@tanstack/react-query'
// import { getLineageSummary } from '../api/lineage'
import ReactECharts from 'echarts-for-react'
import { 
  DatabaseOutlined, 
  MergeCellsOutlined, 
  CheckCircleOutlined, 
  FieldTimeOutlined,
  FilterOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons'

const { Text } = Typography

export default function ETLSummary() {
  // const summary = useQuery({ queryKey: ['lineage-summary'], queryFn: () => getLineageSummary() })
  
  // Figures from the course ETL report
  const reportData = {
    totalRaw: 228260,
    finalCount: 139795,
    dedupedCount: 76513,
    filteredCount: 11952,
    dateCompleted: 59682,
    dateCompletedSource: [
      { value: 92065, name: 'Amazon source' },
      { value: 2518, name: 'IMDb match' },
      { value: 57164, name: 'Review inference' }
    ]
  }

  // Use the report figures for this static overview
  const displayData = {
    raw: reportData.totalRaw,
    final: reportData.finalCount,
    filtered: reportData.filteredCount
  }

  const funnelOption = {
    title: { text: 'Data Cleaning Funnel', left: 'center' },
    tooltip: { trigger: 'item', formatter: '{b} : {c}' },
    series: [
      {
        name: 'Funnel',
        type: 'funnel',
        left: '10%',
        top: 60,
        bottom: 60,
        width: '80%',
        min: 0,
        max: displayData.raw,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside'
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 20
          }
        },
        data: [
          { value: displayData.raw, name: 'Raw data' },
          { value: displayData.raw - reportData.dedupedCount, name: 'After deduplication' },
          { value: displayData.raw - reportData.dedupedCount - displayData.filtered, name: 'After content filtering' },
          { value: displayData.final, name: 'Final records' }
        ]
      }
    ]
  }

  const pieOption = {
    title: { text: 'Release Date Sources', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: 'Source',
        type: 'pie',
        radius: '50%',
        data: reportData.dateCompletedSource,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="hero">
        <div>
          <div className="hero-title">ETL Overview</div>
          <div className="hero-sub">Amazon Movie Data Warehouse Report · December 26, 2025</div>
        </div>
      </div>

      <div style={{ padding: '0 24px', marginTop: -40 }}>
        {/* Key metrics */}
        <Row gutter={16}>
          <Col span={6}>
            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title="Raw records"
                value={displayData.raw} 
                prefix={<DatabaseOutlined />} 
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>Amazon + IMDb + Reviews</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title="Duplicate records removed"
                value={reportData.dedupedCount} 
                prefix={<MergeCellsOutlined />} 
                valueStyle={{ color: '#faad14' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>Merge rate {((reportData.dedupedCount / displayData.raw) * 100).toFixed(1)}%</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title="Release dates completed"
                value={reportData.dateCompleted} 
                prefix={<FieldTimeOutlined />} 
                valueStyle={{ color: '#722ed1' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>Completed using IMDb and reviews</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title="Movies loaded"
                value={displayData.final} 
                prefix={<CheckCircleOutlined />} 
                valueStyle={{ color: '#3f8600' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>Retention rate {((displayData.final / displayData.raw) * 100).toFixed(1)}%</div>
            </Card>
          </Col>
        </Row>

        {/* Pipeline */}
        <Card title="Data Processing Pipeline" style={{ marginTop: 24, borderRadius: 8 }}>
          <Steps
            current={8}
            labelPlacement="vertical"
            items={[
              { title: 'Raw data', description: '228,260 records', icon: <DatabaseOutlined /> },
              { title: 'Deduplication', description: '151,747 records', icon: <MergeCellsOutlined /> },
              { title: 'Content filtering', description: 'Remove non-movies', icon: <FilterOutlined /> },
              { title: 'Quality screening', description: '≥3 valid fields', icon: <SafetyCertificateOutlined /> },
              { title: 'Data enrichment', description: 'IMDb + reviews', icon: <FieldTimeOutlined /> },
              { title: 'Format normalization', description: 'Normalize dates', icon: <CalendarOutlined /> },
              { title: 'Name normalization', description: '1,663 mappings', icon: <UserOutlined /> },
              { title: 'Final records', description: '139,795 records', icon: <CheckCircleOutlined /> },
            ]}
          />
        </Card>

        {/* Charts */}
        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="Data Cleaning Funnel" bordered={false} style={{ height: '100%' }}>
              <ReactECharts option={funnelOption} style={{ height: 350 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Data Enrichment Strategy" bordered={false} style={{ height: '100%' }}>
              <Row>
                <Col span={24}>
                  <ReactECharts option={pieOption} style={{ height: 250 }} />
                </Col>
              </Row>
              <Divider dashed />
              <div style={{ padding: '0 12px' }}>
                <Text strong>Three-stage enrichment:</Text>
                <ul>
                  <li><Text type="secondary">Stage 1 (Amazon):</Text> Use the source release date when available.</li>
                  <li><Text type="secondary">Stage 2 (IMDb):</Text> Match IMDb records by title and runtime (tt_id).</li>
                  <li><Text type="secondary">Stage 3 (Reviews):</Text> Estimate the release date from the earliest review.</li>
                </ul>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
