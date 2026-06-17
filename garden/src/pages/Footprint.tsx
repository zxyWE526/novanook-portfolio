import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import 'echarts-gl';
import chinaGeo from '../assets/china.json';

interface Entry {
  id: string; city: string; text: string; images: string[]; date: string;
}
interface ProvinceData {
  name: string; entries: Entry[];
}

const PROVINCES = [
  '北京','天津','上海','重庆','河北','山西','辽宁','吉林','黑龙江',
  '江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东',
  '海南','四川','贵州','云南','陕西','甘肃','青海','台湾',
  '内蒙古','广西','西藏','宁夏','新疆','香港','澳门',
];

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
  const [images, setImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const save = (d: ProvinceData[]) => {
    setRaw(d);
    localStorage.setItem('fp', JSON.stringify(d));
  };

  useEffect(() => {
    echarts.registerMap('china', chinaGeo as any);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    if (chart) chart.dispose();
    const c = echarts.init(ref.current, undefined, { renderer: 'canvas' });
    setChart(c);

    const counts: Record<string, number> = {};
    raw.forEach((p) => { counts[p.name] = p.entries.length; });
    const md = PROVINCES.map((n) => ({ name: n, value: counts[n] || 0 }));
    const mx = Math.max(1, ...md.map((d) => d.value));

    c.setOption({
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          const n = p.name || p.value;
          const prov = raw.find((d) => d.name === n);
          const cnt = prov?.entries.length || 0;
          let h = `<strong style="font-size:14px">${n}</strong><br/>足迹 ${cnt} 处`;
          prov?.entries.forEach((e) => {
            h += `<br/><span style="color:#94a3b8">${e.city}</span>`;
            if (e.text) h += ` — ${e.text.slice(0, 15)}`;
            if (e.images.length) h += ` <span style="color:#6366f1">[图]</span>`;
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
        boxHeight: 10,
        regionHeight: 1,
        shading: 'lambert',
        groundPlane: { show: false },
        light: {
          main: { intensity: 1.5, alpha: 45, beta: -20 },
          ambient: { intensity: 0.4 },
        },
        postEffect: { enable: true, SSAO: { enable: true, radius: 8, intensity: 2 } },
        viewControl: {
          projection: 'perspective', distance: 75, alpha: 40, beta: 0,
          center: [104, 33, 0],
          autoRotate: false,
        },
        label: { show: true, color: '#334155', fontSize: 10 },
        itemStyle: { areaColor: '#e2e8f0', borderColor: '#94a3b8', borderWidth: 0.5 },
        emphasis: {
          label: { color: '#fff', fontSize: 13, fontWeight: 600 },
          itemStyle: { areaColor: '#6366f1' },
        },
        data: md,
      }],
    });

    c.on('click', (p: any) => {
      if (p.name) {
        setModal(p.name); setCity(''); setText(''); setImages([]);
      }
    });

    const resize = () => c.resize();
    window.addEventListener('resize', resize);
    return () => { c.dispose(); window.removeEventListener('resize', resize); };
  }, [raw]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(f);
    });
    e.target.value = '';
  };

  const handleSave = () => {
    if (!modal || !city.trim()) return;
    const entry: Entry = {
      id: `e${Date.now()}`, city: city.trim(), text: text.trim(),
      images, date: new Date().toISOString(),
    };
    const exist = raw.find((p) => p.name === modal);
    if (exist) {
      save(raw.map((p) => p.name === modal ? { ...p, entries: [...p.entries, entry] } : p));
    } else {
      save([...raw, { name: modal, entries: [entry] }]);
    }
    setModal(null);
  };

  const handleDelete = (province: string, entryId: string) => {
    save(raw.map((p) =>
      p.name === province ? { ...p, entries: p.entries.filter((e) => e.id !== entryId) } : p
    ).filter((p) => p.entries.length > 0));
  };

  return (
    <div>
      <div ref={ref} style={{ width: '100%', height: 520, borderRadius: 8, overflow: 'hidden' }} />
      <div style={{ marginTop: 6, fontSize: 11, color: '#cbd5e1', textAlign: 'center' }}>
        点击省份添加足迹 · 拖拽旋转 · 滚轮缩放
      </div>

      {modal && (
        <div style={overlay} onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}>
          <div style={modalBox}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 14 }}>{modal}</div>
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="城市 / 地点" style={inp} autoFocus />
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="记录" rows={2} style={{ ...inp, marginTop: 8, resize: 'vertical' }} />

            <div style={{ marginTop: 10 }}>
              <button onClick={() => fileRef.current?.click()} style={uplBtn}>
                添加图片
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFile} style={{ display: 'none' }} />
              {images.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={img} alt="" style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover' }} />
                      <button onClick={() => setImages(images.filter((_, j) => j !== i))}
                        style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 10, cursor: 'pointer', padding: 0, lineHeight: '16px' }}>x</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={btnSec}>取消</button>
              <button onClick={handleSave} style={btnPri}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, zIndex: 2000,
  background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
};
const modalBox: React.CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 28,
  width: '100%', maxWidth: 420, maxHeight: '80vh', overflowY: 'auto',
};
const inp: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box', display: 'block',
};
const uplBtn: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 6, border: '1px dashed #6366f1',
  background: 'rgba(99,102,241,0.04)', color: '#6366f1', cursor: 'pointer',
  fontSize: 12, fontFamily: 'inherit',
};
const btnSec: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
  background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13,
  fontFamily: 'inherit',
};
const btnPri: React.CSSProperties = {
  padding: '8px 20px', borderRadius: 8, border: 'none',
  background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13,
  fontFamily: 'inherit', fontWeight: 500,
};
