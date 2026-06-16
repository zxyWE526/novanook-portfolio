/* =================================================================
   错题录入/编辑表单
   ================================================================= */
import { useState } from 'react';
import { Form, Input, Select, Button, Radio, Space, message } from 'antd';
import MultiTagSelector from './MultiTagSelector';
import { useStore } from '../../store/useStore';
import { ErrorReason } from '../../types';
import type { QuestionType } from '../../types';

const { TextArea } = Input;

interface TagValues {
  subjectId: string;
  chapterId: string;
  knowledgePoint: string;
  errorReason: ErrorReason;
}

const initTags: TagValues = {
  subjectId: '',
  chapterId: '',
  knowledgePoint: '',
  errorReason: ErrorReason.CONCEPT_UNCLEAR,
};

export default function MistakeEditor({ onDone }: { onDone?: () => void }) {
  const addMistake = useStore((s) => s.addMistake);
  const [form] = Form.useForm();
  const [tags, setTags] = useState<TagValues>(initTags);
  const [questionType, setQuestionType] = useState<QuestionType>('choice');

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    if (!tags.subjectId || !tags.chapterId || !tags.knowledgePoint) {
      message.error('请完整选择科目、章节和知识点');
      return;
    }
    if (!values.question?.trim()) {
      message.error('请输入题目内容');
      return;
    }

    addMistake({
      subjectId: tags.subjectId,
      chapterId: tags.chapterId,
      knowledgePoint: tags.knowledgePoint,
      errorReason: tags.errorReason,
      questionType,
      question: values.question,
      options: values.options ? values.options.split('\n').filter(Boolean) : [],
      correctAnswer: values.correctAnswer ?? '',
      analysis: values.analysis ?? '',
      tags: values.tags ?? [],
      importance: values.importance ?? 2,
    });

    message.success('错题已录入');
    form.resetFields();
    setTags(initTags);
    onDone?.();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ maxWidth: 720 }}
    >
      {/* 多维标签 */}
      <MultiTagSelector
        subjectId={tags.subjectId}
        chapterId={tags.chapterId}
        knowledgePoint={tags.knowledgePoint}
        errorReason={tags.errorReason}
        onChange={setTags}
      />

      {/* 题型 */}
      <Form.Item label="题型" required>
        <Radio.Group
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value)}
        >
          <Radio value="choice">选择题</Radio>
          <Radio value="fill">填空题</Radio>
          <Radio value="subjective">主观题</Radio>
        </Radio.Group>
      </Form.Item>

      {/* 题目内容 */}
      <Form.Item label="题目内容" name="question" required>
        <TextArea rows={4} placeholder="录入题目（支持 Markdown 格式）" />
      </Form.Item>

      {/* 选项（仅选择题） */}
      {questionType === 'choice' && (
        <Form.Item label="选项" name="options">
          <TextArea rows={4} placeholder="每行一个选项&#10;A. xxx&#10;B. xxx&#10;C. xxx&#10;D. xxx" />
        </Form.Item>
      )}

      {/* 正确答案 */}
      <Form.Item label="正确答案" name="correctAnswer" required>
        <Input placeholder="填写正确答案" />
      </Form.Item>

      {/* 解析 */}
      <Form.Item label="题目解析" name="analysis">
        <TextArea rows={3} placeholder="解题思路、知识点链接等" />
      </Form.Item>

      {/* 重要程度 */}
      <Form.Item label="重要程度" name="importance" initialValue={2}>
        <Select
          options={[
            { value: 1, label: '⭐ 一般' },
            { value: 2, label: '⭐⭐ 重要' },
            { value: 3, label: '⭐⭐⭐ 核心' },
          ]}
        />
      </Form.Item>

      {/* 自定义标签 */}
      <Form.Item label="自定义标签" name="tags">
        <Select
          mode="tags"
          placeholder="输入标签后回车"
          options={[]}
        />
      </Form.Item>

      <Space>
        <Button type="primary" htmlType="submit">
          录入错题
        </Button>
        <Button onClick={() => { form.resetFields(); setTags(initTags); }}>
          重置
        </Button>
      </Space>
    </Form>
  );
}
