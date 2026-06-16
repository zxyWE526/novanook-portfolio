import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Progress,
  Row,
  Col,
  Statistic,
  Space,
  Radio,
  message,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CaretRightOutlined,
  PauseCircleOutlined,
  ForwardOutlined,
  CheckCircleOutlined,
  StepForwardOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { scheduler } from '../../services/scheduler';
import { mockSubjects } from '../../services/mockData';
import type { TaskPCB, TaskPriority, TaskState, SchedulerAlgorithm } from '../../types/scheduler';

const { Title } = Typography;

// --- Constants ---
const EXAM_DATE = new Date('2026-12-27');
const TOTAL_DAYS = 365;

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: '紧急',
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: 'red',
  high: 'orange',
  medium: 'blue',
  low: 'default',
};

const STATE_LABELS: Record<TaskState, string> = {
  ready: '就绪',
  running: '运行',
  blocked: '阻塞',
  completed: '完成',
  preempted: '抢占',
};

const STATE_COLORS: Record<TaskState, string> = {
  ready: 'blue',
  running: 'green',
  blocked: 'red',
  completed: 'default',
  preempted: 'orange',
};

const ALGO_LABELS: Record<SchedulerAlgorithm, string> = {
  'round-robin': '轮转',
  priority: '优先级',
  fcfs: '先来先服务',
};

const SUBJECT_OPTIONS = mockSubjects.map((s) => ({ label: s.name, value: s.name }));

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// --- Main Component ---
const WorkspaceDashboard: React.FC = () => {
  const [stateVersion, setStateVersion] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [running, setRunning] = useState(false);
  const [tickTimer, setTickTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  // Force re-render to read scheduler state
  const refresh = useCallback(() => setStateVersion((v) => v + 1), []);

  // Scheduler tick
  useEffect(() => {
    if (running) {
      const timer = setInterval(() => {
        scheduler.tick();
        refresh();
      }, 1000);
      setTickTimer(timer);
      return () => clearInterval(timer);
    }
    if (tickTimer) {
      clearInterval(tickTimer);
      setTickTimer(null);
    }
    return undefined;
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  const state = scheduler.getState();
  const queue = scheduler.getReadyQueue();
  const history = scheduler.getHistory();
  const currentTask = state.currentTask;

  // Countdown calculation
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((EXAM_DATE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const daysPassed = TOTAL_DAYS - daysRemaining;
  const progressPercent = Math.min(100, Math.round((daysPassed / TOTAL_DAYS) * 100));

  // Today stats (mock based on queue + history)
  const todayPlanned = queue.length + history.filter((t) => t.completedAt && new Date(t.completedAt).toDateString() === now.toDateString()).length;
  const todayDone = history.filter((t) => t.state === 'completed' && t.completedAt && new Date(t.completedAt).toDateString() === now.toDateString()).length;
  const todayInProgress = currentTask ? 1 : 0;
  const todayPending = queue.filter((t) => t.state === 'ready').length;

  // Handle create task
  const handleCreateTask = () => {
    form.validateFields().then((values) => {
      scheduler.createTask({
        name: values.name,
        subject: values.subject,
        priority: values.priority,
        burstTime: values.burstTime * 60,
        timeSlice: state.timeQuantum,
        timeUsed: 0,
        timeRemaining: values.burstTime * 60,
        state: 'ready' as TaskState,
        metadata: {
          questionIds: values.questionIds || [],
          difficulty: 3,
          relatedTopics: values.relatedTopics || [],
        },
      });
      form.resetFields();
      setCreateModalOpen(false);
      refresh();
      message.success('任务已创建');
    });
  };

  // Handle start scheduling
  const handleStart = () => {
    scheduler.schedule();
    setRunning(true);
    refresh();
    message.success('调度已开始');
  };

  // Handle pause
  const handlePause = () => {
    setRunning(false);
    scheduler.preempt();
    refresh();
    message.info('调度已暂停');
  };

  // Handle switch task
  const handleSwitchTask = () => {
    scheduler.preempt();
    scheduler.schedule();
    refresh();
    message.info('已切换任务');
  };

  // Handle complete current
  const handleComplete = () => {
    if (!currentTask) return;
    scheduler.complete(currentTask.pid);
    refresh();
    message.success('任务已完成');
  };

  // Handle skip current
  const handleSkip = () => {
    if (!currentTask) return;
    scheduler.preempt();
    scheduler.schedule();
    refresh();
    message.info('已跳过当前任务');
  };

  // Table columns
  const columns: ColumnsType<TaskPCB> = [
    {
      title: 'PID',
      dataIndex: 'pid',
      width: 80,
      render: (pid: string) => pid.slice(0, 6),
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '学科',
      dataIndex: 'subject',
      width: 120,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 80,
      render: (p: TaskPriority) => (
        <Tag color={PRIORITY_COLORS[p]}>{PRIORITY_LABELS[p]}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'state',
      width: 80,
      render: (s: TaskState) => (
        <Tag color={STATE_COLORS[s]}>{STATE_LABELS[s]}</Tag>
      ),
    },
    {
      title: '时间片进度',
      key: 'timeProgress',
      width: 140,
      render: (_: unknown, record: TaskPCB) => {
        const used = record.timeUsed;
        const total = record.burstTime;
        const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
        return <Progress percent={percent} size="small" />;
      },
    },
    {
      title: '已用时间',
      key: 'timeUsed',
      width: 100,
      render: (_: unknown, record: TaskPCB) => formatTime(record.timeUsed),
    },
  ];

  const allTasks = currentTask ? [currentTask, ...queue] : queue;

  return (
    <div style={{ padding: 0 }}>
      <Title level={4} style={{ marginBottom: 20 }}>工作台</Title>

      {/* Row 1: Countdown */}
      <Card
        bordered={false}
        style={{ marginBottom: 16, background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 100%)' }}
      >
        <Row align="middle" gutter={24}>
          <Col flex="auto">
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              考研倒计时
            </div>
            <div style={{ fontSize: 14, color: '#666' }}>
              距 2026 考研还剩 <strong style={{ color: '#1677ff', fontSize: 18 }}>{daysRemaining}</strong> 天
              &nbsp;|&nbsp;已过 {daysPassed} 天
              &nbsp;|&nbsp;完成度 {progressPercent}%
            </div>
          </Col>
          <Col style={{ width: 300 }}>
            <Progress
              percent={progressPercent}
              strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              format={(p) => `${daysRemaining}天`}
            />
          </Col>
        </Row>
      </Card>

      {/* Row 2: Task Scheduler */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* Left: Queue Table */}
        <Col span={14}>
          <Card
            title="任务调度队列"
            bordered={false}
            extra={
              <Space>
                <Radio.Group
                  value={state.algorithm}
                  onChange={(e) => {
                    scheduler.setAlgorithm(e.target.value);
                    refresh();
                  }}
                  size="small"
                >
                  {Object.entries(ALGO_LABELS).map(([k, v]) => (
                    <Radio.Button key={k} value={k}>{v}</Radio.Button>
                  ))}
                </Radio.Group>
                <InputNumber
                  size="small"
                  min={1}
                  max={300}
                  value={state.timeQuantum}
                  onChange={(v) => {
                    if (v) {
                      scheduler.setTimeQuantum(v);
                      refresh();
                    }
                  }}
                  addonAfter="秒"
                  style={{ width: 110 }}
                />
                <Button size="small" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                  新建任务
                </Button>
                <Button
                  size="small"
                  type="primary"
                  icon={<CaretRightOutlined />}
                  onClick={handleStart}
                  disabled={running || queue.length === 0}
                >
                  开始调度
                </Button>
                <Button
                  size="small"
                  icon={<PauseCircleOutlined />}
                  onClick={handlePause}
                  disabled={!running}
                >
                  暂停
                </Button>
                <Button
                  size="small"
                  icon={<ForwardOutlined />}
                  onClick={handleSwitchTask}
                  disabled={!currentTask}
                >
                  切换任务
                </Button>
              </Space>
            }
          >
            <Table<TaskPCB>
              columns={columns}
              dataSource={allTasks}
              rowKey="pid"
              pagination={false}
              size="small"
              rowClassName={(record) =>
                currentTask && record.pid === currentTask.pid ? 'ant-table-row-selected' : ''
              }
              locale={{ emptyText: '暂无任务，请新建任务后开始调度' }}
            />
          </Card>
        </Col>

        {/* Right: Active Task */}
        <Col span={10}>
          <Card title="当前任务" bordered={false}>
            {currentTask ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 14, color: '#999', marginBottom: 8 }}>
                  {currentTask.subject}
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
                  {currentTask.name}
                </div>
                <div
                  style={{
                    fontSize: 48,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: '#1677ff',
                    marginBottom: 16,
                  }}
                >
                  {formatTime(Math.max(0, currentTask.timeRemaining))}
                </div>
                <Progress
                  percent={currentTask.burstTime > 0 ? Math.min(100, Math.round((currentTask.timeUsed / currentTask.burstTime) * 100)) : 0}
                  strokeColor="#1677ff"
                  style={{ marginBottom: 16 }}
                />
                <Space direction="vertical" size={4} style={{ width: '100%', textAlign: 'left', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    难度: <Tag color={currentTask.metadata.difficulty >= 4 ? 'red' : currentTask.metadata.difficulty >= 3 ? 'orange' : 'blue'}>
                      {currentTask.metadata.difficulty}/5
                    </Tag>
                  </div>
                  {currentTask.metadata.relatedTopics.length > 0 && (
                    <div style={{ fontSize: 12, color: '#666' }}>
                      关联知识点: {currentTask.metadata.relatedTopics.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  )}
                </Space>
                <Space>
                  <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleComplete}>
                    完成
                  </Button>
                  <Button icon={<StepForwardOutlined />} onClick={handleSkip}>
                    跳过
                  </Button>
                </Space>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                暂无运行中的任务
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Row 3: Today Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic title="今日计划" value={todayPlanned} suffix="题" valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic title="已完成" value={todayDone} suffix="题" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic title="进行中" value={todayInProgress} suffix="题" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic title="待处理" value={todayPending} suffix="题" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      {/* Create Task Modal */}
      <Modal
        title="新建任务"
        open={createModalOpen}
        onOk={handleCreateTask}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
        }}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" initialValues={{ priority: 'medium', burstTime: 30 }}>
          <Form.Item name="name" label="任务名称" rules={[{ required: true, message: '请输入任务名称' }]}>
            <Input placeholder="例: 数据结构 - 二叉树专题" />
          </Form.Item>
          <Form.Item name="subject" label="学科" rules={[{ required: true, message: '请选择学科' }]}>
            <Select options={SUBJECT_OPTIONS} placeholder="选择学科" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="优先级">
                <Select
                  options={[
                    { label: '紧急', value: 'critical' },
                    { label: '高', value: 'high' },
                    { label: '中', value: 'medium' },
                    { label: '低', value: 'low' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="burstTime" label="预计时间(分钟)">
                <InputNumber min={1} max={480} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="questionIds" label="关联题目ID">
            <Select mode="tags" placeholder="输入题目ID后回车" />
          </Form.Item>
          <Form.Item name="relatedTopics" label="关联知识点">
            <Select mode="tags" placeholder="输入知识点后回车" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WorkspaceDashboard;
