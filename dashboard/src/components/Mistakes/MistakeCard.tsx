/* =================================================================
   错题卡片：显示题目 + 一键显隐答案 + 作答历史
   ================================================================= */
import { useState } from 'react';
import { Card, Tag, Button, Space, Timeline, Typography, Tooltip } from 'antd';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { Mistake } from '../../types';
import { ErrorReason } from '../../types';

const { Text, Paragraph } = Typography;

const ERROR_REASON_COLORS: Record<string, string> = {
  [ErrorReason.CONCEPT_UNCLEAR]: 'volcano',
  [ErrorReason.CARELESS]: 'orange',
  [ErrorReason.METHOD_WRONG]: 'purple',
  [ErrorReason.TIME_INSUFFICIENT]: 'geekblue',
  [ErrorReason.OTHER]: 'default',
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
      size="small"
      style={{ marginBottom: 16 }}
      actions={[
        <Tooltip title={showAnswer ? '隐藏答案' : '显示答案'} key="toggle">
          <Button
            type="text"
            icon={showAnswer ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => setShowAnswer(!showAnswer)}
          />
        </Tooltip>,
        <Tooltip title="删除" key="delete">
          <Button type="text" danger onClick={() => onDelete?.(mistake.id)}>
            删除
          </Button>
        </Tooltip>,
      ]}
    >
      {/* 标签行 */}
      <Space wrap style={{ marginBottom: 12 }}>
        <Tag color="blue">{mistake.subjectId}</Tag>
        <Tag>{mistake.chapterId}</Tag>
        <Tag color="cyan">{mistake.knowledgePoint}</Tag>
        <Tag color={ERROR_REASON_COLORS[mistake.errorReason]}>
          {mistake.errorReason}
        </Tag>
        {mistake.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
        <Tag color={mistake.importance === 3 ? 'red' : mistake.importance === 2 ? 'gold' : 'default'}>
          {'⭐'.repeat(mistake.importance)}
        </Tag>
      </Space>

      {/* 题目 */}
      <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 12 }}>
        {mistake.question}
      </Paragraph>

      {/* 选项 */}
      {mistake.options.length > 0 && (
        <Space direction="vertical" style={{ marginBottom: 8 }}>
          {mistake.options.map((opt, i) => (
            <Text key={i} type="secondary">{opt}</Text>
          ))}
        </Space>
      )}

      {/* 答案区域（可切换显隐） */}
      {showAnswer && (
        <div
          style={{
            background: '#f6ffed',
            border: '1px solid #b7eb8f',
            borderRadius: 6,
            padding: '12px 16px',
            marginTop: 8,
          }}
        >
          <Text strong style={{ color: '#52c41a' }}>
            ✅ 正确答案：{mistake.correctAnswer}
          </Text>

          {lastAttempt && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                我的答案：{lastAttempt.userAnswer || '(未作答)'}
              </Text>
              <span style={{ marginLeft: 8 }}>
                {lastAttempt.correct ? (
                  <Text type="success">✓ 正确</Text>
                ) : (
                  <Text type="danger">✗ 错误</Text>
                )}
              </span>
            </div>
          )}

          {mistake.analysis && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">📖 解析：</Text>
              <Paragraph style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>
                {mistake.analysis}
              </Paragraph>
            </div>
          )}
        </div>
      )}

      {/* 作答历史 */}
      {mistake.attempts.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            作答历史（{mistake.attempts.length} 次）：
          </Text>
          <Timeline
            style={{ marginTop: 8 }}
            items={mistake.attempts.map((a) => ({
              color: a.correct ? 'green' : 'red',
              children: (
                <>
                  <Text style={{ fontSize: 12 }}>
                    {new Date(a.date).toLocaleDateString('zh-CN')} · 用时 {Math.floor(a.timeSpent / 60)}分
                  </Text>
                  {a.correct ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', marginLeft: 6 }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f', marginLeft: 6 }} />
                  )}
                  <span style={{ marginLeft: 6 }}>
                    {'🟢'.repeat(a.confidence)}{'⚪'.repeat(5 - a.confidence)}
                  </span>
                </>
              ),
            }))}
          />
        </div>
      )}

      {/* 艾宾浩斯状态 */}
      <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
        <ClockCircleOutlined style={{ marginRight: 4 }} />
        录入于 {new Date(mistake.createdAt).toLocaleDateString('zh-CN')}
        {mistake.reviewSchedule.nextReviewAt && (
          <span style={{ marginLeft: 12 }}>
            下次复习：{new Date(mistake.reviewSchedule.nextReviewAt).toLocaleDateString('zh-CN')}
          </span>
        )}
      </div>
    </Card>
  );
}
