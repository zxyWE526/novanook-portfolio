/* CRM 客户关系管理试题 */

const data = [
  {
    type: '一、单项选择题',
    questions: [
      { q: 'CRM的主要过程的构成为', a: 'A.营销、销售和服务' },
      { q: '客户关系的核心目标是', a: 'B.提升客户满意度与忠诚度，实现客户价值最大化' },
      { q: '客户关系生命周期四阶段正确发展顺序是', a: 'B.考察期→形成期→稳定期→退化期' },
      { q: '在客户生命周期的某一阶段企业投入较少，客户对企业的贡献较大，企业处于高盈利时期，这一阶段为', a: 'C.稳定期' },
      { q: 'CRM系统的基本功能不包括', a: 'A.财务管理' },
      { q: '关系营销的特征不包括', a: 'D.提供优质服务' },
      { q: '以下哪种情况不是客户的忠诚表现', a: 'C.即便遇到对企业产品的不满意，也不向企业投诉' },
      { q: '商业智能的支撑技术不包括', a: 'B.数据库技术' },
      { q: 'CRM与ERP功能交叉的模块不包括', a: 'D.营销管理' },
      { q: '企业通过分析客户购买记录推荐相关产品，属于()策略', a: 'A.交叉销售' },
      { q: '客户满意度的计算公式通常为', a: 'A.实际体验÷预期期望' },
      { q: 'CRM效益衡量的重要指标是', a: 'C.投资回报' },
      { q: '客户细分的主要目的是', a: 'B.识别高价值客户，实现精准营销' },
      { q: '客户终身价值是指', a: 'A.客户与企业关系开始到结束的整个生命周期中，客户对企业的直接贡献和间接贡献的全部价值总和' },
      { q: '客户忠诚度的衡量指标不包括', a: 'C.首次购买金额' },
      { q: 'CRM系统实施成功的关键因素是', a: 'B.高层领导支持与业务流程优化' },
      { q: '客户价值的构成不包括', a: 'D.品牌价值' },
      { q: '下列哪项属于客户流失的内部原因', a: 'C.企业服务质量下降' },
      { q: '企业实施客户关系管理的最终目的是', a: 'B.针对客户的个性化特征提供个性化服务，极大化客户的价值' },
      { q: '客户价值的衡量标准是', a: 'C.客户终生价值' },
      { q: '客户关系管理流程的起点是', a: 'C.客户获取' },
      { q: '企业为客户提供生日专属优惠，属于()策略', a: 'C.客户关怀' },
      { q: '客户关系管理起源于20世纪()年代的"接触管理"', a: 'C.80' },
      { q: '下列关于客户的说法，正确的是', a: 'C.客户是企业经营活动中最重要的资源之一' },
      { q: '决定客户购买总价值大小的关键因素是', a: 'A.产品价值' },
      { q: '客户关系管理的本质是', a: 'C.对企业与客户之间关系的管理' },
      { q: '下列说法中正确的是', a: 'C.企业进行营销决策的主要依据是每一类客户的行为特征、需求价值取向和成本收益' },
      { q: '商业银行CRM系统的组成一般有综合业务处理系统、客户联系和', a: 'B.客户关系分析中心' },
      { q: '以下属于CRM系统的非经济效益的是', a: 'D.提高客户满意度' },
      { q: '客户满意和客户忠诚论述错误的是', a: 'C.客户满意是客户关系管理根本目的' },
      { q: '以下那项管理功能不在客户关系管理的范畴之内', a: 'B.采购管理' },
      { q: '对于企业而言，不同客户之间的差异主要在于', a: 'C.商业价值和需求' },
      { q: '以下说法正确的是', a: 'B.保留老客户的成本低' },
      { q: 'CRM的核心是', a: 'D.以客户为中心' },
      { q: '客户管理的难题是：如何识别', a: 'D.客户价值' },
    ],
  },
  {
    type: '二、多项选择题',
    questions: [
      { q: '商业银行客户关系管理的内涵包括', a: 'ABCDE.核心是以客户为中心；优化商业银行市场价值链条；打造商业银行核心竞争力；整合商业银行的资源体系；实质是实现自身价值的提升' },
      { q: '按照系统功能的分类方法，把CRM系统分为', a: 'CDE.运营型CRM系统；分析型CRM系统；协作型CRM系统' },
      { q: '关系营销的本质特征包括', a: 'ABCD.沟通双向性；战略协同性；营销互利性；反馈的及时性' },
      { q: '借助先进的信息技术实现某种特定的管理理念的四大电子商务解决方案分别是', a: 'ABCD.CRM；ERP；SCM；BI' },
      { q: '客户服务中心包括以下类型', a: 'ABCD.基于Internet的客户服务中心；多媒体客户服务中心；可视化多媒体客户服务中心；虚拟客户服务中心' },
      { q: '客户关系管理(CRM)的核心内涵包括', a: 'ABCE.以客户为中心的经营理念；整合营销、销售、服务的业务流程；利用信息技术实现数据管理；建立长期稳定的客户关系' },
      { q: '以下哪些是客户流失的常见原因?', a: 'BCDE.物流延迟；竞争对手低价策略；客户需求变化；产品质量问题' },
      { q: 'CRM系统的核心功能模块包括', a: 'ABCD.销售自动化(SFA)；营销自动化(MA)；客户服务与支持(CSS)；人工智能(BI)' },
    ],
  },
];

export default function CRM() {
  return (
    <div style={wrap}>
      <div style={header}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>
          客户关系管理（CRM）试题
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8' }}>含参考答案 · 共 43 题</p>
      </div>

      {data.map((section, si) => (
        <div key={si} style={{ marginBottom: 32 }}>
          <div style={sectionTitle}>{section.type}</div>

          {section.questions.map((item, qi) => (
            <div key={qi} style={card}>
              <div style={qNum}>{si + 1}.{qi + 1}</div>
              <div>
                <div style={qText}>{item.q}</div>
                <div style={aText}>
                  <span style={{ color: '#6366f1', fontWeight: 600, marginRight: 6 }}>答：</span>
                  {item.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* --- Styles --- */
const wrap: React.CSSProperties = {
  width: '100%', maxWidth: 800, margin: '0 auto', padding: '12px 0',
  fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif",
};
const header: React.CSSProperties = {
  padding: '24px 28px', background: '#fff', borderRadius: 12,
  marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};
const sectionTitle: React.CSSProperties = {
  display: 'inline-block', padding: '6px 18px',
  borderRadius: 20, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: '#fff', fontSize: 14, fontWeight: 600,
  marginBottom: 16, letterSpacing: '0.02em',
};
const card: React.CSSProperties = {
  display: 'flex', gap: 14, padding: '14px 18px',
  background: '#fff', borderRadius: 10, marginBottom: 10,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  transition: 'box-shadow 0.2s',
};
const qNum: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8,
  background: '#f1f5f9', color: '#64748b',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 12, fontWeight: 600, flexShrink: 0,
};
const qText: React.CSSProperties = {
  fontSize: 14, color: '#1e293b', lineHeight: 1.6, marginBottom: 6,
};
const aText: React.CSSProperties = {
  fontSize: 13, color: '#475569', lineHeight: 1.5,
};
