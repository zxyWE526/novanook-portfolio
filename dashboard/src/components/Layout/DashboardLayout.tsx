/* =================================================================
   主布局：深色侧边栏 + 柔和内容区 + 页面过渡动画
   ================================================================= */
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PageTransition from './PageTransition';

const { Content } = Layout;

export default function DashboardLayout() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f6fa' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 220, background: 'transparent' }}>
        <Content style={{ padding: '32px 40px', maxWidth: 960 }}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Content>
      </Layout>
    </Layout>
  );
}
