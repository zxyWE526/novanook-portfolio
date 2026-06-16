import React, { useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, Progress, Popconfirm, Space, message, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mockSubjects } from '../services/mockData';
import type { Subject } from '../types';

const { Title } = Typography;

const SubjectPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingSubject(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: Subject) => {
    setEditingSubject(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      description: record.description,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    message.success('删除成功');
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingSubject) {
        setSubjects((prev) =>
          prev.map((s) =>
            s.id === editingSubject.id
              ? { ...s, name: values.name, code: values.code, description: values.description }
              : s
          )
        );
        message.success('编辑成功');
      } else {
        const newSubject: Subject = {
          id: `sub-${Date.now()}`,
          name: values.name,
          code: values.code,
          questionCount: 0,
          correctRate: 0,
          description: values.description || '',
          createdAt: new Date().toISOString(),
        };
        setSubjects((prev) => [...prev, newSubject]);
        message.success('新增成功');
      }
      setModalOpen(false);
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  const columns: ColumnsType<Subject> = [
    {
      title: '学科名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '学科代码',
      dataIndex: 'code',
      key: 'code',
      width: 130,
    },
    {
      title: '题目数量',
      dataIndex: 'questionCount',
      key: 'questionCount',
      width: 100,
      sorter: (a, b) => a.questionCount - b.questionCount,
    },
    {
      title: '正确率',
      dataIndex: 'correctRate',
      key: 'correctRate',
      width: 180,
      sorter: (a, b) => a.correctRate - b.correctRate,
      render: (rate: number) => (
        <Progress
          percent={Math.round(rate * 100)}
          size="small"
          strokeColor={rate >= 0.8 ? '#52c41a' : rate >= 0.6 ? '#faad14' : '#ff4d4f'}
        />
      ),
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
      width: 140,
      render: (_: unknown, record: Subject) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该学科?" onConfirm={() => handleDelete(record.id)} okText="确认" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>学科管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增学科
        </Button>
      </div>

      <Card bordered={false}>
        <Table<Subject>
          columns={columns}
          dataSource={subjects}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingSubject ? '编辑学科' : '新增学科'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="学科名称"
            rules={[{ required: true, message: '请输入学科名称' }]}
          >
            <Input placeholder="请输入学科名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="学科代码"
            rules={[{ required: true, message: '请输入学科代码' }]}
          >
            <Input placeholder="请输入学科代码" />
          </Form.Item>
          <Form.Item name="description" label="学科描述">
            <Input.TextArea rows={3} placeholder="请输入学科描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubjectPage;
