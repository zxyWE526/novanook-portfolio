/* =================================================================
   应用入口：路由配置
   ================================================================= */
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import DashboardLayout from './components/Layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import MistakesPage from './pages/MistakesPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2DD4BF',
          fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
          borderRadius: 12,
        },
      }}
    >
      <HashRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/mistakes" element={<MistakesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
}
