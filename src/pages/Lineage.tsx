import { Card, Form, Input, Row, Col, Button, Descriptions, List, Tag } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getLineageMovie } from '../api/lineage'
import { useState } from 'react'
import ReactECharts from 'echarts-for-react'

type GraphNode = {
  id: string
  name: string
  value: string
  category: number
  symbolSize: number
  label: { show: boolean; formatter: string }
}
type TooltipParams = {
  dataType?: string
  marker?: string
  data: { value: string }
}
type GraphLink = { source: string, target: string }
type SourceNode = { source_id: string, title_on_page: string, url: string }
type PersonNameSource = { name: string, original_name: string }
type ReleaseDateSource = { source: string }

export default function Lineage() {
  const [movieId, setMovieId] = useState<string>('B00308BAOE')
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

  const d = detail.data?.data

  const graphData = (() => {
    const nodes: GraphNode[] = []
    const links: GraphLink[] = []
    
    // 构造中心节点 (Merged Entity)
    const centerId = 'merged_center'
    const centerTitle = d?.merged_movie?.title || '合并后实体'
    
    if (d?.merged_movie) {
      nodes.push({
        id: centerId,
        name: centerId, // ECharts 使用 name 作为唯一标识（或id）
        value: centerTitle, // 用于 label 显示
        category: 0,
        symbolSize: 60,
        label: { show: true, formatter: '{c}' }
      })
    }
    
    // 构造来源节点 (Source Nodes)
    (d?.source_nodes || []).forEach((s: SourceNode, index: number) => {
      const sourceId = `source_${index}`
      const sourceTitle = s.title_on_page || `来源 ${index + 1}`
      
      nodes.push({
        id: sourceId,
        name: sourceId,
        value: sourceTitle,
        category: 1,
        symbolSize: 40,
        label: { show: true, formatter: '{c}' }
      })
      
      links.push({
        source: sourceId,
        target: centerId
      })
    })
    
    return { nodes, links }
  })()

  const option = {
    title: { text: '血缘关系图' },
    tooltip: {
      formatter: (params: TooltipParams) => {
        if (params.dataType === 'node') {
          return `${params.marker} ${params.data.value}`
        }
        return ''
      }
    },
    legend: [{ data: ['合并后','来源'] }],
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      label: { show: true },
      data: graphData.nodes,
      links: graphData.links,
      categories: [{ name: '合并后' }, { name: '来源' }],
      force: { repulsion: 1000, edgeLength: 100 }
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
      
      {detail.isLoading && <div style={{ textAlign: 'center', padding: 20 }}>加载中...</div>}
      {detail.isError && <div style={{ textAlign: 'center', padding: 20, color: 'red' }}>查询出错，请检查ID是否正确</div>}
      
      {!detail.isLoading && !detail.isError && d && (
        <Row gutter={[16, 16]}>
          {/* 左侧：关系图 */}
          <Col span={14}>
            <Card className="card" title="数据来源合并关系图">
              <div style={{ marginBottom: 16, color: '#666' }}>
                展示哪些原始网页被合并为当前的电影实体。中心节点为合并后的结果，周边节点为原始数据来源。
              </div>
              <ReactECharts option={option} style={{ height: 500 }} />
            </Card>
          </Col>
          
          {/* 右侧：详细信息 */}
          <Col span={10}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* 合并后电影详情 */}
              <Card className="card" title="合并后数据 (Merged Data)">
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="ID">{d.merged_movie.id}</Descriptions.Item>
                  <Descriptions.Item label="标题">{d.merged_movie.title}</Descriptions.Item>
                  <Descriptions.Item label="导演">{d.merged_movie.director}</Descriptions.Item>
                  <Descriptions.Item label="演员">{d.merged_movie.actor}</Descriptions.Item>
                  <Descriptions.Item label="上映日期">{d.merged_movie.releaseDate}</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* 来源网页列表 */}
              <Card className="card" title="来源网页 (Source Pages)">
                <List
                  size="small"
                  dataSource={d.source_nodes as SourceNode[]}
                  renderItem={(item) => (
                    <List.Item>
                      <div style={{ wordBreak: 'break-all' }}>
                        <div style={{ fontWeight: 500 }}>{item.title_on_page}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>ID: {item.source_id}</div>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>{item.url}</a>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>

              {/* 其他来源追踪 */}
              <Card className="card" title="字段级溯源 (Field Lineage)">
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>上映日期来源:</div>
                  {d.source_releaseDate && d.source_releaseDate.length > 0 ? (
                    (d.source_releaseDate as ReleaseDateSource[]).map((src, i) => (
                      <Tag key={i} color="blue">{src.source}</Tag>
                    ))
                  ) : <span style={{ color: '#999' }}>无特定来源记录</span>}
                </div>
                
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>人名归一化记录:</div>
                  {d.source_personName && d.source_personName.length > 0 ? (
                    <List
                      size="small"
                      dataSource={d.source_personName as PersonNameSource[]}
                      renderItem={(item) => (
                        <List.Item>
                          <span>{item.original_name}</span> 
                          <span style={{ margin: '0 8px' }}>→</span>
                          <Tag color="green">{item.name}</Tag>
                        </List.Item>
                      )}
                    />
                  ) : <span style={{ color: '#999' }}>无归一化记录</span>}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      )}
    </div>
  )
}
