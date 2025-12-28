import { Card, Form, Input, Row, Col, Button } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getLineageMovie } from '../api/lineage'
import { useState } from 'react'
import ReactECharts from 'echarts-for-react'

type GraphNode = { name: string, category: number }
type GraphLink = { source: string, target: string }
type SourceNode = { title_on_page: string }

export default function Lineage() {
  const [movieId, setMovieId] = useState<string>('M1001')
  const [searchId, setSearchId] = useState<string | undefined>(undefined)

  const detail = useQuery({
    queryKey: ['lineage', searchId],
    queryFn: () => getLineageMovie(searchId!),
    enabled: !!searchId
  })
  
  const handleSearch = () => {
    if (movieId) {
      setSearchId(movieId)
    }
  }

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
          <div className="hero-title">数据血缘追踪</div>
          <div className="hero-sub">展示电影合并前的来源与规则</div>
        </div>
      </div>
      <Form layout="inline" style={{ marginTop: 16, marginBottom: 16 }}>
        <Form.Item label="电影ID">
          <Input 
            value={movieId} 
            onChange={e => setMovieId(e.target.value)} 
            onPressEnter={handleSearch}
            placeholder="输入后点击查询"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>查询</Button>
        </Form.Item>
      </Form>
      <Row gutter={16}>
        <Col span={24}>
          <Card className="card">
            {detail.isLoading && <div>加载中</div>}
            {detail.isError && <div>错误</div>}
            {!detail.isLoading && !detail.isError && (
              searchId ? <ReactECharts option={option} style={{ height: 600 }} /> : <div>请点击查询按钮查看血缘关系</div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
