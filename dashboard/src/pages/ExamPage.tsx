/* =================================================================
   真题模拟自测模块（占位 — 后续实现）
   ================================================================= */
import { Card, Typography, Empty } from 'antd';

const { Title } = Typography;

export default function ExamPage() {
  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>真题模拟</Title>
      <Card>
        <Empty description="真题模拟模块正在开发中，即将上线…" />
      </Card>
    </div>
  );
}
