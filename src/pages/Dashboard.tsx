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
  const [limit, setLimit] = useState(10)
  
  const [searchParams, setSearchParams] = useState<{
    granularity: string
    timeValue: string | undefined
    limit: number
  } | undefined>(undefined)

  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['time', engine, searchParams?.granularity, searchParams?.timeValue, searchParams?.limit],
      queryFn: ({ signal }) => getMoviesByTime(engine, searchParams!.granularity, searchParams!.timeValue, searchParams!.limit, signal),
      staleTime: 60000,
      enabled: !!searchParams 
    }))
  })

  const showExecutionTime = !!searchParams

  const handleSearch = () => {
    const newParams = { granularity, timeValue, limit }
    if (JSON.stringify(newParams) !== JSON.stringify(searchParams)) {
      setSearchParams(newParams)
    } else {
      results.forEach(r => r.refetch())
    }
  }

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="Granularity">
          <Select value={granularity} onChange={setGranularity} options={[
            { value: 'year', label: 'Year' },
            { value: 'month', label: 'Month' },
            { value: 'quarter', label: 'Quarter' },
            { value: 'day_of_week', label: 'Day of week' }
          ]} />
        </Form.Item>
        <Form.Item label="Time">
          <Input 
            placeholder="Enter a value, then search"
            value={timeValue} 
            onChange={e => setTimeValue(e.target.value)} 
            onPressEnter={handleSearch}
          />
        </Form.Item>
        <Form.Item label="Limit">
          <Select value={limit} onChange={setLimit} options={[10,20,50].map(v => ({ value: v, label: v }))} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>Search</Button>
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
  const [searchParams, setSearchParams] = useState<string | undefined | null>(null) // null means not searched yet, undefined means search all
  
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['genres', engine, searchParams],
      queryFn: ({ signal }) => getGenres(engine, searchParams === null ? undefined : searchParams, signal), 
      staleTime: 60000,
      enabled: searchParams !== null
    }))
  })

  const handleSearch = () => {
    // Treat undefined as a valid search param (all genres)
    // We use null to indicate "not searched yet"
    const nextParam = selectedGenre
    if (nextParam !== searchParams) {
      setSearchParams(nextParam)
    } else {
      results.forEach(r => r.refetch())
    }
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
        <Form.Item label="Filter by genre">
          <Select 
            allowClear 
            placeholder="All genres"
            style={{ width: 240 }}
            value={selectedGenre} 
            onChange={setSelectedGenre} 
            options={genreOptions} 
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>Search</Button>
        </Form.Item>
      </Form>
      {searchParams !== null && (
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
  const [searchParams, setSearchParams] = useState<number | null>(null)

  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['high-rated', engine, searchParams],
      queryFn: ({ signal }) => getHighRated(engine, searchParams!, signal),
      staleTime: 60000,
      enabled: searchParams !== null
    }))
  })

  const handleSearch = () => {
    if (minScore !== searchParams) {
      setSearchParams(minScore)
    } else {
      results.forEach(r => r.refetch())
    }
  }

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="Minimum rating (0.0–5.0)">
          <Slider min={0} max={5} step={0.1} value={minScore} onChange={(v) => setMinScore(Number(v))} style={{ width: 240 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>Search</Button>
        </Form.Item>
      </Form>
      {searchParams !== null && (
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

interface CollabItem {
  person1: string
  person2: string
  collab_count: number
  movies: Array<{ title: string }>
}

function CollaborationsStats() {
  const [type, setType] = useState<'actor_actor'|'director_actor'>('director_actor')
  const [minCount, setMinCount] = useState(3)
  const [searchParams, setSearchParams] = useState<{
    type: 'actor_actor'|'director_actor'
    minCount: number
  } | null>(null)

  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['collab', engine, searchParams?.type, searchParams?.minCount],
      queryFn: ({ signal }) => getCollaborations(engine, searchParams!.type, searchParams!.minCount, signal),
      staleTime: 60000,
      enabled: !!searchParams
    }))
  })

  const handleSearch = () => {
    const newParams = { type, minCount }
    if (JSON.stringify(newParams) !== JSON.stringify(searchParams)) {
      setSearchParams(newParams)
    } else {
      results.forEach(r => r.refetch())
    }
  }

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="Type">
          <Select value={type} onChange={setType} options={[
            { value: 'actor_actor', label: 'Actor–actor' },
            { value: 'director_actor', label: 'Director–actor' }
          ]} />
        </Form.Item>
        <Form.Item label="Minimum collaborations">
          <Select value={minCount} onChange={setMinCount} options={[3,5,8].map(v => ({ value: v, label: v }))} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>Search</Button>
        </Form.Item>
      </Form>
      {!!searchParams && (
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
              customRender={(data: unknown[]) => (
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {(data as CollabItem[]).map((item, i) => (
                    <div key={i} style={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        {item.person1} & {item.person2}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                        Collaborations: {item.collab_count}
                      </div>
                      <div style={{ fontSize: 12 }}>
                        <div style={{ marginBottom: 4 }}>Representative movies:</div>
                        {(item.movies || []).map((m, j) => (
                          <div key={j} style={{ paddingLeft: 8, marginBottom: 2 }}>
                            • <span title={m.title}>{m.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

function VersionsStats() {
  const [title, setTitle] = useState<string | undefined>(undefined)
  const [searchParams, setSearchParams] = useState<string | null>(null)

  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['versions', engine, searchParams],
      queryFn: ({ signal }) => getMovieVersions(engine, searchParams!, signal),
      staleTime: 60000,
      enabled: searchParams !== null
    }))
  })

  const handleSearch = () => {
    if (!title) return // Don't search if empty? Or allow empty? Assuming title is required for this one as per previous logic (enabled: !!debouncedTitle)
    
    if (title !== searchParams) {
      setSearchParams(title)
    } else {
      results.forEach(r => r.refetch())
    }
  }

  const showExecutionTime = searchParams !== null

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="Movie title">
          <Input 
            placeholder="Enter a value, then search"
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            onPressEnter={handleSearch}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>Search</Button>
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
              results={(r.data?.data?.movies || [])}
              movies={(r.data?.data?.movies || [])}
              xKey="title"
              yKey="version_count"
              totalCount={r.data?.data?.count ?? (r.data?.data?.movies || []).length}
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
  const [searchParams, setSearchParams] = useState<string | null>(null)

  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['director-works', engine, searchParams],
      queryFn: ({ signal }) => getDirectorWorks(engine, searchParams!, signal),
      staleTime: 60000,
      enabled: searchParams !== null
    }))
  })

  const handleSearch = () => {
    if (!director) return
    if (director !== searchParams) {
      setSearchParams(director)
    } else {
      results.forEach(r => r.refetch())
    }
  }

  const showExecutionTime = searchParams !== null

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="Director">
          <Input 
            placeholder="Enter a value, then search"
            value={director} 
            onChange={e => setDirector(e.target.value)} 
            onPressEnter={handleSearch}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>Search</Button>
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
            totalCount={r.data?.data?.count ?? (r.data?.data?.movies || []).length}
            hideChart={true}
          />
        ))}
      </div>
    </>
  )
}

function ActorStats() {
  const [actor, setActor] = useState<string | undefined>(undefined)
  const [searchParams, setSearchParams] = useState<string | null>(null)

  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['actor-works', engine, searchParams],
      queryFn: ({ signal }) => getActorWorks(engine, searchParams!, signal),
      staleTime: 60000,
      enabled: searchParams !== null
    }))
  })

  const showExecutionTime = searchParams !== null

  const handleSearch = () => {
    if (!actor) return
    if (actor !== searchParams) {
      setSearchParams(actor)
    } else {
      results.forEach(r => r.refetch())
    }
  }

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="Actor">
          <Input 
            placeholder="Enter a value, then search"
            value={actor} 
            onChange={e => setActor(e.target.value)} 
            onPressEnter={handleSearch}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>Search</Button>
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
            totalCount={r.data?.data?.count ?? (r.data?.data?.movies || []).length}
            hideChart={true}
            customRender={(data: unknown[]) => {
              const roleData = data as Array<{ name: string, role_type: string, count: number }>
              return (
                <div style={{ padding: '0 8px', marginBottom: 16 }}>
                  {roleData.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <span style={{ fontWeight: 500 }}>
                        {item.role_type === 'Main Actor' ? 'Main actor' : 'Supporting actor'}:
                      </span>
                      <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                        {item.count} movies
                      </span>
                    </div>
                  ))}
                </div>
              )
            }}
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
    title: { text: 'Query Execution Time (ms)' },
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
        <Form.Item name="engine" label="Query engine" initialValue="pg">
          <Select options={[{value:'pg',label:'pg'},{value:'spark',label:'spark'},{value:'neo4j',label:'neo4j'}]} />
        </Form.Item>
        <Form.Item name="year" label="Year"><Input placeholder="e.g. 2005" /></Form.Item>
        <Form.Item name="genre" label="Genre" style={{ width: 200 }}>
          <Select allowClear placeholder="Select a genre" options={genreOptions} />
        </Form.Item>
        <Form.Item name="min_score" label="Minimum rating">
          <InputNumber min={0} max={5} step={0.1} />
        </Form.Item>
        <Form.Item name="director" label="Director"><Input placeholder="e.g. Spielberg" /></Form.Item>
        <Form.Item name="actor" label="Actor"><Input placeholder="e.g. Tom Hanks" /></Form.Item>
        <Form.Item name="limit" label="Result limit" initialValue={10}><InputNumber placeholder="10" /></Form.Item>
        <Button type="primary" htmlType="submit">Search</Button>
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
            title="Results"
            loading={mutation.isPending}
            error={mutation.isError ? mutation.error : null}
            results={(mutation.data?.data?.results || [])}
            movies={(mutation.data?.data?.results || [])}
            xKey="title"
            yKey="score"
            totalCount={mutation.data?.data?.count ?? (mutation.data?.data?.results || []).length}
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
  
  const [searchParams, setSearchParams] = useState<{
    size: 2|3
    genre: string | undefined
  } | null>(null)

  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['popular-combos', engine, searchParams?.size, searchParams?.genre],
      queryFn: ({ signal }) => getPopularCombos(engine, searchParams!.size, searchParams!.genre, 10, signal),
      staleTime: 60000,
      enabled: !!searchParams
    }))
  })

  const handleSearch = () => {
    const newParams = { size, genre }
    if (JSON.stringify(newParams) !== JSON.stringify(searchParams)) {
      setSearchParams(newParams)
    } else {
      results.forEach(r => r.refetch())
    }
  }

  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="Group size">
          <Select value={size} onChange={setSize} options={[{value:2,label:'2 people'},{value:3,label:'3 people'}]} />
        </Form.Item>
        <Form.Item label="Genre" style={{ width: 240 }}>
          <Select 
            allowClear 
            placeholder="Select a genre"
            value={genre} 
            onChange={setGenre} 
            options={genreOptions} 
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={handleSearch}>Search</Button>
        </Form.Item>
      </Form>
      {!!searchParams && (
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
            customRender={(data: unknown[]) => {
              const comboData = data as Array<{ combo: string[], movies: Array<{ title: string, urls: string[] }>, review_count_total: number }>
              return (
                <div style={{ maxHeight: 400, overflowY: 'auto', padding: '0 8px' }}>
                  {comboData.map((item, i) => (
                    <div key={i} style={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        Group: {item.combo.join(' + ')}
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                        Total reviews: {item.review_count_total}
                      </div>
                      <div style={{ fontSize: 12 }}>
                        <div style={{ marginBottom: 4 }}>Related movies:</div>
                        {(item.movies || []).map((m, j) => (
                          <div key={j} style={{ paddingLeft: 8, marginBottom: 4 }}>
                            • <span style={{ fontWeight: 500 }} title={m.title}>{m.title}</span>
                            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                              {(m.urls || []).slice(0, 2).map((u, k) => (
                                <a key={k} href={u} target="_blank" rel="noreferrer" style={{ color: '#1890ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }} title={u}>Link {k + 1}</a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }}
          />
          </Col>
        ))}
      </Row>
    </>
  )
}

export default function Dashboard() {
  const [activeKey, setActiveKey] = useState('time')

  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-title">Movie Analytics and Performance Comparison</div>
          <div className="hero-sub">Compare query results and execution times across PostgreSQL, Spark, and Neo4j</div>
        </div>
      </div>
      <Tabs 
        activeKey={activeKey} 
        onChange={setActiveKey}
        destroyInactiveTabPane={true} // Destroy inactive tabs to cancel queries
        items={[
        { key: 'time', label: 'Movies by Time', children: <TimeStats /> },
        { key: 'genres', label: 'Genres', children: <GenresStats /> },
        { key: 'high', label: 'Highly Rated', children: <HighRatedStats /> },
        { key: 'collab', label: 'Collaborations', children: <CollaborationsStats /> },
        { key: 'versions', label: 'Movie Versions', children: <VersionsStats /> },
        { key: 'director', label: 'Director Works', children: <DirectorStats /> },
        { key: 'actor', label: 'Actor Works', children: <ActorStats /> },
        { key: 'complex', label: 'Advanced Filter', children: <ComplexFilter /> },
        { key: 'popular', label: 'Popular Groups', children: <PopularCombos /> }
      ]} />
    </div>
  )
}
