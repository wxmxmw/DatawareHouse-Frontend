import { Tabs, Form, Select, Input, InputNumber, Slider, Button, Row, Col } from 'antd'
import { useQueries, useMutation } from '@tanstack/react-query'
import EnginePanel from '../components/EnginePanel'
import { getMoviesByTime, getGenres, getHighRated, getCollaborations, getMovieVersions, getDirectorWorks, getActorWorks, postComplexFilter, getReviews, getPopularCombos, type ComplexFilterBody } from '../api/stats'
import { useState } from 'react'

function TimeStats() {
  const [granularity, setGranularity] = useState('year')
  const [timeValue, setTimeValue] = useState<string | undefined>(undefined)
  const [limit, setLimit] = useState(10)
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['time', engine, granularity, timeValue, limit],
      queryFn: () => getMoviesByTime(engine, granularity, timeValue, limit),
      staleTime: 60000
    }))
  })
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
          <Input placeholder="如 2005 或 2005-07" value={timeValue} onChange={e => setTimeValue(e.target.value)} />
        </Form.Item>
        <Form.Item label="条数">
          <Select value={limit} onChange={setLimit} options={[10,20,50].map(v => ({ value: v, label: v }))} />
        </Form.Item>
      </Form>
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
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

function GenresStats() {
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['genres', engine],
      queryFn: () => getGenres(engine),
      staleTime: 60000
    }))
  })
  return (
    <Row gutter={16}>
      {results.map((r, idx) => (
        <Col span={8} key={idx}>
          <EnginePanel
            title={engines[idx]}
            loading={r.isLoading}
            error={r.isError ? r.error : null}
            results={(r.data?.data?.results || [])}
            movies={(r.data?.data?.movies || [])}
            xKey="genre"
            yKey="count"
          />
        </Col>
      ))}
    </Row>
  )
}

function HighRatedStats() {
  const [minScore, setMinScore] = useState(4.5)
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['high-rated', engine, minScore],
      queryFn: () => getHighRated(engine, minScore),
      staleTime: 60000
    }))
  })
  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="最低评分 (0.0-5.0)">
          <Slider min={0} max={5} step={0.1} value={minScore} onChange={(v) => setMinScore(Number(v))} style={{ width: 240 }} />
        </Form.Item>
      </Form>
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
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['collab', engine, type, minCount],
      queryFn: () => getCollaborations(engine, type, minCount),
      staleTime: 60000
    }))
  })
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
      </Form>
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
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

function VersionsStats() {
  const [title, setTitle] = useState<string | undefined>(undefined)
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['versions', engine, title],
      queryFn: () => getMovieVersions(engine, title),
      staleTime: 60000
    }))
  })
  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="片名">
          <Input placeholder="如 Harry Potter" value={title} onChange={e => setTitle(e.target.value)} />
        </Form.Item>
      </Form>
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
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

function PeopleStats() {
  const [director, setDirector] = useState<string | undefined>(undefined)
  const [actor, setActor] = useState<string | undefined>(undefined)
  const engines = ['pg','spark','neo4j'] as const
  const directorRes = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['director-works', engine, director],
      queryFn: () => getDirectorWorks(engine, director),
      staleTime: 60000
    }))
  })
  const actorRes = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['actor-works', engine, actor],
      queryFn: () => getActorWorks(engine, actor),
      staleTime: 60000
    }))
  })
  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="导演">
          <Input placeholder="如 Steven Spielberg" value={director} onChange={e => setDirector(e.target.value)} />
        </Form.Item>
        <Form.Item label="演员">
          <Input placeholder="如 Tom Hanks" value={actor} onChange={e => setActor(e.target.value)} />
        </Form.Item>
      </Form>
      <div className="grid">
        {directorRes.map((r, idx) => (
          <EnginePanel
            key={'d'+idx}
            title={engines[idx] + ' 导演'}
            loading={r.isLoading}
            error={r.isError ? r.error : null}
            results={(r.data?.data?.results || [])}
            movies={(r.data?.data?.movies || [])}
            xKey="name"
            yKey="movie_count"
          />
        ))}
      </div>
      <div className="grid">
        {actorRes.map((r, idx) => (
          <EnginePanel
            key={'a'+idx}
            title={engines[idx] + ' 演员'}
            loading={r.isLoading}
            error={r.isError ? r.error : null}
            results={(r.data?.data?.results || [])}
            movies={(r.data?.data?.movies || [])}
            xKey="name"
            yKey="count"
          />
        ))}
      </div>
    </>
  )
}

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
  return (
    <>
      <Form form={form} layout="inline" onFinish={values => mutation.mutate(values)} style={{ marginBottom: 12 }}>
        <Form.Item name="engine" initialValue="pg">
          <Select options={[{value:'pg',label:'pg'},{value:'spark',label:'spark'},{value:'neo4j',label:'neo4j'}]} />
        </Form.Item>
        <Form.Item name="year"><Input placeholder="年份" /></Form.Item>
        <Form.Item name="genre"><Input placeholder="类别" /></Form.Item>
        <Form.Item name="min_score" label="最低评分">
          <InputNumber min={0} max={5} step={0.1} />
        </Form.Item>
        <Form.Item name="director"><Input placeholder="导演" /></Form.Item>
        <Form.Item name="limit" initialValue={10}><Input placeholder="条数" /></Form.Item>
        <Button type="primary" htmlType="submit">查询</Button>
      </Form>
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
          />
        </Col>
      </Row>
    </>
  )
}

function Reviews() {
  const [minScore, setMinScore] = useState<number | undefined>(3.0)
  const [sentiment, setSentiment] = useState<'positive'|'negative'|'neutral' | undefined>('positive')
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['reviews', engine, minScore, sentiment],
      queryFn: () => getReviews(engine, minScore, sentiment),
      staleTime: 60000
    }))
  })
  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="最低评分 (0.0-5.0)">
          <Slider min={0} max={5} step={0.1} value={minScore} onChange={(v) => setMinScore(Number(v))} style={{ width: 240 }} />
        </Form.Item>
        <Form.Item label="情感">
          <Select value={sentiment} onChange={(v) => setSentiment(v as 'positive'|'negative'|'neutral')} options={[
            { value: 'positive', label: '正面' },
            { value: 'neutral', label: '中性' },
            { value: 'negative', label: '负面' }
          ]} />
        </Form.Item>
      </Form>
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
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

function PopularCombos() {
  const [size, setSize] = useState<2|3>(2)
  const [genre, setGenre] = useState<string | undefined>(undefined)
  const engines = ['pg','spark','neo4j'] as const
  const results = useQueries({
    queries: engines.map(engine => ({
      queryKey: ['popular-combos', engine, size, genre],
      queryFn: () => getPopularCombos(engine, size, genre),
      staleTime: 60000
    }))
  })
  return (
    <>
      <Form layout="inline" style={{ marginBottom: 12 }}>
        <Form.Item label="组合人数">
          <Select value={size} onChange={v => setSize(v)} options={[{value:2,label:'2人'},{value:3,label:'3人'}]} />
        </Form.Item>
        <Form.Item label="类别">
          <Input placeholder="如 Action" value={genre} onChange={e => setGenre(e.target.value)} />
        </Form.Item>
      </Form>
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
        { key: 'people', label: '导演与演员作品', children: <PeopleStats /> },
        { key: 'complex', label: '组合筛选', children: <ComplexFilter /> },
        { key: 'reviews', label: '用户评价与情感', children: <Reviews /> },
        { key: 'popular', label: '最受关注组合', children: <PopularCombos /> }
      ]} />
    </div>
  )
}
