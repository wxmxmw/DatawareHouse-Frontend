import { Layout, Menu, ConfigProvider } from 'antd'
import { Link, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Lineage from './pages/Lineage'
import ETLSummary from './pages/ETLSummary'
import Logs from './pages/Logs'

const { Header, Content, Footer } = Layout

export default function App() {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#1f77b4' } }}>
      <Layout style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Header style={{ background: 'white', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>DataWareHouse</div>
            <Menu mode="horizontal" defaultSelectedKeys={['/']} style={{ flex: 1 }} selectable>
              <Menu.Item key="/"><Link to="/">Statistics and Comparison</Link></Menu.Item>
              <Menu.Item key="/lineage"><Link to="/lineage">Data Lineage</Link></Menu.Item>
              <Menu.Item key="/etl"><Link to="/etl">ETL Overview</Link></Menu.Item>
              <Menu.Item key="/logs"><Link to="/logs">System Logs</Link></Menu.Item>
            </Menu>
          </div>
        </Header>
        <Content className="page">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/lineage" element={<Lineage />} />
            <Route path="/etl" element={<ETLSummary />} />
            <Route path="/logs" element={<Logs />} />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center', background: 'transparent' }}>Amazon Movie Data Warehouse · Analytics and Visualization</Footer>
      </Layout>
    </ConfigProvider>
  )
}
