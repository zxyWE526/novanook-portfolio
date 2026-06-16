/* =================================================================
   主布局：深色侧边栏 + 柔和内容区
   ================================================================= */
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const { Content } = Layout;

export default function DashboardLayout() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 220, background: 'transparent' }}>
        <Content
          style={{
            padding: '32px 40px',
            minHeight: '100vh',
            maxWidth: 960,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
