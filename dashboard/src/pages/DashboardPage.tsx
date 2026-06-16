import React from 'react';
import { Row, Col, Card, Statistic, Table, Progress, Tag, Space, Typography } from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  mockDashboardStats,
  mockReviewTasks,
  mockStudyRecords,
  mockQuestions,
  mockSubjects,
} from '../services/mockData';
import type { ReviewTask, StudyRecord } from '../types';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const stats = mockDashboardStats;
  const todayTasks = mockReviewTasks.filter((t) => !t.completed);
  const recentRecords = [...mockStudyRecords].reverse().slice(0, 10);

  const taskColumns: ColumnsType<ReviewTask> = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: ReviewTask, index: number) => index + 1,
    },
    {
      title: '题目',
      key: 'content',
      render: (_: unknown, record: ReviewTask) => {
        const q = record.wrongQuestion.question;
        return q.content.length > 30 ? q.content.slice(0, 30) + '...' : q.content;
      },
    },
    {
      title: '学科',
      key: 'subject',
      width: 120,
      render: (_: unknown, record: ReviewTask) => {
        const q = record.wrongQuestion.question;
        const subject = mockSubjects.find((s) => s.id === q.subjectId);
        return subject?.name ?? '-';
      },
    },
    {
      title: '难度',
      key: 'difficulty',
      width: 80,
      render: (_: unknown, record: ReviewTask) => {
        const d = record.wrongQuestion.question.difficulty;
        const map = { easy: { label: '简单', color: 'green' }, medium: { label: '中等', color: 'orange' }, hard: { label: '困难', color: 'red' } };
        return <Tag color={map[d].color}>{map[d].label}</Tag>;
      },
    },
    {
      title: '错题次数',
      key: 'wrongCount',
      width: 90,
      render: (_: unknown, record: ReviewTask) => record.wrongQuestion.wrongCount,
    },
    {
      title: '计划日期',
      dataIndex: 'dueDate',
      width: 120,
    },
  ];

  const recordColumns: ColumnsType<StudyRecord> = [
    {
      title: '日期',
      dataIndex: 'date',
      width: 120,
    },
    {
      title: '学科',
      dataIndex: 'subjectName',
      width: 140,
    },
    {
      title: '完成题数',
      dataIndex: 'questionsDone',
      width: 90,
    },
    {
      title: '正确率',
      key: 'accuracy',
      width: 140,
      render: (_: unknown, record: StudyRecord) => {
        const rate = record.questionsDone > 0
          ? Math.round((record.correctCount / record.questionsDone) * 100)
          : 0;
        return <Progress percent={rate} size="small" strokeColor={rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : '#ff4d4f'} />;
      },
    },
    {
      title: '时长(分钟)',
      dataIndex: 'duration',
      width: 100,
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <Title level={4} style={{ marginBottom: 20 }}>工作台</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="今日刷题"
              value={stats.todayDone}
              suffix="题"
              valueStyle={{ color: '#1677ff' }}
              prefix={<CheckCircleOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="blue">
                <ArrowUpOutlined /> 较昨日 +15%
              </Tag>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="累计错题"
              value={stats.totalWrong}
              suffix="题"
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="orange">
                <ArrowDownOutlined /> 待复习 {stats.todayReview} 题
              </Tag>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="待复习"
              value={stats.todayReview}
              suffix="题"
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ClockCircleOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="red">今日截止</Tag>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="掌握率"
              value={Math.round(stats.masteryRate * 100)}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
              prefix={<TrophyOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Tag color="green">
                <ArrowUpOutlined /> 较上周 +3%
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="今日学习任务" bordered={false}>
            <Table<ReviewTask>
              columns={taskColumns}
              dataSource={todayTasks}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近学习记录" bordered={false}>
            <Table<StudyRecord>
              columns={recordColumns}
              dataSource={recentRecords}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
