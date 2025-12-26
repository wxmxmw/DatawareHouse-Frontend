import ReactECharts from 'echarts-for-react'

interface ChartResult {
  data?: {
    data?: {
      execution_time_ms?: number
    }
  }
}

export default function ExecutionTimeChart({ results, engines }: { results: ChartResult[], engines: readonly string[] }) {
  const option = {
    title: { text: '查询耗时对比 (ms)' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: engines },
    yAxis: { type: 'value', name: 'ms' },
    series: [{
      type: 'bar',
      data: results.map(r => r.data?.data?.execution_time_ms || 0),
      itemStyle: { color: '#5470c6' },
      label: { show: true, position: 'top' }
    }]
  }

  // 只有当至少有一个结果有耗时数据时才显示
  const hasData = results.some(r => r.data?.data?.execution_time_ms !== undefined)

  if (!hasData) return null

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
      <ReactECharts option={option} style={{ height: 300 }} />
    </div>
  )
}
