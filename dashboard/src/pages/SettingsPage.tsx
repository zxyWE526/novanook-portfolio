/* =================================================================
   设置 — 重新设计的精致 UI
   ================================================================= */
import { Card, Form, InputNumber, DatePicker, Button, message, Typography, Divider, Tag } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import { useStore } from '../store/useStore';
import dayjs from 'dayjs';

const { Text } = Typography;

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
    message.success({ content: '设置已保存 ✓', icon: <span>✅</span> });
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <SettingOutlined style={{ color: '#2DD4BF' }} />
        设置
      </div>

      <Card
        style={{
          maxWidth: 480, borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
        bodyStyle={{ padding: 28 }}
      >
        <Form
          layout="vertical"
          initialValues={{
            examDate: dayjs(settings.examDate),
            dailyGoalHours: settings.dailyGoalHours,
            targetSchool: settings.targetSchool || undefined,
            targetMajor: settings.targetMajor || undefined,
          }}
          onFinish={handleSave}
          style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
        >
          <Form.Item
            label={<span style={{ fontWeight: 500 }}>📅 考研日期</span>}
            name="examDate"
            required
          >
            <DatePicker
              style={{ width: '100%', borderRadius: 10 }}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontWeight: 500 }}>🎯 每日目标（小时）</span>}
            name="dailyGoalHours"
            required
          >
            <InputNumber
              min={1}
              max={16}
              style={{ width: '100%', borderRadius: 10 }}
              size="large"
            />
          </Form.Item>

          <Divider style={{ margin: '8px 0', fontSize: 12, color: '#ccc' }}>选填信息</Divider>

          <Form.Item label={<span style={{ fontWeight: 500 }}>🏫 目标院校</span>} name="targetSchool">
            <input
              className="ant-input"
              placeholder="例如：清华大学"
              style={{ padding: '8px 12px', borderRadius: 10 }}
            />
          </Form.Item>

          <Form.Item label={<span style={{ fontWeight: 500 }}>💻 目标专业</span>} name="targetMajor">
            <input
              className="ant-input"
              placeholder="例如：计算机技术"
              style={{ padding: '8px 12px', borderRadius: 10 }}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            style={{
              marginTop: 8, borderRadius: 10,
              background: 'linear-gradient(135deg, #2DD4BF, #5EEAD4)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(45,212,191,0.3)',
              height: 44,
            }}
          >
            保存设置
          </Button>
        </Form>
      </Card>

      {/* 数据统计 */}
      <Card
        style={{ maxWidth: 480, borderRadius: 16, marginTop: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        bodyStyle={{ padding: 20 }}
      >
        <Text style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>数据存储</Text>
        <div style={{ marginTop: 12 }}>
          <Tag style={{ borderRadius: 6, fontSize: 12 }}>
            💾 所有数据存储在浏览器本地 (LocalStorage)
          </Tag>
        </div>
        <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
          数据不会上传到任何服务器，清除浏览器缓存会丢失数据。<br />
          建议定期导出备份（功能开发中）。
        </Text>
      </Card>
    </div>
  );
}
