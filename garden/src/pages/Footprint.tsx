import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import 'echarts-gl';
import chinaGeo from '../data/china.json';

interface ProvinceFootprint {
  name: string;
  entries: { id: string; text: string; date: string }[];
}

const PROVINCES = [
  '北京','天津','上海','重庆','河北','山西','辽宁','吉林','黑龙江',
  '江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东',
  '海南','四川','贵州','云南','陕西','甘肃','青海','台湾',
  '内蒙古','广西','西藏','宁夏','新疆','香港','澳门','南海诸岛',
];

export default function Footprint() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ProvinceFootprint[]>(() => {
    try { return JSON.parse(localStorage.getItem('life-footprint') || '[]'); } catch { return []; }
  });
  const [modal, setModal] = useState<{ province: string } | null>(null);
  const [formText, setFormText] = useState('');
  const [mapReady, setMapReady] = useState(false);

  const saveData = (d: ProvinceFootprint[]) => {
    setData(d);
    localStorage.setItem('life-footprint', JSON.stringify(d));
  };

  useEffect(() => {
    try {
      if (chinaGeo?.features?.length >= 30) {
        echarts.registerMap('china', chinaGeo as any);
        setMapReady(true);
      }
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (!mapReady || !chartRef.current) return;

    // Dispose previous instance
    const existing = echarts.getInstanceByDom(chartRef.current);
    if (existing) existing.dispose();

    const c = echarts.init(chartRef.current);
    const countMap: Record<string, number> = {};
    data.forEach((p) => { countMap[p.name] = p.entries.length; });
    const mapData = PROVINCES.map((name) => ({ name, value: countMap[name] || 0 }));
    const maxVal = Math.max(1, ...mapData.map((d) => d.value));

    c.setOption({
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          const n = p.name || p.value;
          const prov = data.find((d) => d.name === n);
          const cnt = prov?.entries.length || 0;
          let html = `<strong style="font-size:16px">${n}</strong><br/>足迹: ${cnt} 处`;
          if (prov) {
            prov.entries.forEach((e) => {
              html += `<br/><span style="color:#94a3b8;font-size:12px">${e.text?.slice(0, 20) || ''}</span>`;
            });
          }
          return html;
        },
      },
      visualMap: {
        min: 0, max: Math.max(5, maxVal),
        left: 20, bottom: 40,
        text: ['多', '少'],
        inRange: { color: ['#e0e7ff', '#a5b4fc', '#6366f1', '#4f46e5', '#312e81'] },
        calculable: true,
        itemWidth: 14, itemHeight: 100,
        textStyle: { color: '#64748b', fontSize: 11 },
      },
      series: [{
        type: 'map3D',
        map: 'china',
        roam: true,
        selectedMode: false,
        shading: 'realistic',
        boxHeight: 2,
        regionHeight: 1.5,
        groundPlane: { show: false },
        light: {
          main: { intensity: 1.5, shadow: true, shadowQuality: 'low' },
          ambient: { intensity: 0.4 },
          ambientCubemap: {
            texture: 'data-uri',
            exposure: 1,
            diffuseIntensity: 0.5,
          },
        },
        viewControl: {
          projection: 'perspective',
          distance: 110,
          alpha: 35,
          beta: 0,
          center: [104, 35, 0],
          minAlpha: 10,
          maxAlpha: 80,
          autoRotate: true,
          autoRotateSpeed: 5,
          autoRotateAfterStill: 3,
        },
        label: {
          show: true,
          color: '#334155',
          fontSize: 10,
          fontWeight: 500,
        },
        itemStyle: {
          areaColor: '#e2e8f0',
          borderColor: '#94a3b8',
          borderWidth: 0.5,
          opacity: 0.9,
        },
        emphasis: {
          label: { color: '#fff', fontSize: 12, fontWeight: 600 },
          itemStyle: { areaColor: '#6366f1', opacity: 1 },
        },
        data: mapData.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: d.value > 0 ? {
            areaColor: d.value >= 5 ? '#312e81' : d.value >= 3 ? '#4f46e5' : d.value >= 1 ? '#6366f1' : '#e2e8f0',
          } : undefined,
        })),
      }],
    });

    c.on('click', (p: any) => {
      const name = p.name || p.value;
      if (name) {
        setFormText('');
        setModal({ province: name });
      }
    });

    const resize = () => c.resize();
    window.addEventListener('resize', resize);
    return () => { c.dispose(); window.removeEventListener('resize', resize); };
  }, [mapReady, data]);

  const handleSave = () => {
    if (!formText.trim() || !modal) return;
    const entry = { id: `fp-${Date.now()}`, text: formText.trim(), date: new Date().toISOString() };
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

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {!mapReady ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8', fontSize: 13 }}>
          加载中...
        </div>
      ) : (
        <>
          <div ref={chartRef} style={{ width: '100%', height: 'calc(100vh - 200px)', minHeight: 500, borderRadius: 8 }} />
          <div style={{ marginTop: 8, fontSize: 11, color: '#cbd5e1', textAlign: 'center' }}>
            点击省份添加足迹 | 鼠标拖拽旋转 | 滚轮缩放
          </div>
        </>
      )}

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
            width: '100%', maxWidth: 380,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
              {modal.province}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16 }}>
              记录在这片土地上的故事
            </div>
            <textarea
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder="写点什么..."
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
                fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13,
                  fontFamily: 'inherit',
                }}>取消</button>
              <button onClick={handleSave}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13,
                  fontFamily: 'inherit', fontWeight: 600,
                }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
