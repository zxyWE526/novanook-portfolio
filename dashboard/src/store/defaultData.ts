/* =================================================================
   默认数据：科目结构 + 初始状态
   ================================================================= */

import type { Subject, Settings } from '../types';

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'math-1',
    name: '数学一',
    chapters: [
      {
        id: 'math-1-calc',
        name: '高等数学',
        knowledgePoints: ['极限', '导数', '积分', '微分方程', '级数', '多元函数'],
      },
      {
        id: 'math-1-linear',
        name: '线性代数',
        knowledgePoints: ['行列式', '矩阵', '向量', '方程组', '特征值与特征向量'],
      },
      {
        id: 'math-1-prob',
        name: '概率论与数理统计',
        knowledgePoints: ['概率与分布', '大数定律', '参数估计', '假设检验'],
      },
    ],
  },
  {
    id: 'english',
    name: '英语',
    chapters: [
      {
        id: 'english-reading',
        name: '阅读理解',
        knowledgePoints: ['主旨题', '细节题', '推断题', '语义题', '态度题'],
      },
      {
        id: 'english-new-type',
        name: '新题型',
        knowledgePoints: ['七选五', '排序题', '小标题'],
      },
      {
        id: 'english-translation',
        name: '翻译',
        knowledgePoints: ['长难句', '定语从句', '被动语态'],
      },
      {
        id: 'english-writing',
        name: '写作',
        knowledgePoints: ['大作文', '小作文'],
      },
    ],
  },
  {
    id: 'politics',
    name: '政治',
    chapters: [
      { id: 'politics-marx', name: '马克思主义基本原理', knowledgePoints: ['唯物论', '辩证法', '认识论', '唯物史观'] },
      { id: 'politics-mao', name: '毛泽东思想和中国特色社会主义', knowledgePoints: ['毛泽东思想', '邓小平理论', '习近平新时代中国特色社会主义思想'] },
      { id: 'politics-history', name: '中国近现代史纲要', knowledgePoints: ['旧民主主义革命', '新民主主义革命', '社会主义建设'] },
      { id: 'politics-morality', name: '思想道德与法治', knowledgePoints: ['人生观', '道德观', '法治观'] },
    ],
  },
  {
    id: '408',
    name: '408 计算机学科专业基础',
    chapters: [
      { id: '408-ds', name: '数据结构', knowledgePoints: ['线性表', '栈与队列', '树', '图', '排序', '查找'] },
      { id: '408-co', name: '计算机组成原理', knowledgePoints: ['数据的表示', '存储层次', '指令系统', 'CPU', '总线'] },
      { id: '408-os', name: '操作系统', knowledgePoints: ['进程管理', '内存管理', '文件系统', 'I/O'] },
      { id: '408-cn', name: '计算机网络', knowledgePoints: ['物理层', '数据链路层', '网络层', '传输层', '应用层'] },
    ],
  },
];

export const DEFAULT_SETTINGS: Settings = {
  examDate: '2026-12-21',
  dailyGoalHours: 8,
  targetSchool: '',
  targetMajor: '',
  whiteNoiseVolume: 0.5,
};
