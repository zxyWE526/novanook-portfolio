/* =================================================================
   主布局：侧边栏 + 内容区
   ================================================================= */
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const { Content } = Layout;

export default function DashboardLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 200 }}>
        <Content style={{ padding: 32, background: '#f5f5f5', minHeight: '100vh' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
