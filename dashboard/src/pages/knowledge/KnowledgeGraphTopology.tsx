import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Select, Drawer, Descriptions, Table, Tag, Button, Space, Row, Col, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CloseOutlined, NodeIndexOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { knowledgeGraph } from '../../services/graphData';
import { mockWrongQuestions, mockSubjects } from '../../services/mockData';
import type { GraphNode, GraphEdge, EdgeRelation } from '../../types/knowledgeGraph';
import type { WrongQuestion } from '../../types';

const { Title } = Typography;

// --- Constants ---
const SUBJECT_COLORS: Record<string, string> = {
  '数据结构': '#1677ff',
  '操作系统': '#52c41a',
  '计算机组成原理': '#fa8c16',
  '计算机网络': '#722ed1',
};

const SUBJECT_ID_MAP: Record<string, string> = {
  'sub-1': '数据结构',
  'sub-2': '操作系统',
  'sub-3': '计算机组成原理',
  'sub-4': '计算机网络',
};

const EDGE_RELATION_LABELS: Record<EdgeRelation, string> = {
  prerequisite: '前置依赖',
  related: '相关',
  part_of: '属于',
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  NEW: { label: '新错题', color: 'red' },
  REVIEWING: { label: '复习中', color: 'orange' },
  MASTERED: { label: '已掌握', color: 'green' },
};

// --- ECharts Graph Component ---
interface GraphChartProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
}

function GraphChart({ nodes, edges, onNodeClick }: GraphChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const chart = echarts.init(ref.current);
    chartRef.current = chart;

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current;

    const echartsNodes = nodes.map((n) => ({
      id: n.id,
      name: n.name,
      symbolSize: Math.max(20, Math.min(60, n.questionCount * 0.8)),
      itemStyle: {
        color: SUBJECT_COLORS[n.subject] || '#999',
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: true,
        fontSize: 11,
        color: '#333',
      },
      value: n.questionCount,
      category: n.subject,
    }));

    const relationColors: Record<string, string> = {
      prerequisite: '#1677ff',
      related: '#999',
      part_of: '#fa8c16',
    };

    const echartsEdges = edges.map((e) => ({
      source: e.source,
      target: e.target,
      value: e.weight,
      lineStyle: {
        width: Math.max(1, e.weight),
        color: relationColors[e.relation] || '#ccc',
        curveness: 0.2,
      },
    }));

    const categories = [...new Set(nodes.map((n) => n.subject))].map((s) => ({
      name: s,
      itemStyle: { color: SUBJECT_COLORS[s] || '#999' },
    }));

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: unknown) => {
          const p = params as { dataType: string; name: string; value?: number; data?: { category?: string } };
          if (p.dataType === 'node') {
            return `<strong>${p.name}</strong><br/>学科: ${p.data?.category || '-'}<br/>题目数: ${p.value || 0}`;
          }
          if (p.dataType === 'edge') {
            const ep = params as { data: { value?: number; lineStyle?: { color?: string } } };
            return `关联强度: ${ep.data?.value || 0}`;
          }
          return '';
        },
      },
      legend: {
        data: categories.map((c) => c.name),
        bottom: 10,
        textStyle: { fontSize: 12 },
      },
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: echartsNodes,
          links: echartsEdges,
          categories,
          roam: true,
          draggable: true,
          force: {
            repulsion: 300,
            edgeLength: [80, 200],
            gravity: 0.1,
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4,
            },
          },
          label: {
            position: 'right',
            distance: 5,
          },
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: [0, 8],
        },
      ],
    };

    chart.setOption(option, true);

    const clickHandler = (params: unknown) => {
      const p = params as { dataType: string; data?: { id?: string } };
      if (p.dataType === 'node' && p.data?.id) {
        const node = nodes.find((n) => n.id === p.data!.id);
        if (node) onNodeClick(node);
      }
    };

    chart.on('click', clickHandler);

    return () => {
      chart.off('click', clickHandler);
    };
  }, [nodes, edges, onNodeClick]);

  return <div ref={ref} style={{ width: '100%', height: 500 }} />;
}

// --- Main Component ---
const KnowledgeGraphTopology: React.FC = () => {
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // Filter nodes and edges by subject
  const filteredGraph = useMemo(() => {
    if (!subjectFilter) return knowledgeGraph;

    const filteredNodes = knowledgeGraph.nodes.filter((n) => n.subjectId === subjectFilter);
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = knowledgeGraph.edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
    );

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [subjectFilter]);

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  // Get related wrong questions for selected node
  const relatedWrongQuestions = useMemo(() => {
    if (!selectedNode) return [];
    return mockWrongQuestions.filter((wq) => {
      const q = wq.question;
      const subjectName = SUBJECT_ID_MAP[q.subjectId] || '';
      if (subjectName !== selectedNode.subject) return false;
      return q.tags.some((tag) => tag.includes(selectedNode.name) || selectedNode.name.includes(tag));
    });
  }, [selectedNode]);

  const wrongQuestionColumns: ColumnsType<WrongQuestion> = [
    {
      title: '题目',
      key: 'content',
      ellipsis: true,
      render: (_: unknown, record: WrongQuestion) => {
        const content = record.question.content;
        return content.length > 40 ? content.slice(0, 40) + '...' : content;
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 90,
      render: (_: unknown, record: WrongQuestion) => {
        const s = STATUS_MAP[record.status];
        return <Tag color={s?.color}>{s?.label}</Tag>;
      },
    },
    {
      title: '错误次数',
      dataIndex: 'wrongCount',
      width: 80,
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <Title level={4} style={{ marginBottom: 20 }}>知识图谱拓扑</Title>

      {/* Filter bar */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Space>
              <NodeIndexOutlined style={{ fontSize: 16, color: '#1677ff' }} />
              <span style={{ fontWeight: 500 }}>学科筛选:</span>
            </Space>
          </Col>
          <Col>
            <Select
              allowClear
              placeholder="全部学科"
              style={{ width: 160 }}
              value={subjectFilter}
              onChange={setSubjectFilter}
              options={mockSubjects.map((s) => ({ label: s.name, value: s.id }))}
            />
          </Col>
          <Col flex="auto" />
          <Col>
            <Space>
              {Object.entries(SUBJECT_COLORS).map(([name, color]) => (
                <Tag key={name} color={color} style={{ margin: 0 }}>{name}</Tag>
              ))}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Graph visualization */}
      <Card bordered={false}>
        <GraphChart
          nodes={filteredGraph.nodes}
          edges={filteredGraph.edges}
          onNodeClick={handleNodeClick}
        />
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#999' }}>
          点击节点查看详情 | 拖拽节点调整布局 | 滚轮缩放 | 关联节点高亮显示
        </div>
      </Card>

      {/* Node Detail Drawer */}
      <Drawer
        title={selectedNode?.name || '节点详情'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
        extra={
          <Button type="text" icon={<CloseOutlined />} onClick={() => setDrawerOpen(false)} />
        }
      >
        {selectedNode && (
          <>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="节点名称">{selectedNode.name}</Descriptions.Item>
              <Descriptions.Item label="所属学科">
                <Tag color={SUBJECT_COLORS[selectedNode.subject]}>{selectedNode.subject}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="难度等级">
                {selectedNode.difficulty}/5
              </Descriptions.Item>
              <Descriptions.Item label="题目数量">{selectedNode.questionCount}</Descriptions.Item>
              <Descriptions.Item label="错题数量">
                <span style={{ color: selectedNode.wrongCount > 5 ? '#ff4d4f' : '#333' }}>
                  {selectedNode.wrongCount}
                </span>
              </Descriptions.Item>
            </Descriptions>

            {/* Related edges */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>关联关系</div>
              {knowledgeGraph.edges
                .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                .map((e) => {
                  const otherNodeId = e.source === selectedNode.id ? e.target : e.source;
                  const otherNode = knowledgeGraph.nodes.find((n) => n.id === otherNodeId);
                  return (
                    <div key={e.id || `${e.source}-${e.target}`} style={{ marginBottom: 4 }}>
                      <Tag>{EDGE_RELATION_LABELS[e.relation]}</Tag>
                      <span style={{ fontSize: 13 }}>
                        {e.source === selectedNode.id ? '->' : '<-'} {otherNode?.name || otherNodeId}
                      </span>
                      <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
                        (权重: {e.weight})
                      </span>
                    </div>
                  );
                })}
              {knowledgeGraph.edges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id).length === 0 && (
                <div style={{ color: '#999', fontSize: 13 }}>暂无关联关系</div>
              )}
            </div>

            {/* Related wrong questions */}
            <div style={{ fontWeight: 500, marginBottom: 8 }}>
              相关错题 ({relatedWrongQuestions.length})
            </div>
            <Table<WrongQuestion>
              columns={wrongQuestionColumns}
              dataSource={relatedWrongQuestions}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: '暂无相关错题' }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default KnowledgeGraphTopology;
