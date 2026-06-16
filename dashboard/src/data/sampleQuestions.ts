/* =================================================================
   示例真题（408 计算机学科专业基础）
   ================================================================= */
export interface SampleQuestion {
  id: number;
  content: string;
  options: string[];
  correctAnswer: string;
  score: number;
}

export const SAMPLE_QUESTIONS_408: SampleQuestion[] = [
  {
    id: 1,
    content: '在计算机系统中，CPU 从内存中读取指令时，PC（程序计数器）的值存放在______。',
    options: ['ALU 中', '控制器中', '寄存器中', '主存中'],
    correctAnswer: 'C',
    score: 2,
  },
  {
    id: 2,
    content: '设某棵二叉树有 10 个叶子结点，则该二叉树中度为 2 的结点数为______。',
    options: ['8', '9', '10', '11'],
    correctAnswer: 'B',
    score: 2,
  },
  {
    id: 3,
    content: '下列排序算法中，最坏情况下时间复杂度为 O(n²) 的是______。',
    options: ['归并排序', '快速排序', '堆排序', '基数排序'],
    correctAnswer: 'B',
    score: 2,
  },
  {
    id: 4,
    content: '在操作系统中，临界区是指______。',
    options: [
      '一个共享资源',
      '访问临界资源的代码段',
      '一段不可中断的程序',
      '一个互斥资源',
    ],
    correctAnswer: 'B',
    score: 2,
  },
  {
    id: 5,
    content: 'TCP/IP 参考模型中，IP 协议工作在______。',
    options: ['应用层', '传输层', '网际层', '网络接口层'],
    correctAnswer: 'C',
    score: 2,
  },
  {
    id: 6,
    content: '页式存储管理中，逻辑地址到物理地址的转换由______完成。',
    options: ['操作系统', 'MMU（内存管理单元）', '编译器', '链接器'],
    correctAnswer: 'B',
    score: 2,
  },
  {
    id: 7,
    content: '若一棵完全二叉树有 768 个结点，则该二叉树的深度为______。',
    options: ['9', '10', '11', '12'],
    correctAnswer: 'B',
    score: 2,
  },
  {
    id: 8,
    content: '使用 Chomsky 文法分类，编程语言的语法通常用______描述。',
    options: ['0 型文法', '1 型文法', '2 型文法', '3 型文法'],
    correctAnswer: 'C',
    score: 2,
  },
  {
    id: 9,
    content: '在 Linux 中，用于创建新进程的系统调用是______。',
    options: ['new', 'create', 'fork', 'exec'],
    correctAnswer: 'C',
    score: 2,
  },
  {
    id: 10,
    content: 'CSMA/CD 协议中，发送数据后检测到冲突后，采用的退避算法是______。',
    options: ['线性退避', '二进制指数退避', '固定退避', '随机退避'],
    correctAnswer: 'B',
    score: 2,
  },
];

export const SAMPLE_QUESTIONS_ENGLISH: SampleQuestion[] = [
  {
    id: 1,
    content: 'The word "comprehensive" in the passage is closest in meaning to ______.',
    options: ['complete', 'difficult', 'interesting', 'complex'],
    correctAnswer: 'A',
    score: 2,
  },
  {
    id: 2,
    content: 'According to the passage, the main reason for climate change is ______.',
    options: ['solar activity', 'human activities', 'volcanic eruptions', 'ocean currents'],
    correctAnswer: 'B',
    score: 2,
  },
  {
    id: 3,
    content: 'Which of the following best summarizes the author\'s argument?',
    options: [
      'Technology is harmful to society',
      'Innovation drives economic growth',
      'Education should be reformed',
      'Healthcare needs improvement',
    ],
    correctAnswer: 'B',
    score: 2,
  },
];

export const QUESTION_BANKS: Record<string, SampleQuestion[]> = {
  '408': SAMPLE_QUESTIONS_408,
  'english': SAMPLE_QUESTIONS_ENGLISH,
};
