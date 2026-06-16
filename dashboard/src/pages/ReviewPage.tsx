import React, { useState, useMemo } from 'react';
import {
  Table, Card, Row, Col, Statistic, Tag, Button, Space, Typography, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockReviewTasks, mockSubjects } from '../services/mockData';
import type { ReviewTask } from '../types';

const { Title, Paragraph } = Typography;

const ReviewPage: React.FC = () => {
  const [tasks, setTasks] = useState<ReviewTask[]>(mockReviewTasks);

  const counts = useMemo(() => ({
    pending: tasks.filter((t) => !t.completed).length,
    remembered: tasks.filter((t) => t.completed && t.result === 'remembered').length,
    forgotten: tasks.filter((t) => t.completed && t.result === 'forgotten').length,
    total: tasks.length,
  }), [tasks]);

  const incompleteTasks = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  const handleComplete = (taskId: string, result: 'remembered' | 'forgotten') => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, completed: true, result, completedAt: new Date().toISOString() }
          : t
      )
    );
    message.success(result === 'remembered' ? '已标记为"记住了"' : '已标记为"忘记了"');
  };

  const incompleteColumns: ColumnsType<ReviewTask> = [
    {
      title: '题目内容',
      key: 'content',
      ellipsis: true,
      render: (_: unknown, record: ReviewTask) => {
        const content = record.wrongQuestion.question.content;
        return content.length > 40 ? content.slice(0, 40) + '...' : content;
      },
    },
    {
      title: '学科',
      key: 'subject',
      width: 120,
      render: (_: unknown, record: ReviewTask) => {
        const s = mockSubjects.find((sub) => sub.id === record.wrongQuestion.question.subjectId);
        return s?.name ?? '-';
      },
    },
    {
      title: '错误次数',
      key: 'wrongCount',
      width: 90,
      render: (_: unknown, record: ReviewTask) => record.wrongQuestion.wrongCount,
    },
    {
      title: '到期时间',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: () => <Tag color="orange">待复习</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: ReviewTask) => (
        <Space>
          <Button
            type="primary"
            size="small"
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => handleComplete(record.id, 'remembered')}
          >
            记住了
          </Button>
          <Button
            danger
            size="small"
            onClick={() => handleComplete(record.id, 'forgotten')}
          >
            忘了
          </Button>
        </Space>
      ),
    },
  ];

  const completedColumns: ColumnsType<ReviewTask> = [
    {
      title: '题目内容',
      key: 'content',
      ellipsis: true,
      render: (_: unknown, record: ReviewTask) => {
        const content = record.wrongQuestion.question.content;
        return content.length > 40 ? content.slice(0, 40) + '...' : content;
      },
    },
    {
      title: '学科',
      key: 'subject',
      width: 120,
      render: (_: unknown, record: ReviewTask) => {
        const s = mockSubjects.find((sub) => sub.id === record.wrongQuestion.question.subjectId);
        return s?.name ?? '-';
      },
    },
    {
      title: '错误次数',
      key: 'wrongCount',
      width: 90,
      render: (_: unknown, record: ReviewTask) => record.wrongQuestion.wrongCount,
    },
    {
      title: '到期时间',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
    },
    {
      title: '结果',
      key: 'result',
      width: 100,
      render: (_: unknown, record: ReviewTask) => (
        <Tag color={record.result === 'remembered' ? 'green' : 'red'}>
          {record.result === 'remembered' ? '记住了' : '忘记了'}
        </Tag>
      ),
    },
    {
      title: '完成时间',
      key: 'completedAt',
      width: 160,
      render: (_: unknown, record: ReviewTask) =>
        record.completedAt
          ? new Date(record.completedAt).toLocaleString('zh-CN')
          : '-',
    },
    {
      title: '下次复习',
      key: 'nextReview',
      width: 130,
      render: (_: unknown, record: ReviewTask) => {
        const next = record.wrongQuestion.nextReviewAt;
        return next ? new Date(next).toLocaleDateString('zh-CN') : '-';
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>今日复习任务</Title>
        <Tag color="blue" style={{ marginLeft: 12, fontSize: 14, lineHeight: '22px' }}>
          {incompleteTasks.length}
        </Tag>
      </div>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="待完成"
              value={counts.pending}
              suffix="题"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="已完成"
              value={counts.remembered}
              suffix="题"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="忘记了"
              value={counts.forgotten}
              suffix="题"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {incompleteTasks.length > 0 && (
        <Card title="待复习" bordered={false} style={{ marginBottom: 16 }}>
          <Table<ReviewTask>
            columns={incompleteColumns}
            dataSource={incompleteTasks}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        </Card>
      )}

      <Card title="已完成" bordered={false}>
        {completedTasks.length > 0 ? (
          <Table<ReviewTask>
            columns={completedColumns}
            dataSource={completedTasks}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        ) : (
          <Paragraph type="secondary" style={{ textAlign: 'center', padding: '24px 0' }}>
            暂无已完成的复习任务
          </Paragraph>
        )}
      </Card>
    </div>
  );
};

export default ReviewPage;
