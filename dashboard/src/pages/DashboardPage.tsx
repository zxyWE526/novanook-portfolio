/* =================================================================
   沉浸式专注看板 — 重新设计的精致 UI
   ================================================================= */
import { useState } from 'react';
import { Card, Row, Col, Checkbox, Input, Tag, Timeline, message, Tooltip } from 'antd';
import {
  CheckCircleFilled,
  CalendarOutlined,
  AimOutlined,
  SoundOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useStore } from '../store/useStore';
import WhiteNoise from '../components/Dashboard/WhiteNoise';
import type { DailyFlag } from '../types';

/* ===== 全局样式辅助 ===== */
const sectionTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: '#1a1a2e',
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

/* ===== Flag 单条 ===== */
function FlagItem({ flag }: { flag: DailyFlag }) {
  const toggleFlag = useStore((s) => s.toggleFlag);
  const removeFlag = useStore((s) => s.removeFlag);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        borderRadius: 10,
        background: flag.completed ? 'rgba(45,212,191,0.06)' : '#fff',
        border: '1px solid',
        borderColor: flag.completed ? 'rgba(45,212,191,0.15)' : '#f0f0f0',
        transition: 'all 0.2s',
        marginBottom: 8,
      }}
    >
      <Checkbox
        checked={flag.completed}
        onChange={() => toggleFlag(flag.id)}
      />
      <span
        style={{
          flex: 1,
          fontSize: 14,
          textDecoration: flag.completed ? 'line-through' : 'none',
          color: flag.completed ? '#bbb' : '#333',
          transition: 'all 0.2s',
        }}
      >
        {flag.content}
      </span>
      {flag.completed && (
        <CheckCircleFilled style={{ color: '#2DD4BF', fontSize: 16 }} />
      )}
      <Tooltip title="删除">
        <DeleteOutlined
          style={{ color: '#ddd', cursor: 'pointer', fontSize: 13 }}
          onClick={() => removeFlag(flag.id)}
        />
      </Tooltip>
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
      placeholder="今天要完成什么？"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onSearch={handleAdd}
      enterButton="添加"
      size="middle"
    />
  );
}

/* ===== 考研关键节点 ===== */
const MILESTONES = [
  { date: '2026-09-24', label: '预报名开始', icon: '📋' },
  { date: '2026-10-05', label: '正式报名', icon: '📝' },
  { date: '2026-11-01', label: '网上确认', icon: '✅' },
  { date: '2026-12-21', label: '考研初试 🎯', icon: '🎯' },
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

  // 下一节点
  const upcoming = MILESTONES.find((m) => m.date >= today);
  const milestoneDays = upcoming
    ? Math.ceil((new Date(upcoming.date).getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div>
      {/* ===== 倒计时英雄区 ===== */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0B1120 0%, #1a1a3e 50%, #162044 100%)',
          borderRadius: 20,
          padding: '36px 40px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 装饰光晕 */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,212,191,0.08) 0%, transparent 70%)' }} />

        <Row align="middle" gutter={32}>
          {/* 倒计时大数字 */}
          <Col xs={24} md={8} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: '0.1em', marginBottom: 4 }}>
              <CalendarOutlined style={{ marginRight: 6 }} />距 2026 考研
            </div>
            <div
              style={{
                fontSize: 72, fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: '#2DD4BF', lineHeight: 1,
                textShadow: '0 0 40px rgba(45,212,191,0.3)',
              }}
            >
              {daysLeft > 0 ? daysLeft : 0}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 4 }}>天</div>
          </Col>

          {/* 四格统计 */}
          <Col xs={24} md={16} style={{ position: 'relative', zIndex: 1 }}>
            <Row gutter={[16, 16]}>
              {[
                { label: '今日待复习', value: reviewIds.length, color: '#F59E0B', icon: '🔄' },
                { label: '累计错题', value: mistakes.length, color: '#fff', icon: '📚' },
                { label: '今日目标', value: `${settings.dailyGoalHours}h`, color: '#fff', icon: '🎯' },
                { label: '完成进度', value: `${progress}%`, color: progress === 100 ? '#52c41a' : '#2DD4BF', icon: '📊' },
              ].map((item) => (
                <Col span={12} key={item.label}>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: 12,
                      padding: '14px 16px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 4 }}>
                      {item.icon} {item.label}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: item.color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.2 }}>
                      {item.value}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

        {/* 下一节点 */}
        {upcoming && milestoneDays !== null && (
          <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
            <Tag
              color="gold"
              style={{ borderRadius: 8, padding: '2px 12px', fontSize: 12 }}
            >
              📌 下一节点：{upcoming.icon} {upcoming.label}（{milestoneDays} 天后）
            </Tag>
          </div>
        )}
      </div>

      {/* ===== 内容区两栏 ===== */}
      <Row gutter={28}>
        {/* 左栏：今日 Flag */}
        <Col xs={24} lg={14}>
          <Card
            style={{
              borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              marginBottom: 28,
            }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={sectionTitle}>
              <AimOutlined style={{ color: '#2DD4BF' }} />
              今日 Flag
              {todayFlags.length > 0 && (
                <span style={{ fontSize: 13, color: '#999', fontWeight: 400 }}>
                  {completedCount}/{todayFlags.length}
                </span>
              )}
            </div>

            <TodoInput />

            {/* 进度条 */}
            {todayFlags.length > 0 && (
              <div
                style={{
                  margin: '16px 0', height: 4, borderRadius: 2,
                  background: '#f0f0f0', overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`, height: '100%',
                    background: progress === 100
                      ? 'linear-gradient(90deg, #52c41a, #73d13d)'
                      : 'linear-gradient(90deg, #2DD4BF, #5EEAD4)',
                    borderRadius: 2,
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            )}

            {/* 列表 */}
            <div style={{ marginTop: 4 }}>
              {todayFlags.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#ccc', fontSize: 14 }}>
                  今天还没有安排<br />添加一条任务开始吧 ✨
                </div>
              ) : (
                [...todayFlags]
                  .sort((a, b) => a.order - b.order)
                  .map((flag) => <FlagItem key={flag.id} flag={flag} />)
              )}
            </div>
          </Card>
        </Col>

        {/* 右栏：白噪音 + 复盘 */}
        <Col xs={24} lg={10}>
          <WhiteNoise />

          {/* 今日复盘 */}
          <Card
            style={{
              borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={sectionTitle}>
              <ReloadOutlined style={{ color: '#F59E0B' }} />
              今日复盘
              {reviewIds.length > 0 && (
                <span
                  style={{
                    background: '#F59E0B', color: '#fff',
                    borderRadius: 10, padding: '0 8px',
                    fontSize: 12, fontWeight: 600,
                    marginLeft: 4,
                  }}
                >
                  {reviewIds.length}
                </span>
              )}
            </div>

            {reviewIds.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#ccc', fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
                今日无待复习的错题
              </div>
            ) : (
              <Timeline
                style={{ marginTop: 8 }}
                items={reviewMistakes.slice(0, 6).map((m) => ({
                  color: '#F59E0B',
                  children: (
                    <div>
                      <div
                        style={{
                          fontSize: 13, color: '#333', marginBottom: 6,
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap', maxWidth: 240,
                        }}
                      >
                        {m.question.slice(0, 36)}{m.question.length > 36 ? '…' : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Tag
                          color="success"
                          style={{ cursor: 'pointer', fontSize: 11, margin: 0 }}
                          onClick={() => {
                            reviewMistake(m.id, 'remember');
                            message.success('已标记「记住了」✓');
                          }}
                        >
                          记住了
                        </Tag>
                        <Tag
                          color="error"
                          style={{ cursor: 'pointer', fontSize: 11, margin: 0 }}
                          onClick={() => {
                            reviewMistake(m.id, 'forgot');
                            message.success('已标记「忘了」，将进入下一轮');
                          }}
                        >
                          忘了
                        </Tag>
                      </div>
                    </div>
                  ),
                }))}
                pending={reviewIds.length > 6 ? `还有 ${reviewIds.length - 6} 道…` : undefined}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* ===== 考研关键节点时间线 ===== */}
      <Card
        style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginTop: 28 }}
        bodyStyle={{ padding: 24 }}
      >
        <div style={sectionTitle}>
          <CalendarOutlined style={{ color: '#2DD4BF' }} />
          考研关键节点
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {MILESTONES.map((m) => {
            const isPast = m.date < today;
            const isToday = m.date === today;
            return (
              <div
                key={m.date}
                style={{
                  flex: 1, minWidth: 140,
                  padding: 16, borderRadius: 12,
                  background: isToday ? 'rgba(45,212,191,0.08)' : isPast ? '#f9f9f9' : '#fff',
                  border: '1px solid',
                  borderColor: isToday ? '#2DD4BF' : '#f0f0f0',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{m.icon}</div>
                <div
                  style={{
                    fontSize: 13, fontWeight: 600,
                    color: isPast ? '#bbb' : '#333',
                  }}
                >
                  {m.label}
                </div>
                <div style={{ fontSize: 12, color: isPast ? '#ccc' : '#999', marginTop: 4 }}>
                  {m.date}
                  {isPast && ' ✓'}
                  {isToday && ' ← 今天！'}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
