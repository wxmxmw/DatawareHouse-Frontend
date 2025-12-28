import { Card, List } from 'antd'
import ReactECharts from 'echarts-for-react'

type MovieItem = { title: string, urls?: string[], positive_review_count?: number }
type ChartDatum = Record<string, string | number | unknown>

export default function EnginePanel(props: {
  title: string
  loading: boolean
  error?: unknown
  results: ChartDatum[]
  movies?: MovieItem[]
  xKey?: string
  yKey?: string
  totalCount?: number
  hideChart?: boolean
  customRender?: (data: unknown[]) => React.ReactNode
}) {
  const { title, loading, error, results, movies, xKey = 'name', yKey = 'count', totalCount, hideChart, customRender } = props
  const xData = results.map(d => String(d[xKey] ?? ''))
  const seriesData = results.map(d => Number(d[yKey] ?? 0))
  const option = {
    title: { text: title },
    grid: { left: 40, right: 20, top: 40, bottom: 40 },
    tooltip: {},
    xAxis: { type: 'category', data: xData },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: seriesData, itemStyle: { color: '#1f77b4' } }]
  }
  return (
    <Card className="card" style={{ minWidth: 0 }} bodyStyle={{ padding: 12, overflow: 'hidden' }}>
      {loading && <div style={{ position: 'absolute', zIndex: 10, background: 'rgba(255,255,255,0.8)', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>加载中</div>}
      {error ? <div>错误</div> : (
        !hideChart && (
          <ReactECharts 
            option={option} 
            style={{ height: 260, visibility: error ? 'hidden' : 'visible' }} 
          />
        )
      )}
      {!loading && !error && customRender && customRender(results)}
      {!loading && !error && movies && movies.length > 0 && (
        <List
          size="small"
          header={<div style={{ fontWeight: 600 }}>电影列表 {totalCount !== undefined ? `(显示 ${movies.length} 条 / 共 ${totalCount} 条)` : `(${movies.length})`}</div>}
          bordered
          dataSource={movies}
          renderItem={(item: MovieItem) => (
            <List.Item>
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4, fontWeight: 500 }} title={item.title}>
                  {item.title}
                </div>
                {item.positive_review_count !== undefined && item.positive_review_count !== null && (
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    正向评论: {item.positive_review_count} 条
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                  {(item.urls || []).slice(0, 2).map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120, display: 'inline-block' }} title={u}>{u}</a>
                  ))}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  )
}
