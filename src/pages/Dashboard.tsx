import { Tabs, Form, Select, Input, InputNumber, Slider, Button, Row, Col } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useQueries, useMutation } from '@tanstack/react-query'
import EnginePanel from '../components/EnginePanel'
import ExecutionTimeChart from '../components/ExecutionTimeChart'
import { getMoviesByTime, getGenres, getHighRated, getCollaborations, getMovieVersions, getDirectorWorks, getActorWorks, postComplexFilter, getPopularCombos, type ComplexFilterBody } from '../api/stats'
import { useState } from 'react'

function TimeStats() {
  const [granularity, setGranularity] = useState('year')
  const [timeValue, setTimeValue] = useState<string | undefined>(undefined)
  const [debouncedTimeValue, setDebouncedTimeValue] = useState<string | undefined>(undefined)
  const [limit, setLimit] = useState(10)
  
  // Debounce timeValue effect
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTimeValue(val)
  }

  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['time', engine, granularity, debouncedTimeValue, limit],
      queryFn: () => getMoviesByTime(engine, granularity, debouncedTimeValue, limit),
      staleTime: 60000,
      enabled: !!debouncedTimeValue 
    }))
  })

  const showExecutionTime = !!debouncedTimeValue

  const handleSearch = () => {
    setDebouncedTimeValue(timeValue)
  }

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="粒度">
          <Select value={granularity} onChange={setGranularity} options={[
            { value: 'year', label: '年' },
            { value: 'month', label: '月' },
            { value: 'quarter', label: '季度' },
            { value: 'day_of_week', label: '星期' }
          ]} />
        </Form.Item>
        <Form.Item label="时间">
          <Input 
            placeholder="输入后点击查询" 
            value={timeValue} 
            onChange={handleTimeChange} 
            onPressEnter={handleSearch}
          />
        </Form.Item>
        <Form.Item label="条数">
          <Select value={limit} onChange={setLimit} options={[10,20,50].map(v => ({ value: v, label: v }))} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>查询</Button>
        </Form.Item>
      </Form>
      {showExecutionTime && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <ExecutionTimeChart results={results} engines={engines} />
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        {results.map((r, idx) => (
          <Col span={8} key={idx}>
            <EnginePanel
              title={engines[idx]}
              loading={r.isLoading}
              error={r.isError ? r.error : null}
              results={(r.data?.data?.results || [])}
              movies={(r.data?.data?.movies || [])}
              xKey="time_point"
              yKey="count"
              totalCount={r.data?.data?.count ?? (r.data?.data?.results || []).reduce((sum: number, item: Record<string, string | number>) => sum + (Number(item.count) || 0), 0)}
              hideChart={showExecutionTime}
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

function GenresStats() {
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(undefined)
  const [triggerQuery, setTriggerQuery] = useState(false)
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['genres', engine, selectedGenre],
      queryFn: () => getGenres(engine, selectedGenre), 
      staleTime: 60000,
      enabled: triggerQuery
    }))
  })

  const handleSearch = () => {
    setTriggerQuery(true)
    results.forEach(r => r.refetch())
  }

  const genreOptions = [
    "Featured Categories", "DVD", "Drama", "Special Interests", "Comedy", 
    "Action & Adventure", "Documentary", "Kids & Family", "Anime", "Horror", 
    "Sports", "Foreign Films", "Mystery & Thrillers", "Westerns", 
    "Science Fiction", "Musicals", "Military & War", "Movies", 
    "Blu-ray, Action & Adventure", "International"
  ].map(g => ({ value: g, label: g }))

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="筛选类别">
          <Select 
            allowClear 
            placeholder="全部" 
            style={{ width: 240 }}
            value={selectedGenre} 
            onChange={setSelectedGenre} 
            options={genreOptions} 
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>查询</Button>
        </Form.Item>
      </Form>
      {triggerQuery && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <ExecutionTimeChart results={results} engines={engines} />
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        {results.map((r, idx) => {
          const rawResults = r.data?.data?.results || []
          const totalCount = r.data?.data?.count ?? rawResults.reduce((sum: number, item: { count: string | number }) => sum + (Number(item.count) || 0), 0)

          return (
            <Col span={8} key={idx}>
              <EnginePanel
                title={engines[idx]}
                loading={r.isLoading}
                error={r.isError ? r.error : null}
                results={rawResults}
                movies={(r.data?.data?.movies || [])} 
                xKey="genre"
                yKey="count"
                totalCount={totalCount}
                hideChart={true}
              />
            </Col>
          )
        })}
      </Row>
    </>
  )
}

function HighRatedStats() {
  const [minScore, setMinScore] = useState(4.5)
  const [triggerQuery, setTriggerQuery] = useState(false)
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['high-rated', engine, minScore],
      queryFn: () => getHighRated(engine, minScore),
      staleTime: 60000,
      enabled: triggerQuery
    }))
  })

  const handleSearch = () => {
    setTriggerQuery(true)
    results.forEach(r => r.refetch())
  }

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="最低评分 (0.0-5.0)">
          <Slider min={0} max={5} step={0.1} value={minScore} onChange={(v) => setMinScore(Number(v))} style={{ width: 240 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>查询</Button>
        </Form.Item>
      </Form>
      {triggerQuery && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <ExecutionTimeChart results={results} engines={engines} />
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        {results.map((r, idx) => (
          <Col span={8} key={idx}>
            <EnginePanel
              title={engines[idx]}
              loading={r.isLoading}
              error={r.isError ? r.error : null}
              results={(r.data?.data?.results || [])}
              movies={(r.data?.data?.results || [])}
              xKey="title"
              yKey="avg_score"
              totalCount={r.data?.data?.count ?? (r.data?.data?.results || []).length}
              hideChart={true}
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

function CollaborationsStats() {
  const [type, setType] = useState<'actor_actor'|'director_actor'>('director_actor')
  const [minCount, setMinCount] = useState(3)
  const [triggerQuery, setTriggerQuery] = useState(false)
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['collab', engine, type, minCount],
      queryFn: () => getCollaborations(engine, type, minCount),
      staleTime: 60000,
      enabled: triggerQuery
    }))
  })

  const handleSearch = () => {
    setTriggerQuery(true)
    results.forEach(r => r.refetch())
  }

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="类型">
          <Select value={type} onChange={v => setType(v)} options={[
            { value: 'actor_actor', label: '演员-演员' },
            { value: 'director_actor', label: '导演-演员' }
          ]} />
        </Form.Item>
        <Form.Item label="最少合作">
          <Select value={minCount} onChange={setMinCount} options={[3,5,8].map(v => ({ value: v, label: v }))} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>查询</Button>
        </Form.Item>
      </Form>
      {triggerQuery && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <ExecutionTimeChart results={results} engines={engines} />
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        {results.map((r, idx) => (
          <Col span={8} key={idx}>
            <EnginePanel
              title={engines[idx]}
              loading={r.isLoading}
              error={r.isError ? r.error : null}
              results={(r.data?.data?.results || [])}
              movies={undefined}
              xKey="collab_count"
              yKey="collab_count"
              hideChart={true}
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

function VersionsStats() {
  const [title, setTitle] = useState<string | undefined>(undefined)
  const [debouncedTitle, setDebouncedTitle] = useState<string | undefined>(undefined)
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['versions', engine, debouncedTitle],
      queryFn: () => getMovieVersions(engine, debouncedTitle),
      staleTime: 60000,
      enabled: !!debouncedTitle
    }))
  })

  const handleSearch = () => {
    setDebouncedTitle(title)
  }

  const showExecutionTime = !!debouncedTitle

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="片名">
          <Input 
            placeholder="输入后点击查询" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            onPressEnter={handleSearch}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>查询</Button>
        </Form.Item>
      </Form>
      {showExecutionTime && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <ExecutionTimeChart results={results} engines={engines} />
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        {results.map((r, idx) => (
          <Col span={8} key={idx}>
            <EnginePanel
              title={engines[idx]}
              loading={r.isLoading}
              error={r.isError ? r.error : null}
              results={(r.data?.data?.results || [])}
              movies={(r.data?.data?.results || [])}
              xKey="title"
              yKey="version_count"
              hideChart={true}
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

function DirectorStats() {
  const [director, setDirector] = useState<string | undefined>(undefined)
  const [debouncedDirector, setDebouncedDirector] = useState<string | undefined>(undefined)
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['director-works', engine, debouncedDirector],
      queryFn: () => getDirectorWorks(engine, debouncedDirector),
      staleTime: 60000,
      enabled: !!debouncedDirector
    }))
  })

  const handleSearch = () => {
    setDebouncedDirector(director)
  }

  const showExecutionTime = !!debouncedDirector

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="导演">
          <Input 
            placeholder="输入后点击查询" 
            value={director} 
            onChange={e => setDirector(e.target.value)} 
            onPressEnter={handleSearch}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>查询</Button>
        </Form.Item>
      </Form>
      {showExecutionTime && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <ExecutionTimeChart results={results} engines={engines} />
          </Col>
        </Row>
      )}
      <div className="grid">
        {results.map((r, idx) => (
          <EnginePanel
            key={idx}
            title={engines[idx]}
            loading={r.isLoading}
            error={r.isError ? r.error : null}
            results={(r.data?.data?.results || [])}
            movies={(r.data?.data?.movies || [])}
            xKey="name"
            yKey="movie_count"
            hideChart={true}
          />
        ))}
      </div>
    </>
  )
}

function ActorStats() {
  const [actor, setActor] = useState<string | undefined>(undefined)
  const [debouncedActor, setDebouncedActor] = useState<string | undefined>(undefined)
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['actor-works', engine, debouncedActor],
      queryFn: () => getActorWorks(engine, debouncedActor),
      staleTime: 60000,
      enabled: !!debouncedActor
    }))
  })

  const showExecutionTime = !!debouncedActor

  const handleSearch = () => {
    setDebouncedActor(actor)
  }

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="演员">
          <Input 
            placeholder="输入后点击查询" 
            value={actor} 
            onChange={e => setActor(e.target.value)} 
            onPressEnter={handleSearch}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>查询</Button>
        </Form.Item>
      </Form>
      {showExecutionTime && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <ExecutionTimeChart results={results} engines={engines} />
          </Col>
        </Row>
      )}
      <div className="grid">
        {results.map((r, idx) => (
          <EnginePanel
            key={idx}
            title={engines[idx]}
            loading={r.isLoading}
            error={r.isError ? r.error : null}
            results={(r.data?.data?.results || [])}
            movies={(r.data?.data?.movies || [])}
            xKey="name"
            yKey="count"
            hideChart={true}
          />
        ))}
      </div>
    </>
  )
}

const genreOptions = [
  "Featured Categories", "DVD", "Drama", "Special Interests", "Comedy", 
  "Action & Adventure", "Documentary", "Kids & Family", "Anime", "Horror", 
  "Sports", "Foreign Films", "Mystery & Thrillers", "Westerns", 
  "Science Fiction", "Musicals", "Military & War", "Movies", 
  "Blu-ray, Action & Adventure", "International"
].map(g => ({ value: g, label: g }))

function ComplexFilter() {
  const [form] = Form.useForm()
  const mutation = useMutation({
    mutationFn: (values: ComplexFilterBody) => {
      const payload = { ...values }
      if (payload.min_score != null) {
        payload.min_score = Number(Number(payload.min_score).toFixed(1))
      }
      return postComplexFilter(payload)
    }
  })

  const executionTimeOption = {
    title: { text: '查询耗时 (ms)' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: [mutation.variables?.engine || 'engine'] },
    yAxis: { type: 'value', name: 'ms' },
    series: [{
      type: 'bar',
      data: [mutation.data?.data?.execution_time_ms || 0],
      itemStyle: { color: '#5470c6' },
      label: { show: true, position: 'top' }
    }]
  }

  return (
    <>
      <Form form={form} layout="inline" onFinish={values => mutation.mutate(values)} style={{ marginBottom: 12 }}>
        <Form.Item name="engine" label="查询引擎" initialValue="pg">
          <Select options={[{value:'pg',label:'pg'},{value:'spark',label:'spark'},{value:'neo4j',label:'neo4j'}]} />
        </Form.Item>
        <Form.Item name="year" label="年份"><Input placeholder="如 2005" /></Form.Item>
        <Form.Item name="genre" label="类别" style={{ width: 200 }}>
          <Select allowClear placeholder="选择类别" options={genreOptions} />
        </Form.Item>
        <Form.Item name="min_score" label="最低评分">
          <InputNumber min={0} max={5} step={0.1} />
        </Form.Item>
        <Form.Item name="director" label="导演"><Input placeholder="如 Spielberg" /></Form.Item>
        <Form.Item name="actor" label="演员"><Input placeholder="如 Tom Hanks" /></Form.Item>
        <Form.Item name="limit" label="结果数量" initialValue={10}><InputNumber placeholder="10" /></Form.Item>
        <Button type="primary" htmlType="submit">查询</Button>
      </Form>
      {mutation.data && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <div style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
              <ReactECharts option={executionTimeOption} style={{ height: 300 }} />
            </div>
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        <Col span={24}>
          <EnginePanel
            title="结果"
            loading={mutation.isPending}
            error={mutation.isError ? mutation.error : null}
            results={(mutation.data?.data?.results || [])}
            movies={(mutation.data?.data?.results || [])}
            xKey="title"
            yKey="score"
            hideChart={true}
          />
        </Col>
      </Row>
    </>
  )
}


function PopularCombos() {
  const [size, setSize] = useState<2|3>(2)
  const [genre, setGenre] = useState<string | undefined>(undefined)
  
  const [querySize, setQuerySize] = useState<2|3 | undefined>(undefined)
  const [queryGenre, setQueryGenre] = useState<string | undefined>(undefined)

  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['popular-combos', engine, querySize, queryGenre],
      queryFn: () => getPopularCombos(engine, querySize!, queryGenre),
      staleTime: 60000,
      enabled: !!querySize
    }))
  })

  const handleSearch = () => {
    setQuerySize(size)
    setQueryGenre(genre)
  }

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="组合人数">
          <Select value={size} onChange={v => setSize(v)} options={[{value:2,label:'2人'},{value:3,label:'3人'}]} />
        </Form.Item>
        <Form.Item label="类别" style={{ width: 240 }}>
          <Select 
            allowClear 
            placeholder="选择类别" 
            value={genre} 
            onChange={setGenre} 
            options={genreOptions} 
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>查询</Button>
        </Form.Item>
      </Form>
      {!!querySize && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <ExecutionTimeChart results={results} engines={engines} />
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        {results.map((r, idx) => (
          <Col span={8} key={idx}>
            <EnginePanel
              title={engines[idx]}
              loading={r.isLoading}
              error={r.isError ? r.error : null}
              results={(r.data?.data?.results || [])}
              movies={undefined}
              xKey="review_count_total"
              yKey="review_count_total"
              hideChart={true}
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

export default function Dashboard() {
  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-title">电影数据分析与性能对比</div>
          <div className="hero-sub">并发对比 PostgreSQL、Spark、Neo4j 的查询结果与耗时</div>
        </div>
      </div>
      <Tabs defaultActiveKey="time" items={[
        { key: 'time', label: '时间统计', children: <TimeStats /> },
        { key: 'genres', label: '类别统计', children: <GenresStats /> },
        { key: 'high', label: '高评分', children: <HighRatedStats /> },
        { key: 'collab', label: '合作组合', children: <CollaborationsStats /> },
        { key: 'versions', label: '电影版本', children: <VersionsStats /> },
        { key: 'director', label: '导演作品', children: <DirectorStats /> },
        { key: 'actor', label: '演员参演作品', children: <ActorStats /> },
        { key: 'complex', label: '组合筛选', children: <ComplexFilter /> },
        { key: 'popular', label: '最受关注组合', children: <PopularCombos /> }
      ]} />
    </div>
  )
}
