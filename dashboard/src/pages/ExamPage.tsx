/* =================================================================
   真题模拟自测模块
   ================================================================= */
import { useState } from 'react';
import { Card, Select, InputNumber, Button, Typography, Row, Col, Statistic, Empty } from 'antd';
import { PlayCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import ExamSession from '../components/Exam/ExamSession';
import ScoreReport from '../components/Exam/ScoreReport';
import { QUESTION_BANKS } from '../data/sampleQuestions';
import type { SampleQuestion } from '../data/sampleQuestions';
import { useStore } from '../store/useStore';

const { Title, Text } = Typography;

type Phase = 'setup' | 'session' | 'report';

interface AnswerMap {
  [qId: number]: string;
}

const MODULES = [
  { value: '408', label: '408 计算机学科专业基础' },
  { value: 'english', label: '英语阅读' },
];

export default function ExamPage() {
  const examRecords = useStore((s) => s.examRecords);

  const [phase, setPhase] = useState<Phase>('setup');
  const [moduleName, setModuleName] = useState('408');
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimit, setTimeLimit] = useState(30);

  const [activeQuestions, setActiveQuestions] = useState<SampleQuestion[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [timeSpent, setTimeSpent] = useState(0);

  const handleStart = () => {
    const bank = QUESTION_BANKS[moduleName] || [];
    const shuffled = [...bank].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, bank.length));
    setActiveQuestions(selected);
    setAnswers({});
    setTimeSpent(0);
    setPhase('session');
  };

  const handleFinish = (ans: AnswerMap, spent: number) => {
    setAnswers(ans);
    setTimeSpent(spent);
    setPhase('report');
  };

  // 历史记录统计
  const totalExams = examRecords.length;
  const avgScore = examRecords.length > 0
    ? Math.round(examRecords.reduce((s, r) => s + (r.earnedScore / r.totalScore) * 100, 0) / examRecords.length)
    : 0;

  if (phase === 'session') {
    const moduleLabel = MODULES.find((m) => m.value === moduleName)?.label || moduleName;
    return (
      <ExamSession
        moduleName={moduleLabel}
        questions={activeQuestions}
        timeLimit={timeLimit * 60}
        onFinish={handleFinish}
        onCancel={() => setPhase('setup')}
      />
    );
  }

  if (phase === 'report') {
    const moduleLabel = MODULES.find((m) => m.value === moduleName)?.label || moduleName;
    return (
      <ScoreReport
        moduleName={moduleLabel}
        questions={activeQuestions}
        answers={answers}
        timeSpent={timeSpent}
        onRetry={() => setPhase('setup')}
      />
    );
  }

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card size="small">
            <Statistic
              title="累计模考"
              value={totalExams}
              prefix={<HistoryOutlined />}
              valueStyle={{ color: '#2DD4BF' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small">
            <Statistic
              title="平均正确率"
              value={avgScore}
              suffix="%"
              valueStyle={{ color: avgScore >= 70 ? '#52c41a' : '#F59E0B' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 考试配置 */}
      <Card style={{ maxWidth: 480 }}>
        <Title level={4} style={{ marginTop: 0 }}>模拟自测</Title>

        <div style={{ marginBottom: 16 }}>
          <Text style={{ display: 'block', marginBottom: 4, color: '#666' }}>选择科目</Text>
          <Select
            value={moduleName}
            onChange={setModuleName}
            style={{ width: '100%' }}
            options={MODULES}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text style={{ display: 'block', marginBottom: 4, color: '#666' }}>题目数量</Text>
          <InputNumber
            min={1}
            max={20}
            value={questionCount}
            onChange={(v) => setQuestionCount(v || 5)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <Text style={{ display: 'block', marginBottom: 4, color: '#666' }}>时限（分钟）</Text>
          <InputNumber
            min={1}
            max={180}
            value={timeLimit}
            onChange={(v) => setTimeLimit(v || 30)}
            style={{ width: '100%' }}
          />
        </div>

        <Button
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={handleStart}
          block
          style={{ background: '#2DD4BF', borderColor: '#2DD4BF' }}
        >
          开始考试
        </Button>

        <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
          题库共 {QUESTION_BANKS[moduleName]?.length || 0} 道题，将随机抽取
        </Text>
      </Card>

      {/* 最近考试记录 */}
      {examRecords.length > 0 && (
        <Card title="最近模考" size="small" style={{ marginTop: 24, maxWidth: 480 }}>
          {examRecords.slice(-5).reverse().map((r, i) => {
            const rate = r.totalScore > 0 ? Math.round((r.earnedScore / r.totalScore) * 100) : 0;
            return (
              <div
                key={r.id}
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0', borderBottom: i < 4 ? '1px solid #f5f5f5' : 'none',
                }}
              >
                <Text style={{ fontSize: 13 }}>{r.moduleName}</Text>
                <Text style={{ fontSize: 13, color: rate >= 70 ? '#52c41a' : '#F59E0B', fontWeight: 600 }}>
                  {r.earnedScore}/{r.totalScore} ({rate}%)
                </Text>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
