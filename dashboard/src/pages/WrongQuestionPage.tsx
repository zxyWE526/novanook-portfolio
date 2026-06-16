import React, { useState, useMemo } from 'react';
import {
  Table, Card, Row, Col, Statistic, Tag, Button, Space, Select, Drawer,
  Descriptions, Typography, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockWrongQuestions, mockSubjects, knowledgePoints } from '../services/mockData';
import type { WrongQuestion, WrongStatus } from '../types';

const { Title, Paragraph } = Typography;

const statusConfig: Record<WrongStatus, { label: string; color: string }> = {
  NEW: { label: '待处理', color: 'blue' },
  REVIEWING: { label: '复习中', color: 'orange' },
  MASTERED: { label: '已掌握', color: 'green' },
};

function getKnowledgePointName(kpId: string): string {
  for (const subjectKps of Object.values(knowledgePoints)) {
    const found = subjectKps.find((kp) => kp.id === kpId);
    if (found) return found.title;
  }
  return kpId;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

const WrongQuestionPage: React.FC = () => {
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>(mockWrongQuestions);
  const [statusFilter, setStatusFilter] = useState<WrongStatus | undefined>(undefined);
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedWq, setSelectedWq] = useState<WrongQuestion | null>(null);

  const counts = useMemo(() => ({
    NEW: wrongQuestions.filter((w) => w.status === 'NEW').length,
    REVIEWING: wrongQuestions.filter((w) => w.status === 'REVIEWING').length,
    MASTERED: wrongQuestions.filter((w) => w.status === 'MASTERED').length,
    TOTAL: wrongQuestions.length,
  }), [wrongQuestions]);

  const filteredData = useMemo(() => {
    return wrongQuestions.filter((w) => {
      if (statusFilter && w.status !== statusFilter) return false;
      if (subjectFilter && w.question.subjectId !== subjectFilter) return false;
      return true;
    });
  }, [wrongQuestions, statusFilter, subjectFilter]);

  const handleStatusChange = (id: string, newStatus: WrongStatus) => {
    setWrongQuestions((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: newStatus } : w))
    );
    const label = statusConfig[newStatus].label;
    message.success(`已标记为"${label}"`);
  };

  const handleViewDetail = (record: WrongQuestion) => {
    setSelectedWq(record);
    setDrawerOpen(true);
  };

  const columns: ColumnsType<WrongQuestion> = [
    {
      title: '题目内容',
      key: 'content',
      ellipsis: true,
      render: (_: unknown, record: WrongQuestion) => (
        <Button type="link" style={{ padding: 0 }} onClick={() => handleViewDetail(record)}>
          {record.question.content.length > 40
            ? record.question.content.slice(0, 40) + '...'
            : record.question.content}
        </Button>
      ),
    },
    {
      title: '学科',
      key: 'subject',
      width: 120,
      render: (_: unknown, record: WrongQuestion) => {
        const s = mockSubjects.find((sub) => sub.id === record.question.subjectId);
        return s?.name ?? '-';
      },
    },
    {
      title: '知识点',
      key: 'knowledgePoint',
      width: 120,
      render: (_: unknown, record: WrongQuestion) =>
        getKnowledgePointName(record.question.knowledgePointId),
    },
    {
      title: '错误次数',
      dataIndex: 'wrongCount',
      key: 'wrongCount',
      width: 90,
      sorter: (a, b) => a.wrongCount - b.wrongCount,
      render: (val: number) => (
        <span style={{ color: val >= 3 ? '#ff4d4f' : val >= 2 ? '#faad14' : undefined, fontWeight: val >= 3 ? 600 : undefined }}>
          {val}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: WrongStatus) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].label}</Tag>
      ),
    },
    {
      title: '最近错误时间',
      dataIndex: 'lastWrongAt',
      key: 'lastWrongAt',
      width: 130,
      render: (val: string) => formatDate(val),
    },
    {
      title: '下次复习',
      dataIndex: 'nextReviewAt',
      key: 'nextReviewAt',
      width: 120,
      render: (val: string | null) => formatDate(val),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: WrongQuestion) => (
        <Space>
          {record.status !== 'MASTERED' && (
            <Button
              type="link"
              size="small"
              style={{ color: '#52c41a' }}
              onClick={() => handleStatusChange(record.id, 'MASTERED')}
            >
              标记已掌握
            </Button>
          )}
          {record.status === 'NEW' && (
            <Button
              type="link"
              size="small"
              style={{ color: '#fa8c16' }}
              onClick={() => handleStatusChange(record.id, 'REVIEWING')}
            >
              标记复习中
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>错题管理</Title>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="待处理"
              value={counts.NEW}
              suffix="题"
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="复习中"
              value={counts.REVIEWING}
              suffix="题"
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="已掌握"
              value={counts.MASTERED}
              suffix="题"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="总计"
              value={counts.TOTAL}
              suffix="题"
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Space wrap>
          <span>状态:</span>
          <Select
            placeholder="全部状态"
            allowClear
            style={{ width: 140 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={Object.entries(statusConfig).map(([key, cfg]) => ({
              label: cfg.label,
              value: key,
            }))}
          />
          <span>学科:</span>
          <Select
            placeholder="全部学科"
            allowClear
            style={{ width: 160 }}
            value={subjectFilter}
            onChange={setSubjectFilter}
            options={mockSubjects.map((s) => ({ label: s.name, value: s.id }))}
          />
        </Space>
      </Card>

      <Card bordered={false}>
        <Table<WrongQuestion>
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <Drawer
        title="错题详情"
        placement="right"
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedWq && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="错题ID">{selectedWq.id}</Descriptions.Item>
              <Descriptions.Item label="学科">
                {mockSubjects.find((s) => s.id === selectedWq.question.subjectId)?.name ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="知识点">
                {getKnowledgePointName(selectedWq.question.knowledgePointId)}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusConfig[selectedWq.status].color}>
                  {statusConfig[selectedWq.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="错误次数">{selectedWq.wrongCount}</Descriptions.Item>
              <Descriptions.Item label="复习次数">{selectedWq.reviewCount}</Descriptions.Item>
              <Descriptions.Item label="最近错误时间">
                {new Date(selectedWq.lastWrongAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
              <Descriptions.Item label="下次复习">
                {selectedWq.nextReviewAt
                  ? new Date(selectedWq.nextReviewAt).toLocaleString('zh-CN')
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="记录时间">
                {new Date(selectedWq.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>

            <Card title="题目内容" size="small" style={{ marginTop: 16 }}>
              <Paragraph>{selectedWq.question.content}</Paragraph>
            </Card>

            {selectedWq.question.options.length > 0 && (
              <Card title="选项" size="small" style={{ marginTop: 16 }}>
                {selectedWq.question.options.map((opt, i) => (
                  <div key={i} style={{ padding: '4px 0' }}>{opt}</div>
                ))}
              </Card>
            )}

            <Card title="正确答案" size="small" style={{ marginTop: 16 }}>
              <Tag color="green" style={{ fontSize: 14, padding: '2px 12px' }}>
                {selectedWq.question.correctAnswer}
              </Tag>
            </Card>

            <Card title="解析" size="small" style={{ marginTop: 16 }}>
              <Paragraph>{selectedWq.question.analysis}</Paragraph>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default WrongQuestionPage;
