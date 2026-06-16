/* =================================================================
   设置
   ================================================================= */
import { Card, Form, InputNumber, DatePicker, Button, message, Typography } from 'antd';
import { useStore } from '../store/useStore';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  const handleSave = (vals: any) => {
    updateSettings({
      examDate: vals.examDate.format('YYYY-MM-DD'),
      dailyGoalHours: vals.dailyGoalHours,
      targetSchool: vals.targetSchool ?? '',
      targetMajor: vals.targetMajor ?? '',
    });
    message.success('设置已保存');
  };

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>设置</Title>
      <Card style={{ maxWidth: 480 }}>
        <Form
          layout="vertical"
          initialValues={{
            examDate: dayjs(settings.examDate),
            dailyGoalHours: settings.dailyGoalHours,
            targetSchool: settings.targetSchool,
            targetMajor: settings.targetMajor,
          }}
          onFinish={handleSave}
        >
          <Form.Item label="考研日期" name="examDate" required>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="每日目标时长（小时）" name="dailyGoalHours" required>
            <InputNumber min={1} max={16} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="目标院校" name="targetSchool">
            <input className="ant-input" placeholder="选填" style={{ padding: '4px 11px' }} />
          </Form.Item>
          <Form.Item label="目标专业" name="targetMajor">
            <input className="ant-input" placeholder="选填" style={{ padding: '4px 11px' }} />
          </Form.Item>
          <Button type="primary" htmlType="submit" style={{ background: '#2DD4BF', borderColor: '#2DD4BF' }}>
            保存设置
          </Button>
        </Form>
      </Card>
    </div>
  );
}
