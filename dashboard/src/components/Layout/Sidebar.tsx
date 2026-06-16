/* =================================================================
   侧边栏导航
   ================================================================= */
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  BugOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '沉浸看板' },
  { key: '/mistakes',  icon: <BugOutlined />,       label: '错题复盘' },
  { key: '/exam',      icon: <FileTextOutlined />,  label: '真题模拟' },
  { key: '/settings',  icon: <SettingOutlined />,   label: '设置' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider
      width={200}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 18,
          fontFamily: "'Space Grotesk', sans-serif",
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        🎯 考研工作台
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderInlineEnd: 'none', marginTop: 8 }}
      />
    </Sider>
  );
}
