/* =================================================================
   成绩报告：总分 + 逐题对错 + 历史趋势
   ================================================================= */
import { Card, Row, Col, Statistic, Table, Tag, Typography, Empty } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { SampleQuestion } from '../../data/sampleQuestions';
import { useStore } from '../../store/useStore';

const { Text, Title } = Typography;

interface AnswerMap {
  [qId: number]: string;
}

interface Props {
  moduleName: string;
  questions: SampleQuestion[];
  answers: AnswerMap;
  timeSpent: number;
  onRetry: () => void;
}

export default function ScoreReport({ moduleName, questions, answers, timeSpent, onRetry }: Props) {
  const addExamRecord = useStore((s) => s.addExamRecord);
  const examRecords = useStore((s) => s.examRecords);

  // 计算得分
  let earned = 0;
  const details = questions.map((q) => {
    const userAns = answers[q.id] || '(未作答)';
    const correct = userAns === q.correctAnswer;
    if (correct) earned += q.score;
    return { ...q, userAnswer: userAns, correct };
  });

  const totalScore = questions.reduce((s, q) => s + q.score, 0);
  const correctCount = details.filter((d) => d.correct).length;
  const minutes = Math.floor(timeSpent / 60);

  // 存入历史
  const recordId = `${Date.now()}`;
  const record = {
    moduleName,
    date: new Date().toISOString(),
    timeLimit: 0,
    timeSpent,
    questions: details.map((d) => ({
      index: d.id,
      content: d.content,
      options: d.options,
      selectedOption: answers[d.id] || null,
      correctOption: d.correctAnswer,
      correct: d.correct,
      score: d.score,
    })),
    totalScore,
    earnedScore: earned,
  };
  // 用 setTimeout 避免在 render 中直接修改 store
  setTimeout(() => addExamRecord(record), 0);

  // 历史同模块记录
  const history = examRecords.filter((r) => r.moduleName === moduleName);
  const historyData = history.map((r, i) => ({
    key: i,
    date: new Date(r.date).toLocaleDateString('zh-CN'),
    score: `${r.earnedScore}/${r.totalScore}`,
    rate: r.totalScore > 0 ? Math.round((r.earnedScore / r.totalScore) * 100) : 0,
    time: `${Math.floor(r.timeSpent / 60)}分`,
  }));

  return (
    <div>
      {/* 成绩卡片 */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div
                style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: `conic-gradient(#2DD4BF ${(earned / totalScore) * 100}%, #f0f0f0 0)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif",
                  color: '#0B1120',
                }}
              >
                {Math.round((earned / totalScore) * 100)}%
              </div>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic title="得分" value={earned} suffix={`/ ${totalScore}`} />
              </Col>
              <Col span={8}>
                <Statistic
                  title="正确率"
                  value={correctCount}
                  suffix={`/ ${questions.length}`}
                  valueStyle={{ color: '#2DD4BF' }}
                />
              </Col>
              <Col span={8}>
                <Statistic title="用时" value={minutes} suffix="分钟" />
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* 逐题详情 */}
      <Card title="逐题对错" size="small" style={{ marginBottom: 24 }}>
        {details.map((d) => (
          <div
            key={d.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 0', borderBottom: '1px solid #f5f5f5',
            }}
          >
            <div style={{ flexShrink: 0, paddingTop: 2 }}>
              {d.correct ? (
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
              ) : (
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <Text style={{ fontSize: 13 }}>{d.content}</Text>
              <div style={{ marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Tag>你的答案：{d.userAnswer}</Tag>
                <Tag color={d.correct ? 'success' : 'error'}>
                  正确答案：{d.correctAnswer}
                </Tag>
                <Tag color="default">{d.score} 分</Tag>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* 历史趋势 */}
      {historyData.length > 1 && (
        <Card title="历史成绩趋势" size="small">
          <Table
            dataSource={historyData}
            pagination={false}
            size="small"
            columns={[
              { title: '日期', dataIndex: 'date', key: 'date' },
              { title: '得分', dataIndex: 'score', key: 'score' },
              {
                title: '正确率',
                dataIndex: 'rate',
                key: 'rate',
                render: (v: number) => (
                  <span style={{ color: v >= 70 ? '#52c41a' : v >= 40 ? '#F59E0B' : '#ff4d4f' }}>
                    {v}%
                  </span>
                ),
              },
              { title: '用时', dataIndex: 'time', key: 'time' },
            ]}
          />
        </Card>
      )}

      <Button type="primary" onClick={onRetry} style={{ marginTop: 16 }}>
        再来一套
      </Button>
    </div>
  );
}
