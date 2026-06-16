/* =================================================================
   侧边栏导航 — 深色渐变 + 毛玻璃
   ================================================================= */
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  BugOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '沉浸看板' },
  { key: '/mistakes',  icon: <BugOutlined />, label: '错题复盘' },
  { key: '/settings',  icon: <SettingOutlined />, label: '设置' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider
      width={220}
      style={{
        background: 'linear-gradient(180deg, #0B1120 0%, #162044 100%)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo 区 */}
      <div
        style={{
          height: 72,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#2DD4BF',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          🎯 考研工作台
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
          专注 · 复盘 · 上岸
        </div>
      </div>

      {/* 菜单 */}
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{
          background: 'transparent',
          borderInlineEnd: 'none',
          marginTop: 12,
        }}
        theme="dark"
      />

      {/* 底部版本 */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 0,
          width: '100%',
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(255,255,255,0.15)',
        }}
      >
        v1.0
      </div>
    </Sider>
  );
}
