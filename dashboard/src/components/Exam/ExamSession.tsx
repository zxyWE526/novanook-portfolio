/* =================================================================
   真题考试会话：限时器 + 答题 + 自动判分
   ================================================================= */
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Radio, Row, Col, Typography, Progress, message, Modal } from 'antd';
import {
  ClockCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { SampleQuestion } from '../../data/sampleQuestions';
import { useStore } from '../../store/useStore';

const { Text, Title } = Typography;

interface AnswerMap {
  [qId: number]: string;
}

interface Props {
  moduleName: string;
  questions: SampleQuestion[];
  timeLimit: number; // 秒
  onFinish: (answers: AnswerMap, timeSpent: number) => void;
  onCancel: () => void;
}

export default function ExamSession({ moduleName, questions, timeLimit, onFinish, onCancel }: Props) {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [paused, setPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(Date.now());

  // 倒计时
  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          message.warning('时间到！自动交卷');
          setTimeout(() => onFinish(answers, timeLimit - prev), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused]);

  const handleSubmit = useCallback(() => {
    const answered = Object.keys(answers).length;
    const total = questions.length;
    if (answered < total) {
      Modal.confirm({
        title: `还有 ${total - answered} 道题未作答，确定交卷吗？`,
        content: '未作答的题目将计为错误。',
        okText: '交卷',
        cancelText: '继续答题',
        onOk: () => {
          const timeSpent = timeLimit - timeLeft;
          onFinish(answers, timeSpent);
        },
      });
    } else {
      const timeSpent = timeLimit - timeLeft;
      onFinish(answers, timeSpent);
    }
  }, [answers, questions.length, timeLimit, timeLeft, onFinish]);

  // 格式化时间
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = Object.keys(answers).length;
  const q = questions[currentIndex];

  return (
    <div>
      {/* 顶部状态栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Text strong>{moduleName}</Text>
            <Text type="secondary" style={{ marginLeft: 8 }}>
              {currentIndex + 1}/{questions.length}
            </Text>
          </Col>
          <Col>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 700,
                fontFamily: "'Space Grotesk', monospace",
                color: timeLeft < 60 ? '#ff4d4f' : '#2DD4BF',
              }}
            >
              <ClockCircleOutlined style={{ marginRight: 8 }} />
              {fmt(timeLeft)}
            </Text>
          </Col>
          <Col>
            <Button
              icon={paused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
              onClick={() => setPaused(!paused)}
              size="small"
            >
              {paused ? '继续' : '暂停'}
            </Button>
          </Col>
        </Row>
        <Progress
          percent={Math.round((progress / questions.length) * 100)}
          showInfo={false}
          strokeColor="#2DD4BF"
          size="small"
          style={{ marginTop: 8 }}
        />
      </Card>

      {/* 暂停遮罩 */}
      {paused && (
        <Card style={{ textAlign: 'center', padding: 60, marginBottom: 16 }}>
          <Title level={3} type="secondary">⏸ 已暂停</Title>
          <Text type="secondary">点击「继续」恢复答题</Text>
        </Card>
      )}

      {/* 题目区 */}
      {!paused && (
        <Row gutter={24}>
          {/* 题号导航 */}
          <Col xs={24} md={6}>
            <Card size="small" title="题号">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {questions.map((_, i) => (
                  <Button
                    key={i}
                    size="small"
                    type={i === currentIndex ? 'primary' : 'default'}
                    style={{
                      width: 36,
                      background: answers[questions[i].id] ? '#2DD4BF' : undefined,
                      borderColor: answers[questions[i].id] ? '#2DD4BF' : undefined,
                    }}
                    onClick={() => setCurrentIndex(i)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
            </Card>
          </Col>

          {/* 题目正文 */}
          <Col xs={24} md={18}>
            <Card
              size="small"
              title={`第 ${currentIndex + 1} 题（${q.score} 分）`}
            >
              <div style={{ marginBottom: 16, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {q.content}
              </div>

              <Radio.Group
                value={answers[q.id]}
                onChange={(e) => {
                  setAnswers({ ...answers, [q.id]: e.target.value });
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {q.options.map((opt, i) => {
                    const label = String.fromCharCode(65 + i); // A, B, C, D
                    return (
                      <Radio key={i} value={label} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #f0f0f0', marginRight: 0 }}>
                        {label}. {opt}
                      </Radio>
                    );
                  })}
                </div>
              </Radio.Group>
            </Card>
          </Col>
        </Row>
      )}

      {/* 底部操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <Button onClick={onCancel}>退出考试</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          {currentIndex > 0 && (
            <Button onClick={() => setCurrentIndex(currentIndex - 1)}>上一题</Button>
          )}
          {currentIndex < questions.length - 1 ? (
            <Button type="primary" onClick={() => setCurrentIndex(currentIndex + 1)}>
              下一题
            </Button>
          ) : null}
          <Button danger onClick={handleSubmit}>
            交卷
          </Button>
        </div>
      </div>
    </div>
  );
}
