import { Card, List } from 'antd'
import ReactECharts from 'echarts-for-react'

type MovieItem = { title: string, urls?: string[] }
type ChartDatum = Record<string, string | number>

export default function EnginePanel(props: {
  title: string
  loading: boolean
  error?: unknown
  results: ChartDatum[]
  movies?: MovieItem[]
  xKey?: string
  yKey?: string
}) {
  const { title, loading, error, results, movies, xKey = 'name', yKey = 'count' } = props
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
    <Card className="card" bodyStyle={{ padding: 12 }}>
      {loading && <div>加载中</div>}
      {error ? <div>错误</div> : null}
      {!loading && !error && <ReactECharts option={option} style={{ height: 260 }} />}
      {!loading && !error && movies && movies.length > 0 && (
        <List
          size="small"
          header="电影列表"
          dataSource={movies}
          renderItem={(item: MovieItem) => (
            <List.Item>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div>{item.title}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(item.urls || []).slice(0, 2).map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer">{u}</a>
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
