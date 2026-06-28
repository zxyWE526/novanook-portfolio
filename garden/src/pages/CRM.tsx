'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ================================================================
   题库数据
   ================================================================ */

interface QItem {
  id: number;
  type: 'single' | 'multi';
  q: string;
  options: string[];
  answer: string;
}

const QUESTIONS: QItem[] = [
  { id: 1,  type: 'single', q: 'CRM的主要过程的构成为', options: ['营销、销售和服务', '宣传管理、订单处理和客户支持/服务', '市场、订单处理和服务', '宣传管理、销售管理和客户支持/服务'], answer: 'A' },
  { id: 2,  type: 'single', q: '客户关系的核心目标是', options: ['提高生产效率', '提升客户满意度与忠诚度，实现客户价值最大化', '降低产品成本', '增加广告投放量'], answer: 'B' },
  { id: 3,  type: 'single', q: '客户关系生命周期四阶段正确发展顺序是', options: ['潜在期→新客户期→成熟期→成长期', '考察期→形成期→稳定期→退化期', '新客户期→潜在期→成长期→成熟期', '潜在期→新客户期→成长期→衰退期'], answer: 'B' },
  { id: 4,  type: 'single', q: '在客户生命周期的某一阶段企业投入较少，客户对企业的贡献较大，企业处于高盈利时期，这一阶段为', options: ['考察期', '形成期', '稳定期', '退化期'], answer: 'C' },
  { id: 5,  type: 'single', q: 'CRM系统的基本功能不包括', options: ['财务管理', '销售管理', '营销管理', '客户服务与支持'], answer: 'A' },
  { id: 6,  type: 'single', q: '关系营销的特征不包括', options: ['双向沟通', '合作', '双赢', '提供优质服务'], answer: 'D' },
  { id: 7,  type: 'single', q: '在客户关系管理里，以下哪种情况不是客户的忠诚表现', options: ['对企业的品牌产生的情感和依赖', '重复购买', '即便遇到对企业产品的不满意，也不向企业投诉', '有向身边的朋友推荐企业的产品的意愿'], answer: 'C' },
  { id: 8,  type: 'single', q: '商业智能的支撑技术不包括', options: ['数据仓库技术', '数据库技术', 'OLAP技术', '数据挖掘技术'], answer: 'B' },
  { id: 9,  type: 'single', q: 'CRM与ERP功能交叉的模块不包括', options: ['客户管理', '产品管理', '决策支持', '营销管理'], answer: 'D' },
  { id: 10, type: 'single', q: '企业通过分析客户购买记录推荐相关产品，属于（　）策略', options: ['交叉销售', '向上销售', '降价促销', '品牌宣传'], answer: 'A' },
  { id: 11, type: 'single', q: '客户满意度的计算公式通常为', options: ['实际体验÷预期期望', '预期期望÷实际体验', '重复购买次数÷总购买次数', '客户投诉量÷客户总量'], answer: 'A' },
  { id: 12, type: 'single', q: 'CRM效益衡量的重要指标是', options: ['管理效果', '财务效果', '投资回报', '关键业绩'], answer: 'C' },
  { id: 13, type: 'single', q: '客户细分的主要目的是', options: ['减少客户服务成本', '识别高价值客户，实现精准营销', '增加客户数量', '提高产品价格'], answer: 'B' },
  { id: 14, type: 'single', q: '客户与企业关系开始到结束的整个客户生命周期的循环中，客户对企业的直接贡献和间接贡献的全部价值总和是', options: ['客户终身价值', '创造价值', '获取价值', '让渡价值'], answer: 'A' },
  { id: 15, type: 'single', q: '客户忠诚度的衡量指标不包括', options: ['重复购买率', '客户推荐率', '首次购买金额', '客户流失率'], answer: 'C' },
  { id: 16, type: 'single', q: 'CRM系统实施成功的关键因素是', options: ['购买最贵的CRM软件', '高层领导支持与业务流程优化', '仅培训技术部门', '快速上线系统'], answer: 'B' },
  { id: 17, type: 'single', q: '客户价值的构成不包括', options: ['历史价值', '当前价值', '未来价值', '品牌价值'], answer: 'D' },
  { id: 18, type: 'single', q: '下列哪项属于客户流失的内部原因', options: ['竞争对手推出优惠活动', '客户需求发生变化', '企业服务质量下降', '经济环境波动'], answer: 'C' },
  { id: 19, type: 'single', q: '企业实施客户关系管理的最终目的是', options: ['把握客户的消费动态', '针对客户的个性化特征提供个性化服务，极大化客户的价值', '做好客户服务工作', '尽可能多的收集客户信息'], answer: 'B' },
  { id: 20, type: 'single', q: '客户价值的衡量标准是', options: ['客户利润', '客户成本', '客户终生价值', '客户让渡价值'], answer: 'C' },
  { id: 21, type: 'single', q: '客户关系管理流程的起点是', options: ['客户细分', '客户价值评估', '客户获取', '制定营销策略'], answer: 'C' },
  { id: 22, type: 'single', q: '企业为客户提供生日专属优惠，属于（　）策略', options: ['客户挽留', '客户获取', '客户关怀', '交叉销售'], answer: 'C' },
  { id: 23, type: 'single', q: '客户关系管理起源于20世纪（　）年代的"接触管理"', options: ['60', '70', '80', '90'], answer: 'C' },
  { id: 24, type: 'single', q: '下列关于客户的说法，正确的是', options: ['只有购买了企业产品的才是客户', '客户等同于消费者', '客户是企业经营活动中最重要的资源之一', '潜在客户不属于客户范畴'], answer: 'C' },
  { id: 25, type: 'single', q: '决定客户购买总价值大小的关键因素是', options: ['产品价值', '服务价值', '人员价值', '形象价值'], answer: 'A' },
  { id: 26, type: 'single', q: '客户关系管理的本质是', options: ['对客户信息的管理', '对销售过程的管理', '对企业与客户之间关系的管理', '对售后服务的管理'], answer: 'C' },
  { id: 27, type: 'single', q: '下列说法中正确的是', options: ['以客户为中心就是要求企业与所有的客户都建立稳定的关系', '客户关系管理就是企业为对企业价值最大的客户提供服务管理', '企业进行营销决策的主要依据是每一类客户的行为特征、需求价值取向和成本收益', '从客户关系管理的角度上讲，当客户要离去时，企业应干脆放弃他们'], answer: 'C' },
  { id: 28, type: 'single', q: '商业银行CRM系统的组成一般有综合业务处理系统、客户联系和', options: ['客户服务中心', '客户关系分析中心', '客户呼叫中心', '客户销售中心'], answer: 'B' },
  { id: 29, type: 'single', q: '以下属于CRM系统的非经济效益的是', options: ['提高效益，节省开支', '增加营业收入，提高利润率', '提高企业营业额', '提高客户满意度'], answer: 'D' },
  { id: 30, type: 'single', q: '客户满意和客户忠诚论述错误的是', options: ['客户满意是一种心理的满足', '客户忠诚是一种持续交易的行为', '客户满意是客户关系管理根本目的', '客户忠诚是客户关系管理根本目的'], answer: 'C' },
  { id: 31, type: 'single', q: '以下哪项管理功能不在客户关系管理的范畴之内', options: ['销售管理', '采购管理', '呼叫中心', '数据挖掘'], answer: 'B' },
  { id: 32, type: 'single', q: '对于企业而言，不同客户之间的差异主要在于', options: ['年龄和性别', '身高和体重', '商业价值和需求', '收入和居住位置'], answer: 'C' },
  { id: 33, type: 'single', q: '以下说法正确的是', options: ['争取新客户的成本低', '保留老客户的成本低', '争取新客户的成本与保留老客户的成本差不多', '争取新客户和保留老客户的成本要根据实际情况来定'], answer: 'B' },
  { id: 34, type: 'single', q: 'CRM的核心是', options: ['提高企业盈利能力', '培育忠诚客户', '提高企业竞争力', '以客户为中心'], answer: 'D' },
  { id: 35, type: 'single', q: '客户管理的难题是：如何识别', options: ['客户的盈利率', '客户的忠诚度', '客户的满意度', '客户价值'], answer: 'D' },
  { id: 36, type: 'multi', q: '商业银行客户关系管理的内涵包括', options: ['核心是以客户为中心', '优化商业银行市场价值链条', '打造商业银行核心竞争力', '整合商业银行的资源体系', '实质是实现自身价值的提升'], answer: 'ABCD' },
  { id: 37, type: 'multi', q: '按照系统功能的分类方法，把CRM系统分为', options: ['大型CRM系统', '中小型CRM系统', '运营型CRM系统', '分析型CRM系统', '协作型CRM系统'], answer: 'CDE' },
  { id: 38, type: 'multi', q: '关系营销的本质特征包括', options: ['沟通双向性', '战略协同性', '营销互利性', '反馈的及时性', '利益的短期性'], answer: 'ABCD' },
  { id: 39, type: 'multi', q: '借助先进的信息技术实现某种特定的管理理念的四大电子商务解决方案分别是', options: ['CRM', 'ERP', 'SCM', 'BI', 'CKM'], answer: 'ABCD' },
  { id: 40, type: 'multi', q: '客户服务中心包括以下类型', options: ['基于Internet的客户服务中心', '多媒体客户服务中心', '可视化多媒体客户服务中心', '虚拟客户服务中心', '传统的客户服务中心'], answer: 'ABCD' },
  { id: 41, type: 'multi', q: '客户关系管理(CRM)的核心内涵包括', options: ['以客户为中心的经营理念', '整合营销、销售、服务的业务流程', '利用信息技术实现数据管理', '追求短期交易利润最大化', '建立长期稳定的客户关系'], answer: 'ABCE' },
  { id: 42, type: 'multi', q: '以下哪些是客户流失的常见原因？', options: ['员工流动率', '物流延迟', '竞争对手低价策略', '客户需求变化', '产品质量问题'], answer: 'BCDE' },
  { id: 43, type: 'multi', q: 'CRM系统的核心功能模块包括', options: ['销售自动化(SFA)', '营销自动化(MA)', '客户服务与支持(CSS)', '人工智能(BI)', '财务管理(FM)'], answer: 'ABCD' },
];

const TIME_LIMIT = 120; // 2分钟
const LABEL = 'ABCDEFGH';

/* ================================================================
   Component
   ================================================================ */

export default function CRM() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [multiSel, setMultiSel] = useState<Record<number, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [started, setStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---- 计时器 ---- */
  useEffect(() => {
    if (!started || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); setSubmitted(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, submitted]);

  /* ---- 交互 ---- */
  const pickSingle = (id: number, val: string) => { if (!submitted) setAnswers((p) => ({ ...p, [id]: val })); };
  const toggleMulti = (id: number, opt: string) => {
    if (submitted) return;
    setMultiSel((p) => {
      const cur = p[id] || [];
      return cur.includes(opt) ? { ...p, [id]: cur.filter((x) => x !== opt) } : { ...p, [id]: [...cur, opt] };
    });
  };

  const score = useCallback(() => {
    let n = 0;
    for (const q of QUESTIONS) {
      if (q.type === 'single') { if (answers[q.id] === q.answer) n++; }
      else {
        const sel = (multiSel[q.id] || []).map((t: string) => {
          const i = q.options.indexOf(t);
          return i >= 0 ? LABEL[i] : '';
        }).sort().join('');
        if (sel === q.answer) n++;
      }
    }
    return n;
  }, [answers, multiSel]);

  const handleSubmit = () => { setSubmitted(true); if (timerRef.current) clearInterval(timerRef.current); };

  /* ---- 工具 ---- */
  const ua = (q: QItem): string => {
    if (q.type === 'single') return answers[q.id] || '';
    return (multiSel[q.id] || []).map((t: string) => { const i = q.options.indexOf(t); return i >= 0 ? LABEL[i] : ''; }).sort().join('');
  };
  const wrong = (q: QItem) => submitted && ua(q) !== '' && ua(q) !== q.answer;
  const timedOut = started && timeLeft === 0 && !submitted;

  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;

  /* ---- 开始屏 ---- */
  if (!started) {
    return (
      <div style={{ width: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', padding: '40px 48px', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>客户关系管理（CRM）</div>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>共 {QUESTIONS.length} 题 · 限时 {TIME_LIMIT / 60} 分钟</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24 }}>35 道单选 + 8 道多选 · 时间到自动提交</div>
          <button onClick={() => setStarted(true)} style={{ padding: '10px 32px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>开始答题</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', fontFamily: "'Inter','PingFang SC','Microsoft YaHei',sans-serif", position: 'relative' }}>
      {/* 计时栏 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px', background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px)', borderRadius: '0 0 12px 12px',
        marginBottom: 20, borderBottom: '1px solid #e2e8f0',
      }}>
        <span style={{ fontSize: 13, color: '#64748b' }}>⏱</span>
        <span style={{
          fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
          color: timeLeft <= 30 ? '#ef4444' : timeLeft <= 60 ? '#f59e0b' : '#1e293b',
        }}>{String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}</span>

        {!submitted ? (
          <button onClick={handleSubmit} style={{
            marginLeft: 'auto', padding: '6px 16px', borderRadius: 6, border: '1px solid #6366f1',
            background: '#fff', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>提交答卷</button>
        ) : (
          <span style={{
            marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: '#6366f1',
            background: 'rgba(99,102,241,0.08)', padding: '6px 14px', borderRadius: 8,
          }}>得分 {score()} / {QUESTIONS.length}</span>
        )}
      </div>

      {/* 结果横幅 */}
      {submitted && (
        <div style={{
          padding: '16px 20px', borderRadius: 10, marginBottom: 20,
          background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{score()} / {QUESTIONS.length}</div>
          <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
            {(() => { const p = score() / QUESTIONS.length; if (p >= 0.9) return '🏆 优秀！'; if (p >= 0.7) return '👍 良好！'; if (p >= 0.6) return '📖 及格'; return '💪 继续加油！'; })()}
            {timedOut && '（时间到，自动提交）'}
          </div>
        </div>
      )}

      {/* 题目 */}
      {QUESTIONS.map((q, qi) => {
        const w = wrong(q);
        const c = submitted && !w && ua(q) !== '';

        return (
          <div key={q.id} style={{
            padding: '16px 20px', borderRadius: 10, marginBottom: 12,
            border: `1.5px solid ${w ? '#fca5a5' : c ? '#86efac' : '#e2e8f0'}`,
            background: w ? '#fef2f2' : c ? '#f0fdf4' : '#fff',
            transition: 'all 0.15s',
          }}>
            {/* 题号 + 标签 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                width: 26, height: 26, borderRadius: 6, background: '#f1f5f9', color: '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
              }}>{qi + 1}</span>
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 4,
                background: q.type === 'multi' ? '#fef3c7' : '#e0e7ff',
                color: q.type === 'multi' ? '#d97706' : '#4338ca',
                fontWeight: 600,
              }}>{q.type === 'multi' ? '多选' : '单选'}</span>
            </div>

            <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.6, fontWeight: 500 }}>{q.q}</div>

            {/* 选项 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {q.options.map((opt, oi) => {
                const letter = LABEL[oi];
                const sel = q.type === 'single' ? answers[q.id] === letter : (multiSel[q.id] || []).includes(opt);
                const isAns = q.answer.includes(letter);
                const showCorrect = submitted && w && isAns;
                const showWrong = submitted && w && sel && !isAns;

                return (
                  <div key={oi} onClick={() => q.type === 'single' ? pickSingle(q.id, letter) : toggleMulti(q.id, opt)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 8,
                    cursor: submitted ? 'default' : 'pointer',
                    background: showCorrect ? '#dcfce7' : showWrong ? '#fecaca' : sel ? '#eef2ff' : '#f8fafc',
                    border: `1.5px solid ${showCorrect ? '#86efac' : showWrong ? '#fca5a5' : sel ? '#6366f1' : '#e2e8f0'}`,
                    transition: 'all 0.12s',
                  }}>
                    <span style={{
                      width: 22, height: 22, borderRadius: q.type === 'multi' ? 4 : 11,
                      border: `2px solid ${sel ? '#6366f1' : '#cbd5e1'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, flexShrink: 0,
                      background: sel ? '#6366f1' : 'transparent',
                      color: sel ? '#fff' : '#94a3b8',
                    }}>{q.type === 'multi' ? (sel ? '✓' : '') : (sel ? '●' : '')}</span>
                    <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, fontWeight: showCorrect || showWrong ? 600 : 400 }}>
                      {letter}. {opt}
                    </span>
                    {showCorrect && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#16a34a', fontWeight: 600 }}>✓</span>}
                    {showWrong && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#dc2626', fontWeight: 600 }}>✗</span>}
                  </div>
                );
              })}
            </div>

            {/* 答错显示正确 */}
            {w && (
              <div style={{
                marginTop: 10, padding: '8px 12px', borderRadius: 6,
                background: '#fef2f2', border: '1px solid #fecaca',
                fontSize: 12, color: '#dc2626', lineHeight: 1.5,
              }}>
                正确答案：{q.answer.split('').join('、')}
              </div>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <div style={{ textAlign: 'center', padding: '24px 0 48px' }}>
          <button onClick={handleSubmit} style={{ padding: '10px 32px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>提交答卷</button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0 48px', fontSize: 13, color: '#94a3b8' }}>
          已提交 · 得分：{score()} / {QUESTIONS.length}
        </div>
      )}
    </div>
  );
}
