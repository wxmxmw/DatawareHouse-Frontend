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
  
  // 静态报告数据 (来自 ETL处理报告.md)
  const reportData = {
    totalRaw: 228260,
    finalCount: 139795,
    dedupedCount: 76513,
    filteredCount: 11952,
    dateCompleted: 59682,
    dateCompletedSource: [
      { value: 92065, name: 'Amazon 原始' },
      { value: 2518, name: 'IMDb 匹配' },
      { value: 57164, name: '评论推断' }
    ]
  }

  // 优先使用 API 数据，降级使用静态数据
  const displayData = {
    raw: reportData.totalRaw,
    final: reportData.finalCount,
    filtered: reportData.filteredCount
  }

  const funnelOption = {
    title: { text: '数据清洗漏斗', left: 'center' },
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
          { value: displayData.raw, name: '原始数据' },
          { value: displayData.raw - reportData.dedupedCount, name: '去重后' },
          { value: displayData.raw - reportData.dedupedCount - displayData.filtered, name: '内容过滤后' },
          { value: displayData.final, name: '最终入库' }
        ]
      }
    ]
  }

  const pieOption = {
    title: { text: '上映日期补全来源', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '来源',
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
          <div className="hero-title">ETL 统计总览</div>
          <div className="hero-sub">Amazon 电影数据仓库建设报告 - 2025年12月26日</div>
        </div>
      </div>

      <div style={{ padding: '0 24px', marginTop: -40 }}>
        {/* 核心指标 */}
        <Row gutter={16}>
          <Col span={6}>
            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title="原始记录数" 
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
                title="去重记录数" 
                value={reportData.dedupedCount} 
                prefix={<MergeCellsOutlined />} 
                valueStyle={{ color: '#faad14' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>合并率 {((reportData.dedupedCount / displayData.raw) * 100).toFixed(1)}%</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title="日期补全" 
                value={reportData.dateCompleted} 
                prefix={<FieldTimeOutlined />} 
                valueStyle={{ color: '#722ed1' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>IMDb + Reviews 补全</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title="最终入库电影" 
                value={displayData.final} 
                prefix={<CheckCircleOutlined />} 
                valueStyle={{ color: '#3f8600' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>保留率 {((displayData.final / displayData.raw) * 100).toFixed(1)}%</div>
            </Card>
          </Col>
        </Row>

        {/* 处理流程 */}
        <Card title="数据处理流程" style={{ marginTop: 24, borderRadius: 8 }}>
          <Steps
            current={8}
            labelPlacement="vertical"
            items={[
              { title: '原始数据', description: '228,260 条', icon: <DatabaseOutlined /> },
              { title: '去重处理', description: '151,747 条', icon: <MergeCellsOutlined /> },
              { title: '内容过滤', description: '过滤非电影', icon: <FilterOutlined /> },
              { title: '质量筛选', description: '≥3 有效字段', icon: <SafetyCertificateOutlined /> },
              { title: '数据补全', description: 'IMDb + 评论', icon: <FieldTimeOutlined /> },
              { title: '格式统一', description: '日期标准化', icon: <CalendarOutlined /> },
              { title: '人名标准化', description: '1,663 映射', icon: <UserOutlined /> },
              { title: '最终入库', description: '139,795 条', icon: <CheckCircleOutlined /> },
            ]}
          />
        </Card>

        {/* 图表分析 */}
        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col span={12}>
            <Card title="数据清洗漏斗" bordered={false} style={{ height: '100%' }}>
              <ReactECharts option={funnelOption} style={{ height: 350 }} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="数据补全策略" bordered={false} style={{ height: '100%' }}>
              <Row>
                <Col span={24}>
                  <ReactECharts option={pieOption} style={{ height: 250 }} />
                </Col>
              </Row>
              <Divider dashed />
              <div style={{ padding: '0 12px' }}>
                <Text strong>三层补全机制：</Text>
                <ul>
                  <li><Text type="secondary">第一层 (Amazon):</Text> 优先使用原始数据的发布日期。</li>
                  <li><Text type="secondary">第二层 (IMDb):</Text> 通过标题和时长匹配 IMDb 数据库 (tt_id)。</li>
                  <li><Text type="secondary">第三层 (Reviews):</Text> 使用最早评论时间推断可能的上映日期。</li>
                </ul>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}
