/* =================================================================
   沉浸式专注看板（主页）
   ================================================================= */
import { useState } from 'react';
import { Card, Typography, Row, Col, Statistic, Checkbox, Input, Tag, Timeline, message } from 'antd';
import { useStore } from '../store/useStore';
import WhiteNoise from '../components/Dashboard/WhiteNoise';
import type { DailyFlag } from '../types';

const { Text } = Typography;

/* ===== Flag 单条 ===== */
function FlagItem({ flag }: { flag: DailyFlag }) {
  const toggleFlag = useStore((s) => s.toggleFlag);
  const removeFlag = useStore((s) => s.removeFlag);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center',
        padding: '8px 0', borderBottom: '1px solid #f5f5f5',
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

/* ===== Todo 输入 ===== */
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

/* ===== 里程碑数据 ===== */
const MILESTONES = [
  { date: '2026-09-24', label: '预报名开始' },
  { date: '2026-10-05', label: '正式报名开始' },
  { date: '2026-10-25', label: '报名截止' },
  { date: '2026-11-01', label: '现场/网上确认' },
  { date: '2026-12-21', label: '考研初试 🎯' },
];

/* ===== 主页面 ===== */
export default function DashboardPage() {
  const settings = useStore((s) => s.settings);
  const mistakes = useStore((s) => s.mistakes);
  const dailyFlags = useStore((s) => s.dailyFlags);
  const checkDailyReview = useStore((s) => s.checkDailyReview);
  const reviewMistake = useStore((s) => s.reviewMistake);
  const mistakes_ = useStore((s) => s.mistakes);

  const today = new Date().toISOString().slice(0, 10);
  const examDate = new Date(settings.examDate);
  const todayDate = new Date(today);
  const daysLeft = Math.ceil((examDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  const todayFlags = dailyFlags.filter((f) => f.date === today);
  const completedCount = todayFlags.filter((f) => f.completed).length;
  const progress = todayFlags.length > 0 ? Math.round((completedCount / todayFlags.length) * 100) : 0;

  const reviewIds = checkDailyReview();
  const reviewMistakes = mistakes_.filter((m) => reviewIds.includes(m.id));

  // 进度条颜色
  const barColor = progress === 100 ? '#52c41a' : progress > 50 ? '#2DD4BF' : '#F59E0B';

  // 计算下一里程碑
  const upcomingMilestone = MILESTONES.find((m) => m.date >= today);
  const todayObj = new Date(today);
  const milestoneDays = upcomingMilestone
    ? Math.ceil((new Date(upcomingMilestone.date).getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div>
      {/* ===== 考研倒计时 ===== */}
      <Card style={{ textAlign: 'center', marginBottom: 24, background: 'linear-gradient(135deg, #0B1120 0%, #1E293B 100%)' }}>
        {/* 大号倒计时 */}
        <Text style={{ color: '#94A3B8', fontSize: 14 }}>距 2026 考研</Text>
        <div style={{ fontSize: 64, fontWeight: 700, color: '#2DD4BF', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.2 }}>
          {daysLeft > 0 ? daysLeft : 0}
        </div>
        <Text style={{ color: '#94A3B8', fontSize: 14 }}>天</Text>

        {/* 下一关键节点 */}
        {upcomingMilestone && (
          <div style={{ marginTop: 8 }}>
            <Tag color="gold" style={{ fontSize: 12 }}>
              📌 下一节点：{upcomingMilestone.label}（{milestoneDays} 天后）
            </Tag>
          </div>
        )}

        {/* 四格统计 */}
        <Row gutter={16} style={{ marginTop: 20 }}>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: '#94A3B8', fontSize: 12 }}>待复习</span>}
              value={reviewIds.length}
              valueStyle={{ color: '#F59E0B', fontSize: 24 }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: '#94A3B8', fontSize: 12 }}>累计错题</span>}
              value={mistakes.length}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: '#94A3B8', fontSize: 12 }}>今日目标</span>}
              value={`${settings.dailyGoalHours}h`}
              valueStyle={{ color: '#fff', fontSize: 24 }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<span style={{ color: '#94A3B8', fontSize: 12 }}>完成进度</span>}
              value={`${progress}%`}
              valueStyle={{ color: barColor, fontSize: 24 }}
            />
          </Col>
        </Row>
      </Card>

      {/* ===== 第二行：Flag + 白噪音 ===== */}
      <Row gutter={24}>
        <Col xs={24} lg={12}>
          {/* 今日 Flag */}
          <Card title="📋 今日 Flag" style={{ marginBottom: 24 }}>
            <TodoInput />
            {todayFlags.length > 0 && (
              <div
                style={{
                  marginTop: 12, height: 6, borderRadius: 3,
                  background: '#f0f0f0', overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`, height: '100%',
                    background: barColor, borderRadius: 3,
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              {todayFlags.length === 0 ? (
                <Text type="secondary">今天还没有任务，添加一条吧</Text>
              ) : (
                [...todayFlags]
                  .sort((a, b) => a.order - b.order)
                  .map((flag) => <FlagItem key={flag.id} flag={flag} />)
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {/* 白噪音 */}
          <WhiteNoise />

          {/* 今日复盘 */}
          <Card
            title={
              <span>
                🔄 今日复盘
                {reviewIds.length > 0 && (
                  <span style={{ marginLeft: 8, color: '#F59E0B', fontWeight: 600 }}>
                    ({reviewIds.length})
                  </span>
                )}
              </span>
            }
          >
            {reviewIds.length === 0 ? (
              <Text type="secondary">今日无待复习的错题 🎉</Text>
            ) : (
              <div>
                <Text style={{ display: 'block', marginBottom: 12 }}>
                  以下 <Text strong style={{ color: '#F59E0B' }}>{reviewIds.length}</Text> 道错题需要今天复习：
                </Text>
                <Timeline
                  items={reviewMistakes.slice(0, 5).map((m) => ({
                    color: '#F59E0B',
                    children: (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text
                          style={{
                            fontSize: 13, flex: 1,
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap', maxWidth: 200,
                          }}
                        >
                          {m.question.slice(0, 40)}
                          {m.question.length > 40 ? '…' : ''}
                        </Text>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <Tag
                            color="success"
                            style={{ cursor: 'pointer', fontSize: 11 }}
                            onClick={() => {
                              reviewMistake(m.id, 'remember');
                              message.success('已标记为「记住了」');
                            }}
                          >
                            ✓ 记住了
                          </Tag>
                          <Tag
                            color="error"
                            style={{ cursor: 'pointer', fontSize: 11 }}
                            onClick={() => {
                              reviewMistake(m.id, 'forgot');
                              message.success('已标记「忘了」，将加入下一轮复习');
                            }}
                          >
                            ✗ 忘了
                          </Tag>
                        </div>
                      </div>
                    ),
                  }))}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* ===== 里程碑时间线 ===== */}
      <Card title="📅 考研关键节点" size="small" style={{ marginTop: 24 }}>
        <Timeline
          items={MILESTONES.map((m) => {
            const isPast = m.date < today;
            const isToday = m.date === today;
            return {
              color: isToday ? 'red' : isPast ? 'green' : 'gray',
              children: (
                <span>
                  <Text strong={isToday} style={{ color: isPast ? '#999' : undefined }}>
                    {m.label}
                  </Text>
                  <Text type="secondary" style={{ marginLeft: 12, fontSize: 12 }}>
                    {m.date}{isPast ? ' ✓' : isToday ? ' ← 就是今天！' : ''}
                  </Text>
                </span>
              ),
            };
          })}
        />
      </Card>
    </div>
  );
}
