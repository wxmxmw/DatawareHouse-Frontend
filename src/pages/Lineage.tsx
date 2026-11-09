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
    
    // Build the merged movie node
    const centerId = 'merged_center'
    const centerTitle = d?.merged_movie?.title || 'Merged movie'
    
    if (d?.merged_movie) {
      nodes.push({
        id: centerId,
        name: centerId, // ECharts uses name as a unique identifier
        value: centerTitle, // Displayed as the node label
        category: 0,
        symbolSize: 60,
        label: { show: true, formatter: '{c}' }
      })
    }
    
    // Build source nodes
    (d?.source_nodes || []).forEach((s: SourceNode, index: number) => {
      const sourceId = `source_${index}`
      const sourceTitle = s.title_on_page || `Source ${index + 1}`
      
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
    title: { text: 'Lineage Graph' },
    tooltip: {
      formatter: (params: TooltipParams) => {
        if (params.dataType === 'node') {
          return `${params.marker} ${params.data.value}`
        }
        return ''
      }
    },
    legend: [{ data: ['Merged movie','Source'] }],
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      label: { show: true },
      data: graphData.nodes,
      links: graphData.links,
      categories: [{ name: 'Merged movie' }, { name: 'Source' }],
      force: { repulsion: 1000, edgeLength: 100 }
    }]
  }

  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-title">Movie Data Lineage</div>
          <div className="hero-sub">Explore the source records and merge rules behind each movie</div>
        </div>
      </div>
      <Form layout="inline" style={{ marginTop: 16, marginBottom: 16 }}>
        <Form.Item label="Movie ID">
          <Input 
            value={movieId} 
            onChange={e => setMovieId(e.target.value)} 
            onPressEnter={handleSearch}
            placeholder="Enter a value, then search"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>Search</Button>
        </Form.Item>
      </Form>
      
      {detail.isLoading && <div style={{ textAlign: 'center', padding: 20 }}>Loading...</div>}
      {detail.isError && <div style={{ textAlign: 'center', padding: 20, color: 'red' }}>Query failed. Check the movie ID and try again.</div>}
      
      {!detail.isLoading && !detail.isError && d && (
        <Row gutter={[16, 16]}>
          {/* Lineage graph */}
          <Col span={14}>
            <Card className="card" title="Source Merge Graph">
              <div style={{ marginBottom: 16, color: '#666' }}>
                See which source pages were merged into this movie. The center node is the merged record; surrounding nodes are source pages.
              </div>
              <ReactECharts option={option} style={{ height: 500 }} />
            </Card>
          </Col>
          
          {/* Details */}
          <Col span={10}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Merged movie details */}
              <Card className="card" title="Merged Movie">
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="ID">{d.merged_movie.id}</Descriptions.Item>
                  <Descriptions.Item label="Title">{d.merged_movie.title}</Descriptions.Item>
                  <Descriptions.Item label="Director">{d.merged_movie.director}</Descriptions.Item>
                  <Descriptions.Item label="Actor">{d.merged_movie.actor}</Descriptions.Item>
                  <Descriptions.Item label="Release date">{d.merged_movie.releaseDate}</Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Source pages */}
              <Card className="card" title="Source Pages">
                <List
                  size="small"
                  dataSource={d.source_nodes as SourceNode[]}
                  renderItem={(item) => (
                    <List.Item>
                      <div style={{ wordBreak: 'break-all' }}>
                        <div style={{ fontWeight: 500 }}>{item.title_on_page}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>ID: {item.source_id}</div>
                        {/^https?:\/\//i.test(item.url) && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>{item.url}</a>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              </Card>

              {/* Field provenance */}
              <Card className="card" title="Field Lineage">
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>Release date source:</div>
                  {d.source_releaseDate && d.source_releaseDate.length > 0 ? (
                    (d.source_releaseDate as ReleaseDateSource[]).map((src, i) => (
                      <Tag key={i} color="blue">{src.source}</Tag>
                    ))
                  ) : <span style={{ color: '#999' }}>No source recorded</span>}
                </div>
                
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>Name normalization:</div>
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
                  ) : <span style={{ color: '#999' }}>No normalization recorded</span>}
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      )}
    </div>
  )
}
