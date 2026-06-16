/* =================================================================
   四级联动选择器：科目 → 章节 → 知识点 → 错误原因
   ================================================================= */
import { useMemo } from 'react';
import { Form, Select } from 'antd';
import { useStore } from '../../store/useStore';
import { ErrorReason } from '../../types';

interface Props {
  subjectId?: string;
  chapterId?: string;
  knowledgePoint?: string;
  errorReason?: ErrorReason;
  onChange: (vals: {
    subjectId: string;
    chapterId: string;
    knowledgePoint: string;
    errorReason: ErrorReason;
  }) => void;
}

const ERROR_REASON_OPTIONS = Object.entries(ErrorReason).map(([value, label]) => ({
  value,
  label,
}));

export default function MultiTagSelector({ subjectId, chapterId, knowledgePoint, errorReason, onChange }: Props) {
  const subjects = useStore((s) => s.subjects);

  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === subjectId),
    [subjects, subjectId]
  );

  const selectedChapter = useMemo(
    () => selectedSubject?.chapters.find((c) => c.id === chapterId),
    [selectedSubject, chapterId]
  );

  const handleChange = (field: string, value: string) => {
    const next = {
      subjectId: subjectId ?? '',
      chapterId: chapterId ?? '',
      knowledgePoint: knowledgePoint ?? '',
      errorReason: errorReason ?? ErrorReason.CONCEPT_UNCLEAR,
      [field]: value,
    };
    // 切换科目时清空章节和知识点
    if (field === 'subjectId') {
      next.chapterId = '';
      next.knowledgePoint = '';
    }
    // 切换章节时清空知识点
    if (field === 'chapterId') {
      next.knowledgePoint = '';
    }
    onChange(next as any);
  };

  return (
    <>
      <Form.Item label="科目" required>
        <Select
          placeholder="选择科目"
          value={subjectId}
          onChange={(v) => handleChange('subjectId', v)}
          options={subjects.map((s) => ({ value: s.id, label: s.name }))}
        />
      </Form.Item>

      <Form.Item label="章节" required>
        <Select
          placeholder="选择章节"
          value={chapterId}
          disabled={!selectedSubject}
          onChange={(v) => handleChange('chapterId', v)}
          options={selectedSubject?.chapters.map((c) => ({ value: c.id, label: c.name })) ?? []}
        />
      </Form.Item>

      <Form.Item label="知识点" required>
        <Select
          placeholder="选择知识点"
          value={knowledgePoint}
          disabled={!selectedChapter}
          onChange={(v) => handleChange('knowledgePoint', v)}
          options={selectedChapter?.knowledgePoints.map((kp) => ({ value: kp, label: kp })) ?? []}
        />
      </Form.Item>

      <Form.Item label="错误原因" required>
        <Select
          placeholder="选择错误原因"
          value={errorReason}
          onChange={(v) => handleChange('errorReason', v)}
          options={ERROR_REASON_OPTIONS}
        />
      </Form.Item>
    </>
  );
}
