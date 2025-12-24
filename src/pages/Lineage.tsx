import { Card, Form, Input, Row, Col, List } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getLineageMovie, getLineageSummary } from '../api/lineage'
import { useState } from 'react'
import ReactECharts from 'echarts-for-react'

type GraphNode = { name: string, category: number }
type GraphLink = { source: string, target: string }
type SourceNode = { title_on_page: string }
type SummaryItem = { k: string, v: string | number | undefined }

export default function Lineage() {
  const [movieId, setMovieId] = useState<string>('M1001')
  const detail = useQuery({ queryKey: ['lineage', movieId], queryFn: () => getLineageMovie(movieId) })
  const summary = useQuery({ queryKey: ['lineage-summary'], queryFn: () => getLineageSummary() })
  const graphData = (() => {
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    const d = detail.data?.data
    if (d?.merged_movie) {
      nodes.push({ name: d.merged_movie.title, category: 0 })
    }
    (d?.source_nodes || []).forEach((s: SourceNode) => {
      nodes.push({ name: s.title_on_page, category: 1 })
      links.push({ source: s.title_on_page, target: d?.merged_movie?.title })
    })
    return { nodes, links }
  })()
  const option = {
    title: { text: '血缘关系' },
    tooltip: {},
    legend: [{ data: ['合并后','来源'] }],
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      label: { show: true },
      data: graphData.nodes,
      links: graphData.links,
      categories: [{ name: '合并后' }, { name: '来源' }]
    }]
  }
  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-title">数据血缘与溯源</div>
          <div className="hero-sub">展示电影合并前的来源与规则</div>
        </div>
      </div>
      <Form layout="inline" style={{ marginTop: 16, marginBottom: 16 }}>
        <Form.Item label="电影ID">
          <Input value={movieId} onChange={e => setMovieId(e.target.value)} />
        </Form.Item>
      </Form>
      <Row gutter={16}>
        <Col span={12}>
          <Card className="card">
            {detail.isLoading && <div>加载中</div>}
            {detail.isError && <div>错误</div>}
            {!detail.isLoading && !detail.isError && <ReactECharts option={option} style={{ height: 360 }} />}
          </Card>
        </Col>
        <Col span={12}>
          <Card className="card">
            {summary.isLoading && <div>加载中</div>}
            {summary.isError && <div>错误</div>}
            {!summary.isLoading && !summary.isError && (
              (() => {
                const items: SummaryItem[] = [
                  { k: '原始记录数', v: summary.data?.data?.total_raw_records },
                  { k: '过滤非电影数', v: summary.data?.data?.non_movie_filtered },
                  { k: '最终电影数', v: summary.data?.data?.final_movie_count },
                  { k: '哈利波特版本数', v: summary.data?.data?.harry_potter_stats?.total_versions },
                  { k: '哈利波特合并页面', v: summary.data?.data?.harry_potter_stats?.merged_pages }
                ]
                return (
                <List
                  header="溯源总览"
                  dataSource={items}
                  renderItem={(item: SummaryItem) => <List.Item>{item.k}: {item.v}</List.Item>}
                />
                )
              })()
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
