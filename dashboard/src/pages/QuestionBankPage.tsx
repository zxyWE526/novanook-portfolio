import React, { useState, useMemo } from 'react';
import { Table, Card, Select, Button, Tag, Drawer, Descriptions, Space, Typography } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mockQuestions, mockSubjects, knowledgePoints } from '../services/mockData';
import type { Question, QuestionDifficulty, QuestionType } from '../types';

const { Title, Paragraph } = Typography;

const difficultyMap: Record<QuestionDifficulty, { label: string; color: string }> = {
  easy: { label: '简单', color: 'green' },
  medium: { label: '中等', color: 'orange' },
  hard: { label: '困难', color: 'red' },
};

const typeMap: Record<QuestionType, string> = {
  choice: '选择题',
  fill: '填空题',
  subjective: '主观题',
};

function getKnowledgePointName(kpId: string): string {
  for (const subjectKps of Object.values(knowledgePoints)) {
    const found = subjectKps.find((kp) => kp.id === kpId);
    if (found) return found.title;
  }
  return kpId;
}

const QuestionBankPage: React.FC = () => {
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(undefined);
  const [difficultyFilter, setDifficultyFilter] = useState<string | undefined>(undefined);
  const [kpFilter, setKpFilter] = useState<string | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const filteredQuestions = useMemo(() => {
    return mockQuestions.filter((q) => {
      if (subjectFilter && q.subjectId !== subjectFilter) return false;
      if (difficultyFilter && q.difficulty !== difficultyFilter) return false;
      if (kpFilter && q.knowledgePointId !== kpFilter) return false;
      return true;
    });
  }, [subjectFilter, difficultyFilter, kpFilter]);

  // Build knowledge point options based on selected subject
  const kpOptions = useMemo(() => {
    if (!subjectFilter) {
      const all: { label: string; value: string }[] = [];
      Object.values(knowledgePoints).forEach((kps) => {
        kps.forEach((kp) => all.push({ label: kp.title, value: kp.id }));
      });
      return all;
    }
    const kps = knowledgePoints[subjectFilter] || [];
    return kps.map((kp) => ({ label: kp.title, value: kp.id }));
  }, [subjectFilter]);

  const handleView = (record: Question) => {
    setSelectedQuestion(record);
    setDrawerOpen(true);
  };

  const columns: ColumnsType<Question> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '题目内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text: string) => text.length > 40 ? text.slice(0, 40) + '...' : text,
    },
    {
      title: '学科',
      key: 'subject',
      width: 120,
      render: (_: unknown, record: Question) => {
        const s = mockSubjects.find((sub) => sub.id === record.subjectId);
        return s?.name ?? '-';
      },
    },
    {
      title: '知识点',
      key: 'knowledgePoint',
      width: 120,
      render: (_: unknown, record: Question) => getKnowledgePointName(record.knowledgePointId),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (d: QuestionDifficulty) => (
        <Tag color={difficultyMap[d].color}>{difficultyMap[d].label}</Tag>
      ),
    },
    {
      title: '题型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (t: QuestionType) => typeMap[t],
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (val: string) => new Date(val).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: Question) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>题库管理</Title>

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Space wrap>
          <span>学科:</span>
          <Select
            placeholder="全部学科"
            allowClear
            style={{ width: 160 }}
            value={subjectFilter}
            onChange={(val) => { setSubjectFilter(val); setKpFilter(undefined); }}
            options={mockSubjects.map((s) => ({ label: s.name, value: s.id }))}
          />
          <span>难度:</span>
          <Select
            placeholder="全部难度"
            allowClear
            style={{ width: 120 }}
            value={difficultyFilter}
            onChange={setDifficultyFilter}
            options={[
              { label: '简单', value: 'easy' },
              { label: '中等', value: 'medium' },
              { label: '困难', value: 'hard' },
            ]}
          />
          <span>知识点:</span>
          <Select
            placeholder="全部知识点"
            allowClear
            style={{ width: 160 }}
            value={kpFilter}
            onChange={setKpFilter}
            options={kpOptions}
          />
        </Space>
      </Card>

      <Card bordered={false}>
        <Table<Question>
          columns={columns}
          dataSource={filteredQuestions}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <Drawer
        title="题目详情"
        placement="right"
        width={560}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedQuestion && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="题目ID">{selectedQuestion.id}</Descriptions.Item>
              <Descriptions.Item label="学科">
                {mockSubjects.find((s) => s.id === selectedQuestion.subjectId)?.name ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="知识点">
                {getKnowledgePointName(selectedQuestion.knowledgePointId)}
              </Descriptions.Item>
              <Descriptions.Item label="难度">
                <Tag color={difficultyMap[selectedQuestion.difficulty].color}>
                  {difficultyMap[selectedQuestion.difficulty].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="题型">{typeMap[selectedQuestion.type]}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {new Date(selectedQuestion.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
            </Descriptions>

            <Card title="题目内容" size="small" style={{ marginTop: 16 }}>
              <Paragraph>{selectedQuestion.content}</Paragraph>
            </Card>

            {selectedQuestion.options.length > 0 && (
              <Card title="选项" size="small" style={{ marginTop: 16 }}>
                {selectedQuestion.options.map((opt, i) => (
                  <div key={i} style={{ padding: '4px 0' }}>{opt}</div>
                ))}
              </Card>
            )}

            <Card title="正确答案" size="small" style={{ marginTop: 16 }}>
              <Tag color="green" style={{ fontSize: 14, padding: '2px 12px' }}>
                {selectedQuestion.correctAnswer}
              </Tag>
            </Card>

            <Card title="解析" size="small" style={{ marginTop: 16 }}>
              <Paragraph>{selectedQuestion.analysis}</Paragraph>
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default QuestionBankPage;
