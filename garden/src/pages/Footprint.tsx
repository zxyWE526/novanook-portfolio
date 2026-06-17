import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import 'echarts-gl';
import chinaGeo from '../assets/china.json';

interface Entry {
  id: string; city: string; text: string; images: string; date: string;
}
interface ProvinceData {
  name: string; entries: Entry[];
}

export default function Footprint() {
  const ref = useRef<HTMLDivElement>(null);
  const [chart, setChart] = useState<echarts.ECharts | null>(null);
  const [raw, setRaw] = useState<ProvinceData[]>(() => {
    try { return JSON.parse(localStorage.getItem('fp') || '[]'); }
    catch { return []; }
  });
  const [modal, setModal] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [text, setText] = useState('');

  const save = (d: ProvinceData[]) => {
    setRaw(d);
    localStorage.setItem('fp', JSON.stringify(d));
  };

  const provinces = [
    '北京','天津','上海','重庆','河北','山西','辽宁','吉林','黑龙江',
    '江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东',
    '海南','四川','贵州','云南','陕西','甘肃','青海','台湾',
    '内蒙古','广西','西藏','宁夏','新疆','香港','澳门',
  ];

  useEffect(() => {
    echarts.registerMap('china', chinaGeo as any);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (chart) chart.dispose();

    const c = echarts.init(ref.current);
    setChart(c);

    const counts: Record<string, number> = {};
    raw.forEach((p) => { counts[p.name] = p.entries.length; });
    const md = provinces.map((n) => ({ name: n, value: counts[n] || 0 }));
    const mx = Math.max(1, ...md.map((d) => d.value));

    c.setOption({
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          const n = p.name || p.value;
          const prov = raw.find((d) => d.name === n);
          const cnt = prov?.entries.length || 0;
          let h = `<strong style="font-size:15px">${n}</strong><br/>足迹 ${cnt} 处`;
          prov?.entries.forEach((e) => {
            h += `<br/><span style="color:#94a3b8;font-size:12px">${e.city}</span>`;
            if (e.text) h += ` - ${e.text.slice(0, 15)}`;
          });
          return h;
        },
      },
      visualMap: {
        min: 0, max: mx, left: 20, bottom: 40,
        text: ['多','少'],
        inRange: { color: ['#f1f5f9','#e0e7ff','#a5b4fc','#6366f1','#4f46e5','#3730a3'] },
        calculable: true, itemWidth: 14, itemHeight: 100,
        textStyle: { color: '#64748b', fontSize: 11 },
      },
      series: [{
        type: 'map3D',
        map: 'china',
        roam: true,
        boxHeight: 1,
        regionHeight: 1,
        shading: 'color',
        groundPlane: { show: true, color: '#f1f5f9' },
        light: {
          main: { intensity: 1.2, alpha: 55, beta: -30 },
          ambient: { intensity: 0.5 },
        },
        viewControl: {
          projection: 'perspective', distance: 110, alpha: 30, beta: 0,
          center: [104, 35, 0],
          autoRotate: true, autoRotateSpeed: 5, autoRotateAfterStill: 3,
        },
        label: {
          show: true, color: '#1e293b', fontSize: 10,
        },
        itemStyle: {
          areaColor: '#f1f5f9', borderColor: '#cbd5e1', borderWidth: 0.5,
        },
        emphasis: {
          label: { color: '#fff', fontSize: 13, fontWeight: 600 },
          itemStyle: { areaColor: '#6366f1' },
        },
        data: md,
      }],
    });

    c.on('click', (p: any) => {
      if (p.name) { setModal(p.name); setCity(''); setText(''); }
    });

    const resize = () => c.resize();
    window.addEventListener('resize', resize);
    return () => { c.dispose(); window.removeEventListener('resize', resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const handleSave = () => {
    if (!modal || !city.trim()) return;
    const entry: Entry = { id: `e${Date.now()}`, city: city.trim(), text: text.trim(), images: '', date: new Date().toISOString() };
    const exist = raw.find((p) => p.name === modal);
    let next: ProvinceData[];
    if (exist) {
      next = raw.map((p) => p.name === modal ? { ...p, entries: [...p.entries, entry] } : p);
    } else {
      next = [...raw, { name: modal, entries: [entry] }];
    }
    save(next);
    setModal(null);
  };

  return (
    <div>
      <div ref={ref} style={{ width: '100%', height: 520, borderRadius: 8, overflow: 'hidden' }} />
      <div style={{ marginTop: 6, fontSize: 11, color: '#cbd5e1', textAlign: 'center' }}>
        点击省份添加足迹 · 拖拽旋转 · 滚轮缩放
      </div>

      {modal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 380 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>{modal}</div>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="城市 / 地点" style={s} autoFocus />
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="记录" rows={2} style={{ ...s, marginTop: 8, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={sb}>取消</button>
              <button onClick={handleSave} style={sp}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', display: 'block',
};
const sb: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13,
  fontFamily: 'inherit',
};
const sp: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 8, border: 'none',
  background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13,
  fontFamily: 'inherit', fontWeight: 500,
};
