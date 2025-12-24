import { Card, List } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getModels } from '../api/system'

export default function Models() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['models'], queryFn: () => getModels() })
  type SummaryKV = { k: string, v: string | number | undefined }
  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-title">存储模型协同</div>
          <div className="hero-sub">关系型、分布式与图模型摘要</div>
        </div>
      </div>
      <Card className="card" style={{ marginTop: 16 }}>
        {isLoading && <div>加载中</div>}
        {isError && <div>错误</div>}
        {!isLoading && !isError && (
          <List
            header="模型摘要"
            dataSource={[
              { k: '关系型', v: (data?.data?.relational?.tables || []).join(', ') },
              { k: '分布式格式', v: (data?.data?.distributed?.formats || []).join(', ') },
              { k: '分布式计算', v: data?.data?.distributed?.compute },
              { k: '图模型节点', v: (data?.data?.graph?.nodes || []).join(', ') },
              { k: '图模型关系', v: (data?.data?.graph?.relations || []).join(', ') }
            ]}
            renderItem={(item: SummaryKV) => <List.Item>{item.k}: {item.v}</List.Item>}
          />
        )}
      </Card>
    </div>
  )
}
