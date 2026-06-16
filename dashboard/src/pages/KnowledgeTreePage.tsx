import React, { useState, useMemo } from 'react';
import { Tree, Card, Select, Button, Space, Descriptions, Row, Col, Typography, Badge } from 'antd';
import { DownOutlined, RightOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { mockSubjects, knowledgePoints } from '../services/mockData';

const { Title } = Typography;

interface TreeNodeInfo {
  id: string;
  title: string;
  questionCount: number;
  level: number;
  subjectId: string;
  subjectName: string;
}

function buildTreeData(subjectId: string): DataNode[] {
  const points = knowledgePoints[subjectId] || [];
  return points.map((p) => {
    const children: DataNode[] = [];
    // Add sub-nodes based on knowledge point
    if (p.title === '线性表') {
      children.push(
        { key: `${p.id}-1`, title: '顺序表', children: [] },
        { key: `${p.id}-2`, title: '链表', children: [] },
        { key: `${p.id}-3`, title: '栈', children: [] },
        { key: `${p.id}-4`, title: '队列', children: [] },
      );
    } else if (p.title === '树与二叉树') {
      children.push(
        { key: `${p.id}-1`, title: '二叉树遍历', children: [] },
        { key: `${p.id}-2`, title: '哈夫曼树', children: [] },
        { key: `${p.id}-3`, title: '二叉排序树', children: [] },
      );
    } else if (p.title === '图') {
      children.push(
        { key: `${p.id}-1`, title: '图的存储', children: [] },
        { key: `${p.id}-2`, title: '深度优先遍历', children: [] },
        { key: `${p.id}-3`, title: '最短路径', children: [] },
      );
    } else if (p.title === '排序算法') {
      children.push(
        { key: `${p.id}-1`, title: '快速排序', children: [] },
        { key: `${p.id}-2`, title: '归并排序', children: [] },
        { key: `${p.id}-3`, title: '堆排序', children: [] },
      );
    } else if (p.title === '查找算法') {
      children.push(
        { key: `${p.id}-1`, title: '顺序查找', children: [] },
        { key: `${p.id}-2`, title: '二分查找', children: [] },
        { key: `${p.id}-3`, title: '哈希查找', children: [] },
      );
    } else if (p.title === '栈和队列') {
      children.push(
        { key: `${p.id}-1`, title: '栈的应用', children: [] },
        { key: `${p.id}-2`, title: '队列的应用', children: [] },
      );
    } else if (p.title === '进程管理') {
      children.push(
        { key: `${p.id}-1`, title: '进程状态转换', children: [] },
        { key: `${p.id}-2`, title: '进程同步', children: [] },
        { key: `${p.id}-3`, title: '死锁', children: [] },
      );
    } else if (p.title === '内存管理') {
      children.push(
        { key: `${p.id}-1`, title: '分页存储', children: [] },
        { key: `${p.id}-2`, title: '页面置换算法', children: [] },
      );
    } else if (p.title === '文件系统') {
      children.push(
        { key: `${p.id}-1`, title: '文件分配方式', children: [] },
        { key: `${p.id}-2`, title: '目录管理', children: [] },
      );
    } else if (p.title === 'CPU结构与功能') {
      children.push(
        { key: `${p.id}-1`, title: '数据通路', children: [] },
        { key: `${p.id}-2`, title: '流水线', children: [] },
      );
    } else if (p.title === '存储系统') {
      children.push(
        { key: `${p.id}-1`, title: 'Cache映射', children: [] },
        { key: `${p.id}-2`, title: '虚拟存储', children: [] },
      );
    } else if (p.title === '物理层与数据链路层') {
      children.push(
        { key: `${p.id}-1`, title: '编码与调制', children: [] },
        { key: `${p.id}-2`, title: '差错控制', children: [] },
      );
    } else if (p.title === '网络层') {
      children.push(
        { key: `${p.id}-1`, title: 'IP协议', children: [] },
        { key: `${p.id}-2`, title: '路由算法', children: [] },
      );
    } else if (p.title === '传输层') {
      children.push(
        { key: `${p.id}-1`, title: 'TCP协议', children: [] },
        { key: `${p.id}-2`, title: 'UDP协议', children: [] },
      );
    } else if (p.title === '应用层') {
      children.push(
        { key: `${p.id}-1`, title: 'HTTP协议', children: [] },
        { key: `${p.id}-2`, title: 'DNS', children: [] },
      );
    } else if (p.title === 'I/O管理') {
      children.push(
        { key: `${p.id}-1`, title: 'I/O控制方式', children: [] },
        { key: `${p.id}-2`, title: '缓冲管理', children: [] },
      );
    } else if (p.title === '指令系统') {
      children.push(
        { key: `${p.id}-1`, title: '指令格式', children: [] },
        { key: `${p.id}-2`, title: '寻址方式', children: [] },
      );
    } else if (p.title === '总线与I/O') {
      children.push(
        { key: `${p.id}-1`, title: '总线仲裁', children: [] },
        { key: `${p.id}-2`, title: 'I/O接口', children: [] },
      );
    }

    const randomCount = 20 + Math.floor(Math.random() * 80);
    return {
      key: p.id,
      title: `${p.title} (${randomCount})`,
      children: children.length > 0 ? children : undefined,
    };
  });
}

function collectNodes(nodes: DataNode[], subjectId: string, subjectName: string, level: number): TreeNodeInfo[] {
  const result: TreeNodeInfo[] = [];
  for (const node of nodes) {
    const key = String(node.key);
    const titleStr = typeof node.title === 'string' ? node.title : String(node.title);
    const match = titleStr.match(/\((\d+)\)$/);
    const count = match ? parseInt(match[1], 10) : 0;
    const cleanTitle = match ? titleStr.replace(/\s*\(\d+\)$/, '') : titleStr;
    result.push({
      id: key,
      title: cleanTitle,
      questionCount: count,
      level,
      subjectId,
      subjectName,
    });
    if (node.children) {
      result.push(...collectNodes(node.children, subjectId, subjectName, level + 1));
    }
  }
  return result;
}

const KnowledgeTreePage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('sub-1');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKey, setSelectedKey] = useState<React.Key | null>(null);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const treeData = useMemo(() => buildTreeData(selectedSubject), [selectedSubject]);
  const subject = mockSubjects.find((s) => s.id === selectedSubject);
  const allNodes = useMemo(() => collectNodes(treeData, selectedSubject, subject?.name ?? '', 1), [treeData, selectedSubject, subject]);

  const allKeys = useMemo(() => {
    const keys: React.Key[] = [];
    const extract = (nodes: DataNode[]) => {
      for (const n of nodes) {
        keys.push(n.key);
        if (n.children) extract(n.children);
      }
    };
    extract(treeData);
    return keys;
  }, [treeData]);

  const selectedNode = selectedKey ? allNodes.find((n) => n.id === String(selectedKey)) : null;

  const handleExpandAll = () => {
    setExpandedKeys(allKeys);
    setAutoExpandParent(false);
  };

  const handleCollapseAll = () => {
    setExpandedKeys([]);
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 20 }}>知识点管理</Title>

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Space>
          <span>选择学科:</span>
          <Select
            value={selectedSubject}
            onChange={(val) => {
              setSelectedSubject(val);
              setExpandedKeys([]);
              setSelectedKey(null);
            }}
            style={{ width: 200 }}
            options={mockSubjects.map((s) => ({ label: s.name, value: s.id }))}
          />
          <Button icon={<ExpandOutlined />} onClick={handleExpandAll}>全部展开</Button>
          <Button icon={<CompressOutlined />} onClick={handleCollapseAll}>全部折叠</Button>
        </Space>
      </Card>

      <Row gutter={16}>
        <Col span={14}>
          <Card bordered={false} title={`${subject?.name ?? ''} - 知识点树`}>
            <Tree
              treeData={treeData}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onExpand={(keys) => { setExpandedKeys(keys); setAutoExpandParent(false); }}
              selectedKeys={selectedKey ? [selectedKey] : []}
              onSelect={(keys) => setSelectedKey(keys[0] ?? null)}
              showLine={{ showLeafIcon: false }}
              switcherIcon={<DownOutlined />}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card bordered={false} title="知识点详情">
            {selectedNode ? (
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="知识点名称">{selectedNode.title}</Descriptions.Item>
                <Descriptions.Item label="所属学科">{selectedNode.subjectName}</Descriptions.Item>
                <Descriptions.Item label="层级">
                  {selectedNode.level === 1 ? '一级知识点' : '二级知识点'}
                </Descriptions.Item>
                <Descriptions.Item label="题目数量">
                  <Badge count={selectedNode.questionCount} showZero style={{ backgroundColor: '#1677ff' }} />
                </Descriptions.Item>
                <Descriptions.Item label="节点ID">{selectedNode.id}</Descriptions.Item>
              </Descriptions>
            ) : (
              <div style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
                请在左侧选择一个知识点查看详情
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default KnowledgeTreePage;
