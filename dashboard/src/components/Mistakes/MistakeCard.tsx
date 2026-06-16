/* =================================================================
   错题卡片 — 重新设计的精致 UI
   ================================================================= */
import { useState } from 'react';
import { Card, Tag, Button, Space, Timeline, Typography, Tooltip } from 'antd';
import {
  EyeOutlined, EyeInvisibleOutlined, ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  DeleteOutlined, StarFilled,
} from '@ant-design/icons';
import type { Mistake } from '../../types';
import { ErrorReason } from '../../types';

const { Text } = Typography;

const REASON_COLORS: Record<string, string> = {
  [ErrorReason.CONCEPT_UNCLEAR]: 'volcano',
  [ErrorReason.CARELESS]: 'orange',
  [ErrorReason.METHOD_WRONG]: 'purple',
  [ErrorReason.TIME_INSUFFICIENT]: 'geekblue',
  [ErrorReason.OTHER]: 'default',
};

const REASON_EMOJIS: Record<string, string> = {
  [ErrorReason.CONCEPT_UNCLEAR]: '📖',
  [ErrorReason.CARELESS]: '😅',
  [ErrorReason.METHOD_WRONG]: '🛠',
  [ErrorReason.TIME_INSUFFICIENT]: '⏰',
  [ErrorReason.OTHER]: '📌',
};

interface Props {
  mistake: Mistake;
  onDelete?: (id: string) => void;
}

export default function MistakeCard({ mistake, onDelete }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);
  const lastAttempt = mistake.attempts[mistake.attempts.length - 1];

  return (
    <Card
      style={{
        marginBottom: 16,
        borderRadius: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid #f0f0f0',
        transition: 'box-shadow 0.2s',
      }}
      bodyStyle={{ padding: 20 }}
      actions={[
        <Tooltip title={showAnswer ? '隐藏答案' : '显示答案'} key="toggle">
          <Button
            type="text"
            size="small"
            icon={showAnswer ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => setShowAnswer(!showAnswer)}
            style={{ color: showAnswer ? '#2DD4BF' : '#999' }}
          >
            {showAnswer ? '隐藏解析' : '查看解析'}
          </Button>
        </Tooltip>,
        <Tooltip title="删除" key="delete">
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete?.(mistake.id)}
          >
            删除
          </Button>
        </Tooltip>,
      ]}
    >
      {/* 标签行 */}
      <Space wrap style={{ marginBottom: 12 }}>
        <Tag color="blue" style={{ borderRadius: 6, margin: 0 }}>{mistake.subjectId}</Tag>
        <Tag style={{ borderRadius: 6, margin: 0, background: '#f0f0f0', border: 'none' }}>
          {mistake.chapterId}
        </Tag>
        <Tag color="cyan" style={{ borderRadius: 6, margin: 0 }}>{mistake.knowledgePoint}</Tag>
        <Tag color={REASON_COLORS[mistake.errorReason]} style={{ borderRadius: 6, margin: 0 }}>
          {REASON_EMOJIS[mistake.errorReason]} {mistake.errorReason}
        </Tag>
        {mistake.tags.map((t) => (
          <Tag key={t} style={{ borderRadius: 6, margin: 0 }}>{t}</Tag>
        ))}
        {[1, 2, 3].map((i) => (
          <StarFilled
            key={i}
            style={{
              color: i <= mistake.importance ? '#F59E0B' : '#eee',
              fontSize: 12,
            }}
          />
        ))}
      </Space>

      {/* 题目 */}
      <div
        style={{
          fontSize: 14, lineHeight: 1.8, color: '#333',
          marginBottom: 12, whiteSpace: 'pre-wrap',
          padding: 12, background: '#fafafa', borderRadius: 10,
        }}
      >
        {mistake.question}
      </div>

      {/* 选项 */}
      {mistake.options.length > 0 && (
        <Space direction="vertical" style={{ marginBottom: 12, marginLeft: 4 }}>
          {mistake.options.map((opt, i) => (
            <Text key={i} type="secondary" style={{ fontSize: 13 }}>
              {String.fromCharCode(65 + i)}. {opt}
            </Text>
          ))}
        </Space>
      )}

      {/* 答案解析（可切换） */}
      {showAnswer && (
        <div
          style={{
            background: 'linear-gradient(135deg, #f6ffed, #f0fff4)',
            border: '1px solid #b7eb8f',
            borderRadius: 12,
            padding: '16px 18px',
            marginTop: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
            <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
              正确答案：{mistake.correctAnswer}
            </Text>
          </div>

          {lastAttempt && (
            <div style={{ marginBottom: 8, fontSize: 13 }}>
              <Text type="secondary">我的答案：</Text>
              <Text style={{ color: lastAttempt.correct ? '#52c41a' : '#ff4d4f' }}>
                {lastAttempt.userAnswer || '(未作答)'}
              </Text>
              {lastAttempt.correct ? (
                <span style={{ color: '#52c41a', marginLeft: 6 }}>✓</span>
              ) : (
                <span style={{ color: '#ff4d4f', marginLeft: 6 }}>✗</span>
              )}
            </div>
          )}

          {mistake.analysis && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>📖 解析：</Text>
              <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.7, color: '#555', whiteSpace: 'pre-wrap' }}>
                {mistake.analysis}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 作答历史 */}
      {mistake.attempts.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ClockCircleOutlined /> 作答历史（{mistake.attempts.length} 次）
          </Text>
          <Timeline
            style={{ marginTop: 8, marginBottom: 0 }}
            items={mistake.attempts.map((a) => ({
              color: a.correct ? 'green' : 'red',
              children: (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <Text style={{ fontSize: 12 }}>
                    {new Date(a.date).toLocaleDateString('zh-CN')}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {Math.floor(a.timeSpent / 60)}分
                  </Text>
                  {a.correct
                    ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  }
                  <span style={{ fontSize: 11 }}>
                    {'🟢'.repeat(a.confidence)}{'⚪'.repeat(5 - a.confidence)}
                  </span>
                </div>
              ),
            }))}
          />
        </div>
      )}

      {/* 底部元信息 */}
      <div style={{ marginTop: 12, fontSize: 12, color: '#ccc', display: 'flex', gap: 16 }}>
        <span>📅 录入于 {new Date(mistake.createdAt).toLocaleDateString('zh-CN')}</span>
        {mistake.reviewSchedule.nextReviewAt && (
          <span>🔄 下次复习：{new Date(mistake.reviewSchedule.nextReviewAt).toLocaleDateString('zh-CN')}</span>
        )}
      </div>
    </Card>
  );
}
