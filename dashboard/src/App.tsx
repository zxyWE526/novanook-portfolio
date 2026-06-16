import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import SubjectPage from './pages/SubjectPage';
import KnowledgeTreePage from './pages/KnowledgeTreePage';
import QuestionBankPage from './pages/QuestionBankPage';
import WrongQuestionPage from './pages/WrongQuestionPage';
import ReviewPage from './pages/ReviewPage';
import AnalyticsPage from './pages/AnalyticsPage';

export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff', borderRadius: 6 } }}>
      <HashRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/subjects" element={<SubjectPage />} />
            <Route path="/knowledge-tree" element={<KnowledgeTreePage />} />
            <Route path="/questions" element={<QuestionBankPage />} />
            <Route path="/wrong-questions" element={<WrongQuestionPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  );
}
