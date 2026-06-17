import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

interface ProvinceFootprint {
  name: string;
  entries: { id: string; city: string; text: string; images: string; date: string }[];
}

const PROVINCES = [
  '北京','天津','上海','重庆','河北','山西','辽宁','吉林','黑龙江',
  '江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东',
  '海南','四川','贵州','云南','陕西','甘肃','青海','台湾',
  '内蒙古','广西','西藏','宁夏','新疆','香港','澳门','南海诸岛',
];

export default function Footprint() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<echarts.ECharts | null>(null);
  const [data, setData] = useState<ProvinceFootprint[]>(() => {
    try { return JSON.parse(localStorage.getItem('life-footprint') || '[]'); }
    catch { return []; }
  });
  const [modal, setModal] = useState<{ province: string } | null>(null);
  const [formCity, setFormCity] = useState('');
  const [formText, setFormText] = useState('');
  const [formImages, setFormImages] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const saveData = (d: ProvinceFootprint[]) => {
    setData(d);
    localStorage.setItem('life-footprint', JSON.stringify(d));
  };

  // Load map
  useEffect(() => {
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json')
      .then((r) => r.json())
      .then((geo) => {
        echarts.registerMap('china', geo);
        setMapReady(true);
      })
      .catch(console.error);
  }, []);

  // Render/update chart
  useEffect(() => {
    if (!mapReady || !chartRef.current) return;
    if (chart) chart.dispose();

    const c = echarts.init(chartRef.current, undefined, { renderer: 'canvas' });
    setChart(c);

    const countMap: Record<string, number> = {};
    data.forEach((p) => { countMap[p.name] = p.entries.length; });

    const mapData = PROVINCES.map((name) => ({ name, value: countMap[name] || 0 }));
    const maxVal = Math.max(1, ...mapData.map((d) => d.value));

    c.setOption({
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          const n = p.name;
          const prov = data.find((d) => d.name === n);
          const cnt = prov?.entries.length || 0;
          let html = `<strong style="font-size:14px">${n}</strong><br/>足迹: ${cnt} 处`;
          if (prov) {
            prov.entries.forEach((e) => {
              html += `<br/><span style="color:#94a3b8;font-size:12px">${e.city}</span>`;
              if (e.text) html += ` - ${e.text.slice(0, 15)}`;
            });
          }
          return html;
        },
      },
      visualMap: {
        min: 0, max: maxVal,
        left: 20, bottom: 20,
        text: ['多', '少'],
        inRange: { color: ['#f1f5f9', '#e0e7ff', '#a5b4fc', '#6366f1', '#4f46e5', '#3730a3'] },
        calculable: true,
        itemWidth: 12, itemHeight: 80,
      },
      series: [{
        type: 'map',
        map: 'china',
        roam: true,
        selectedMode: false,
        zoom: 1.2,
        center: [104, 35],
        label: { show: true, fontSize: 9, color: '#334155' },
        itemStyle: {
          areaColor: '#f1f5f9',
          borderColor: '#cbd5e1',
          borderWidth: 0.5,
          shadowBlur: 4,
          shadowColor: 'rgba(0,0,0,0.03)',
        },
        emphasis: {
          label: { color: '#fff', fontSize: 12, fontWeight: 600 },
          itemStyle: {
            areaColor: '#6366f1',
            shadowBlur: 30,
            shadowColor: 'rgba(99,102,241,0.4)',
          },
        },
        data: mapData,
      }],
    });

    c.on('click', (p: any) => {
      if (p.name) {
        setFormCity(''); setFormText(''); setFormImages('');
        setModal({ province: p.name });
      }
    });

    const resize = () => c.resize();
    window.addEventListener('resize', resize);
    return () => { c.dispose(); window.removeEventListener('resize', resize); };
  }, [mapReady, data]);

  const handleSave = () => {
    if (!formCity.trim() || !modal) return;
    const entry = { id: `fp-${Date.now()}`, city: formCity.trim(), text: formText.trim(), images: formImages.trim(), date: new Date().toISOString() };
    const exists = data.find((p) => p.name === modal.province);
    let next: ProvinceFootprint[];
    if (exists) {
      next = data.map((p) => p.name === modal.province ? { ...p, entries: [...p.entries, entry] } : p);
    } else {
      next = [...data, { name: modal.province, entries: [entry] }];
    }
    saveData(next);
    setModal(null);
  };

  const handleDelete = (province: string, entryId: string) => {
    const next = data.map((p) =>
      p.name === province ? { ...p, entries: p.entries.filter((e) => e.id !== entryId) } : p
    ).filter((p) => p.entries.length > 0);
    saveData(next);
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '60vh' }}>
      {!mapReady && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 13 }}>
          加载中国地图...
        </div>
      )}
      <div ref={chartRef} style={{ width: '100%', height: 560, borderRadius: 8 }} />
      <div style={{ marginTop: 6, fontSize: 11, color: '#cbd5e1', textAlign: 'center' }}>
        点击省份添加足迹 | 滚轮缩放 | 拖拽平移
      </div>

      {/* Modal */}
      {modal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28,
            width: '100%', maxWidth: 400,
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>
              {modal.province}
            </div>
            <input
              value={formCity} onChange={(e) => setFormCity(e.target.value)}
              placeholder="城市 / 地点"
              style={inputStyle}
              autoFocus
            />
            <textarea
              value={formText} onChange={(e) => setFormText(e.target.value)}
              placeholder="文字记录"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical', marginTop: 8 }}
            />
            <textarea
              value={formImages} onChange={(e) => setFormImages(e.target.value)}
              placeholder="图片 URL (可选)"
              rows={1}
              style={{ ...inputStyle, resize: 'vertical', marginTop: 8 }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={btnSecStyle}>取消</button>
              <button onClick={handleSave} style={btnPriStyle}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', display: 'block',
};

const btnSecStyle: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13,
  fontFamily: 'inherit',
};

const btnPriStyle: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 8, border: 'none',
  background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13,
  fontFamily: 'inherit', fontWeight: 500,
};
