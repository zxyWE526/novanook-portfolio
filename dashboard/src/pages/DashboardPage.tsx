/* =================================================================
   沉浸式专注看板（主页）
   ================================================================= */
import { useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Checkbox, Input } from 'antd';
import { useStore } from '../store/useStore';
import type { DailyFlag } from '../types';

const { Title, Text } = Typography;

function FlagItem({ flag }: { flag: DailyFlag }) {
  const toggleFlag = useStore((s) => s.toggleFlag);
  const removeFlag = useStore((s) => s.removeFlag);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 0',
        borderBottom: '1px solid #f5f5f5',
      }}
    >
      <Checkbox
        checked={flag.completed}
        onChange={() => toggleFlag(flag.id)}
        style={{
          textDecoration: flag.completed ? 'line-through' : 'none',
          color: flag.completed ? '#999' : 'inherit',
        }}
      >
        {flag.content}
      </Checkbox>
      <span
        style={{ marginLeft: 'auto', cursor: 'pointer', color: '#999', fontSize: 12 }}
        onClick={() => removeFlag(flag.id)}
      >
        ✕
      </span>
    </div>
  );
}

function TodoInput() {
  const addFlag = useStore((s) => s.addFlag);
  const [val, setVal] = useState('');

  const handleAdd = () => {
    if (!val.trim()) return;
    addFlag(val.trim());
    setVal('');
  };

  return (
    <Input.Search
      placeholder="今天要做什么？"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onSearch={handleAdd}
      enterButton="添加"
    />
  );
}

export default function DashboardPage() {
  const settings = useStore((s) => s.settings);
  const mistakes = useStore((s) => s.mistakes);
  const dailyFlags = useStore((s) => s.dailyFlags);
  const checkDailyReview = useStore((s) => s.checkDailyReview);

  const today = new Date().toISOString().slice(0, 10);
  const examDate = new Date(settings.examDate);
  const todayDate = new Date(today);
  const daysLeft = Math.ceil((examDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  const todayFlags = dailyFlags.filter((f) => f.date === today);
  const completedCount = todayFlags.filter((f) => f.completed).length;
  const progress = todayFlags.length > 0 ? Math.round((completedCount / todayFlags.length) * 100) : 0;

  const reviewIds = checkDailyReview();

  return (
    <div>
      {/* 考研倒计时 */}
      <Card style={{ textAlign: 'center', marginBottom: 24, background: 'linear-gradient(135deg, #0B1120 0%, #1E293B 100%)' }}>
        <Text style={{ color: '#94A3B8', fontSize: 14 }}>距 2026 考研</Text>
        <div style={{ fontSize: 64, fontWeight: 700, color: '#2DD4BF', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.2 }}>
          {daysLeft > 0 ? daysLeft : 0}
        </div>
        <Text style={{ color: '#94A3B8', fontSize: 14 }}>天</Text>

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: '#94A3B8' }}>待复习错题</span>}
              value={reviewIds.length}
              valueStyle={{ color: '#F59E0B' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: '#94A3B8' }}>累计错题</span>}
              value={mistakes.length}
              valueStyle={{ color: '#fff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: '#94A3B8' }}>今日目标</span>}
              value={`${settings.dailyGoalHours}h`}
              valueStyle={{ color: '#fff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: '#94A3B8' }}>完成进度</span>}
              value={`${progress}%`}
              valueStyle={{ color: progress === 100 ? '#52c41a' : '#2DD4BF' }}
            />
          </Col>
        </Row>
      </Card>

      {/* 今日 Flag + 复盘推送 */}
      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card title="📋 今日 Flag" style={{ marginBottom: 24 }}>
            <TodoInput />
            <div style={{ marginTop: 16 }}>
              {todayFlags.length === 0 ? (
                <Text type="secondary">今天还没有任务，添加一条吧</Text>
              ) : (
                todayFlags
                  .sort((a, b) => a.order - b.order)
                  .map((flag) => (
                    <FlagItem key={flag.id} flag={flag} />
                  ))
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <span>
                🔄 今日复盘
                {reviewIds.length > 0 && (
                  <span style={{ marginLeft: 8, color: '#F59E0B', fontWeight: 600 }}>
                    ({reviewIds.length} 道待复习)
                  </span>
                )}
              </span>
            }
            style={{ marginBottom: 24 }}
          >
            {reviewIds.length === 0 ? (
              <Text type="secondary">今日无待复习的错题 🎉</Text>
            ) : (
              <Text>
                你有 <Text strong style={{ color: '#F59E0B' }}>{reviewIds.length}</Text> 道错题需要今天复习，
                前往「错题复盘」模块完成复习。
              </Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
