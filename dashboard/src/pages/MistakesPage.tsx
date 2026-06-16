/* =================================================================
   错题复盘 — 重新设计的精致 UI
   ================================================================= */
import { useState } from 'react';
import { Card, Button, Drawer, Space, Input, Select, Empty, Typography, Tag, Badge } from 'antd';
import { PlusOutlined, SearchOutlined, BugOutlined, FilterOutlined } from '@ant-design/icons';
import MistakeEditor from '../components/Mistakes/MistakeEditor';
import MistakeCard from '../components/Mistakes/MistakeCard';
import { useStore } from '../store/useStore';

const { Text } = Typography;

export default function MistakesPage() {
  const mistakes = useStore((s) => s.mistakes);
  const deleteMistake = useStore((s) => s.deleteMistake);
  const subjects = useStore((s) => s.subjects);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState<string | undefined>();
  const [filterImportance, setFilterImportance] = useState<number | undefined>();

  const filtered = mistakes.filter((m) => {
    if (filterSubject && m.subjectId !== filterSubject) return false;
    if (filterImportance && m.importance !== filterImportance) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.question.toLowerCase().includes(q) &&
          !m.knowledgePoint.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // 按科目分组统计
  const subjectStats = subjects.map((s) => ({
    name: s.name,
    count: mistakes.filter((m) => m.subjectId === s.id).length,
  }));

  return (
    <div>
      {/* 页头 */}
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 24, flexWrap: 'wrap', gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BugOutlined style={{ color: '#2DD4BF' }} />
            错题复盘
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {subjectStats.map((s) => (
              <Tag key={s.name} style={{ borderRadius: 6, fontSize: 12 }}>
                {s.name} <span style={{ color: '#2DD4BF', fontWeight: 600 }}>{s.count}</span>
              </Tag>
            ))}
            <Tag style={{ borderRadius: 6, background: '#2DD4BF', color: '#fff', border: 'none', fontSize: 12 }}>
              共 {mistakes.length} 题
            </Tag>
          </div>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setDrawerOpen(true)}
          style={{
            height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #2DD4BF, #5EEAD4)',
            border: 'none', boxShadow: '0 4px 12px rgba(45,212,191,0.3)',
          }}
        >
          录入错题
        </Button>
      </div>

      {/* 筛选栏 */}
      <div
        style={{
          display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Input
          prefix={<SearchOutlined style={{ color: '#bbb' }} />}
          placeholder="搜索题目或知识点…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 240, borderRadius: 10 }}
          allowClear
        />
        <Select
          placeholder="全部科目"
          value={filterSubject}
          onChange={setFilterSubject}
          allowClear
          style={{ width: 140, borderRadius: 10 }}
          options={subjects.map((s) => ({ value: s.id, label: s.name }))}
        />
        <Select
          placeholder="重要程度"
          value={filterImportance}
          onChange={setFilterImportance}
          allowClear
          style={{ width: 120, borderRadius: 10 }}
          options={[
            { value: 1, label: '⭐ 一般' },
            { value: 2, label: '⭐⭐ 重要' },
            { value: 3, label: '⭐⭐⭐ 核心' },
          ]}
        />
      </div>

      {/* 列表 */}
      <div style={{ maxWidth: 720 }}>
        {filtered.length === 0 ? (
          <Card
            style={{ borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
            bodyStyle={{ padding: 60 }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                mistakes.length === 0
                  ? '还没有错题，点击右上角录入第一道'
                  : '没有匹配的错题，试试调整筛选条件'
              }
            />
          </Card>
        ) : (
          filtered.map((m) => (
            <MistakeCard key={m.id} mistake={m} onDelete={deleteMistake} />
          ))
        )}
      </div>

      {/* 录入抽屉 */}
      <Drawer
        title={
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            <PlusOutlined style={{ color: '#2DD4BF', marginRight: 8 }} />
            录入错题
          </span>
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
        destroyOnClose
        styles={{ body: { padding: 24 } }}
      >
        <MistakeEditor onDone={() => setDrawerOpen(false)} />
      </Drawer>
    </div>
  );
}
