/* =================================================================
   错题复盘页面
   ================================================================= */
import { useState } from 'react';
import { Card, Button, Drawer, Space, Input, Select, Empty, Badge, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import MistakeEditor from '../components/Mistakes/MistakeEditor';
import MistakeCard from '../components/Mistakes/MistakeCard';
import { useStore } from '../store/useStore';

const { Title } = Typography;

export default function MistakesPage() {
  const mistakes = useStore((s) => s.mistakes);
  const deleteMistake = useStore((s) => s.deleteMistake);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState<string | undefined>();

  const subjects = useStore((s) => s.subjects);

  const filtered = mistakes.filter((m) => {
    if (filterSubject && m.subjectId !== filterSubject) return false;
    if (search && !m.question.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      {/* 页头 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            错题复盘
          </Title>
          <Badge
            count={mistakes.length}
            showZero
            style={{ backgroundColor: '#2DD4BF', marginTop: 4 }}
            overflowCount={999}
          >
            <span style={{ marginLeft: 8, color: '#999' }}>共录入</span>
          </Badge>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setDrawerOpen(true)}
          style={{ background: '#2DD4BF', borderColor: '#2DD4BF' }}
        >
          录入错题
        </Button>
      </div>

      {/* 筛选栏 */}
      <Space style={{ marginBottom: 16, width: '100%' }} wrap>
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索题目…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 240 }}
          allowClear
        />
        <Select
          placeholder="按科目筛选"
          value={filterSubject}
          onChange={setFilterSubject}
          allowClear
          style={{ width: 160 }}
          options={subjects.map((s) => ({ value: s.id, label: s.name }))}
        />
      </Space>

      {/* 列表 */}
      <div style={{ maxWidth: 720 }}>
        {filtered.length === 0 ? (
          <Card>
            <Empty
              description={
                mistakes.length === 0
                  ? '还没有错题，点击右上角录入第一道'
                  : '没有匹配的错题'
              }
            />
          </Card>
        ) : (
          filtered.map((m) => (
            <MistakeCard
              key={m.id}
              mistake={m}
              onDelete={(id) => deleteMistake(id)}
            />
          ))
        )}
      </div>

      {/* 录入抽屉 */}
      <Drawer
        title="录入错题"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
        destroyOnClose
      >
        <MistakeEditor onDone={() => setDrawerOpen(false)} />
      </Drawer>
    </div>
  );
}
