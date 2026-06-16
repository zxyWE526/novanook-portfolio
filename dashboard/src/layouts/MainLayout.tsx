import { useState } from 'react';
import { Layout, Menu, Typography, theme } from 'antd';
import {
  DashboardOutlined,
  BookOutlined,
  ApartmentOutlined,
  DatabaseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Sider, Header, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/subjects', icon: <BookOutlined />, label: '学科管理' },
  { key: '/knowledge-tree', icon: <ApartmentOutlined />, label: '知识树' },
  { key: '/questions', icon: <DatabaseOutlined />, label: '题库管理' },
  { key: '/wrong-questions', icon: <WarningOutlined />, label: '错题本' },
  { key: '/review', icon: <CheckCircleOutlined />, label: '复习任务' },
  { key: '/analytics', icon: <BarChartOutlined />, label: '数据分析' },
];

const pageTitles: Record<string, string> = {
  '/dashboard': '工作台',
  '/subjects': '学科管理',
  '/knowledge-tree': '知识树',
  '/questions': '题库管理',
  '/wrong-questions': '错题本',
  '/review': '复习任务',
  '/analytics': '数据分析',
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  const currentTitle = pageTitles[location.pathname] || '工作台';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        theme="dark"
        style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
      >
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Title level={4} style={{ color: '#fff', margin: 0, fontSize: collapsed ? 14 : 16, whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {collapsed ? 'CS' : 'CS408 学习系统'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{ cursor: 'pointer', fontSize: 18, color: '#666' }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <Title level={4} style={{ margin: 0, color: '#333' }}>{currentTitle}</Title>
          </div>
          <div style={{ color: '#999', fontSize: 14 }}>CS408 Intelligent Learning System</div>
        </Header>

        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 360 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
