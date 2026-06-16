import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Card, Button, Tag, Space, Select, Timeline, Typography, Collapse, Radio } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RedoOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { keyboardEngine } from '../../services/engines/keyboardEngine';
import { renderMarkdown } from '../../services/engines/renderEngine';
import { mockWrongQuestions, mockSubjects } from '../../services/mockData';
import type { WrongQuestion, WrongStatus } from '../../types';

const { Title, Text } = Typography;

// --- Constants ---
const DIFFICULTY_MAP: Record<string, { label: string; color: string }> = {
  easy: { label: '简单', color: 'green' },
  medium: { label: '中等', color: 'orange' },
  hard: { label: '困难', color: 'red' },
};

const STATUS_MAP: Record<WrongStatus, { label: string; color: string }> = {
  NEW: { label: '新错题', color: 'red' },
  REVIEWING: { label: '复习中', color: 'orange' },
  MASTERED: { label: '已掌握', color: 'green' },
};

// --- Attempt type for local tracking ---
interface LocalAttempt {
  date: string;
  correct: boolean;
  timeSpent: number;
  confidence: number;
}

// --- Main Component ---
const WrongBookSandbox: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(undefined);
  const [difficultyFilter, setDifficultyFilter] = useState<string | undefined>(undefined);
  const [localWrongList, setLocalWrongList] = useState<WrongQuestion[]>(mockWrongQuestions);
  const [attempts, setAttempts] = useState<Map<string, LocalAttempt[]>>(new Map());
  const startTimeRef = useRef<number>(Date.now());

  // Apply filters
  const filteredList = localWrongList.filter((wq) => {
    if (subjectFilter && wq.question.subjectId !== subjectFilter) return false;
    if (difficultyFilter && wq.question.difficulty !== difficultyFilter) return false;
    return true;
  });

  const currentWQ = filteredList[currentIndex] || null;

  // Reset timer when question changes
  useEffect(() => {
    startTimeRef.current = Date.now();
    setShowAnswer(false);
    setSelectedOption(null);
  }, [currentIndex]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if in input/select
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (!showAnswer && selectedOption) {
            handleSubmitAnswer();
          } else {
            setShowAnswer((v) => !v);
          }
          break;
        case 'j':
        case 'J':
          handleNext();
          break;
        case 'k':
        case 'K':
          handlePrev();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          handleSelectOption(parseInt(e.key, 10) - 1);
          break;
        case 'r':
        case 'R':
          handleRetry();
          break;
        default:
          break;
      }
    },
    [showAnswer, selectedOption, currentIndex, filteredList.length], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const cleanups = [
      keyboardEngine.register(' ', handleKeyDown),
      keyboardEngine.register('j', handleKeyDown),
      keyboardEngine.register('k', handleKeyDown),
      keyboardEngine.register('1', handleKeyDown),
      keyboardEngine.register('2', handleKeyDown),
      keyboardEngine.register('3', handleKeyDown),
      keyboardEngine.register('4', handleKeyDown),
      keyboardEngine.register('r', handleKeyDown),
    ];
    return () => cleanups.forEach((fn) => fn());
  }, [handleKeyDown]);

  const handleNext = () => {
    if (currentIndex < filteredList.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSelectOption = (index: number) => {
    if (!currentWQ) return;
    const options = ['A', 'B', 'C', 'D'];
    if (index < options.length) {
      setSelectedOption(options[index]);
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentWQ || !selectedOption) return;
    setShowAnswer(true);
    const correct = selectedOption === currentWQ.question.correctAnswer;
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    const attempt: LocalAttempt = {
      date: new Date().toISOString(),
      correct,
      timeSpent,
      confidence: 3,
    };
    const newAttempts = new Map(attempts);
    const existing = newAttempts.get(currentWQ.id) || [];
    newAttempts.set(currentWQ.id, [...existing, attempt]);
    setAttempts(newAttempts);
  };

  const handleRetry = () => {
    setShowAnswer(false);
    setSelectedOption(null);
    startTimeRef.current = Date.now();
  };

  const getAttemptsForQuestion = (wqId: string): LocalAttempt[] => {
    return attempts.get(wqId) || [];
  };

  const renderConfidence = (confidence: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        style={{
          color: i < confidence ? '#faad14' : '#d9d9d9',
          fontSize: 14,
          marginRight: 2,
        }}
      >
        &#9733;
      </span>
    ));
  };

  if (filteredList.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={4}>错题训练场</Title>
        <Card bordered={false}>
          <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
            暂无错题数据
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      <Title level={4} style={{ marginBottom: 20 }}>错题训练场</Title>

      <Row gutter={0} style={{ minHeight: 'calc(100vh - 160px)' }}>
        {/* Left Panel - Question Display */}
        <Col span={14} style={{ paddingRight: 8 }}>
          <Card bordered={false} style={{ height: '100%' }}>
            {/* Top bar: filters + navigation */}
            <Row gutter={12} align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Select
                  allowClear
                  placeholder="学科筛选"
                  style={{ width: 130 }}
                  value={subjectFilter}
                  onChange={setSubjectFilter}
                  options={mockSubjects.map((s) => ({ label: s.name, value: s.id }))}
                />
              </Col>
              <Col>
                <Select
                  allowClear
                  placeholder="难度筛选"
                  style={{ width: 110 }}
                  value={difficultyFilter}
                  onChange={setDifficultyFilter}
                  options={[
                    { label: '简单', value: 'easy' },
                    { label: '中等', value: 'medium' },
                    { label: '困难', value: 'hard' },
                  ]}
                />
              </Col>
              <Col flex="auto" />
              <Col>
                <Space>
                  <Button
                    size="small"
                    icon={<LeftOutlined />}
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                  />
                  <Text style={{ fontSize: 13 }}>
                    第 {currentIndex + 1} / {filteredList.length} 题
                  </Text>
                  <Button
                    size="small"
                    icon={<RightOutlined />}
                    onClick={handleNext}
                    disabled={currentIndex >= filteredList.length - 1}
                  />
                </Space>
              </Col>
            </Row>

            {/* Question content */}
            {currentWQ && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <Space>
                    <Tag color={DIFFICULTY_MAP[currentWQ.question.difficulty]?.color}>
                      {DIFFICULTY_MAP[currentWQ.question.difficulty]?.label}
                    </Tag>
                    <Tag>{STATUS_MAP[currentWQ.status]?.label}</Tag>
                    <Tag>错 {currentWQ.wrongCount} 次</Tag>
                  </Space>
                </div>

                <div
                  style={{ marginBottom: 16, lineHeight: 1.8, fontSize: 15 }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(currentWQ.question.content) }}
                />

                {/* Options */}
                <div style={{ marginBottom: 16 }}>
                  {currentWQ.question.options.map((opt, idx) => {
                    const letter = ['A', 'B', 'C', 'D'][idx];
                    const isSelected = selectedOption === letter;
                    const isCorrect = showAnswer && letter === currentWQ.question.correctAnswer;
                    const isWrong = showAnswer && isSelected && letter !== currentWQ.question.correctAnswer;

                    return (
                      <div
                        key={letter}
                        onClick={() => !showAnswer && handleSelectOption(idx)}
                        style={{
                          padding: '10px 14px',
                          marginBottom: 8,
                          border: `1px solid ${isCorrect ? '#52c41a' : isWrong ? '#ff4d4f' : isSelected ? '#1677ff' : '#d9d9d9'}`,
                          borderRadius: 6,
                          cursor: showAnswer ? 'default' : 'pointer',
                          background: isCorrect ? '#f6ffed' : isWrong ? '#fff2f0' : isSelected ? '#e6f4ff' : '#fff',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Radio checked={isSelected} disabled={showAnswer} style={{ marginRight: 8 }}>
                          <strong>{letter}.</strong>
                        </Radio>
                        <span>{opt.replace(/^[A-D]\.\s*/, '')}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Answer analysis - collapsible */}
                <Collapse
                  ghost
                  items={[
                    {
                      key: 'analysis',
                      label: <span style={{ fontWeight: 500 }}>答案解析</span>,
                      children: (
                        <div
                          style={{ lineHeight: 1.8, color: '#333' }}
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdown(
                              `**正确答案:** ${currentWQ.question.correctAnswer}\n\n${currentWQ.question.analysis}`,
                            ),
                          }}
                        />
                      ),
                    },
                  ]}
                />

                {/* Textbook reference */}
                <div style={{ marginTop: 12, padding: '8px 12px', background: '#fafafa', borderRadius: 4, fontSize: 13, color: '#666' }}>
                  <BookOutlined style={{ marginRight: 6 }} />
                  关联知识点: {currentWQ.question.tags.join(' / ')}
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* Right Panel - Answer & History */}
        <Col span={10} style={{ paddingLeft: 8 }}>
          <Card bordered={false} style={{ height: '100%' }}>
            {/* Submit button */}
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  size="large"
                  onClick={showAnswer ? handleRetry : handleSubmitAnswer}
                  disabled={!showAnswer && !selectedOption}
                  icon={showAnswer ? <RedoOutlined /> : <CheckCircleOutlined />}
                >
                  {showAnswer ? '重新作答 (R)' : '提交答案 (Space)'}
                </Button>
                {!showAnswer && (
                  <Button onClick={() => setShowAnswer(true)}>
                    查看答案
                  </Button>
                )}
              </Space>
            </div>

            {/* Score result */}
            {showAnswer && selectedOption && currentWQ && (
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 16,
                  background: selectedOption === currentWQ.question.correctAnswer ? '#f6ffed' : '#fff2f0',
                  border: `1px solid ${selectedOption === currentWQ.question.correctAnswer ? '#b7eb8f' : '#ffccc7'}`,
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                  {selectedOption === currentWQ.question.correctAnswer ? (
                    <span style={{ color: '#52c41a' }}>
                      <CheckCircleOutlined style={{ marginRight: 8 }} />
                      回答正确
                    </span>
                  ) : (
                    <span style={{ color: '#ff4d4f' }}>
                      <CloseCircleOutlined style={{ marginRight: 8 }} />
                      回答错误
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  你的答案: {selectedOption} &nbsp;|&nbsp; 正确答案: {currentWQ.question.correctAnswer}
                </div>
              </div>
            )}

            {/* Keyboard hints */}
            <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f5f5f5', borderRadius: 4, fontSize: 12, color: '#999' }}>
              快捷键: Space=提交/查看答案 &nbsp; J=下一题 &nbsp; K=上一题 &nbsp; 1-4=选择选项 &nbsp; R=重新作答
            </div>

            {/* Attempt Timeline */}
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>作答记录</div>
            {currentWQ && getAttemptsForQuestion(currentWQ.id).length > 0 ? (
              <Timeline
                items={getAttemptsForQuestion(currentWQ.id).map((a) => ({
                  color: a.correct ? 'green' : 'red',
                  children: (
                    <div>
                      <div style={{ fontSize: 13 }}>
                        <Tag color={a.correct ? 'green' : 'red'} style={{ marginRight: 8 }}>
                          {a.correct ? '正确' : '错误'}
                        </Tag>
                        <span style={{ color: '#999' }}>
                          {new Date(a.date).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                        用时: {a.timeSpent}秒 &nbsp;|&nbsp; 自信度: {renderConfidence(a.confidence)}
                      </div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 30, color: '#bbb', fontSize: 13 }}>
                暂无作答记录
              </div>
            )}

            {/* Wrong question status */}
            {currentWQ && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#fafafa', borderRadius: 6 }}>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                  状态: <Tag color={STATUS_MAP[currentWQ.status]?.color}>{STATUS_MAP[currentWQ.status]?.label}</Tag>
                </div>
                <div style={{ fontSize: 13, color: '#666' }}>
                  累计错误: {currentWQ.wrongCount} 次 &nbsp;|&nbsp;
                  复习次数: {currentWQ.reviewCount} 次 &nbsp;|&nbsp;
                  最近错误: {new Date(currentWQ.lastWrongAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WrongBookSandbox;
