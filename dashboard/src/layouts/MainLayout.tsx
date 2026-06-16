import { useState } from 'react';
import { Layout, Menu, Typography, ConfigProvider } from 'antd';
import {
  ExperimentOutlined,
  BookOutlined,
  ApartmentOutlined,
  PartitionOutlined,
  DatabaseOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import '../styles/global.css';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/workspace', icon: <ExperimentOutlined />, label: '专注看板' },
  { key: '/subjects', icon: <BookOutlined />, label: '学科管理' },
  { key: '/knowledge-tree', icon: <ApartmentOutlined />, label: '知识树' },
  { key: '/knowledge-graph', icon: <PartitionOutlined />, label: '考点拓扑' },
  { key: '/questions', icon: <DatabaseOutlined />, label: '题库管理' },
  { key: '/wrong-questions', icon: <WarningOutlined />, label: '错题本' },
  { key: '/wrongbook', icon: <ExperimentOutlined />, label: '错题沙盒' },
  { key: '/review', icon: <CheckCircleOutlined />, label: '复习任务' },
  { key: '/analytics', icon: <BarChartOutlined />, label: '数据分析' },
];

const pageTitles: Record<string, string> = {
  '/workspace': '专注看板',
  '/subjects': '学科管理',
  '/knowledge-tree': '知识树',
  '/knowledge-graph': '考点拓扑',
  '/questions': '题库管理',
  '/wrong-questions': '错题本',
  '/wrongbook': '错题沙盒',
  '/review': '复习任务',
  '/analytics': '数据分析',
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentTitle = pageTitles[location.pathname] || 'CS408';

  const sidebarWidth = collapsed ? 72 : 220;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
        },
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        {/* LeetCode-style dark sidebar */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          width={220}
          collapsedWidth={72}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            background: '#1a1a2e',
            zIndex: 20,
          }}
        >
          {/* Logo area: "CS408" in teal */}
          <div
            style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Text
              strong
              style={{
                color: '#00af9b',
                fontSize: collapsed ? 18 : 22,
                letterSpacing: collapsed ? 0 : 2,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, monospace",
                userSelect: 'none',
              }}
            >
              {collapsed ? 'CS' : 'CS408'}
            </Text>
          </div>

          {/* Navigation menu */}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultSelectedKeys={['/workspace']}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              background: '#1a1a2e',
              borderRight: 'none',
              marginTop: 4,
            }}
          />
        </Sider>

        {/* Main area */}
        <Layout
          style={{
            marginLeft: sidebarWidth,
            transition: 'margin-left 0.2s ease',
            background: '#f5f5f5',
            minHeight: '100vh',
          }}
        >
          {/* Thin white header */}
          <Header
            style={{
              padding: '0 24px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              height: 52,
              lineHeight: '52px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  cursor: 'pointer',
                  fontSize: 16,
                  color: '#999',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#333')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
              >
                {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </div>
              <Text
                strong
                style={{
                  fontSize: 15,
                  color: '#1a1a2e',
                  margin: 0,
                  lineHeight: '52px',
                }}
              >
                {currentTitle}
              </Text>
            </div>
            <Text
              style={{
                color: '#ccc',
                fontSize: 12,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, monospace",
                letterSpacing: 1,
              }}
            >
              CS408
            </Text>
          </Header>

          {/* Content area: centered, white rounded card */}
          <Content
            style={{
              padding: 24,
              maxWidth: 1100,
              width: '100%',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                minHeight: 'calc(100vh - 52px - 48px)',
                padding: 24,
              }}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
