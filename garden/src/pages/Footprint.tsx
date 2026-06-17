import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { useStore } from '../store/useStore';

interface FootprintEntry {
  id: string;
  province: string;
  city: string;
  text: string;
  images: string;
  date: string;
}

// Provinces that have been visited - stored in component state
// Using standard provincial-level administrative divisions of China

const PROVINCE_NAMES = [
  '北京', '天津', '上海', '重庆', '河北', '山西', '辽宁', '吉林',
  '黑龙江', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西',
  '甘肃', '青海', '台湾', '内蒙古', '广西', '西藏', '宁夏', '新疆',
  '香港', '澳门', '南海诸岛',
];

const PROVINCE_DATA = PROVINCE_NAMES.map((name) => ({
  name,
  value: Math.floor(Math.random() * 5),
}));

export default function Footprint() {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [entries, setEntries] = useState<FootprintEntry[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formText, setFormText] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formImages, setFormImages] = useState('');
  const [mapReady, setMapReady] = useState(false);

  // Load china map geoJSON
  useEffect(() => {
    const loadMap = async () => {
      try {
        const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
        const geoJson = await res.json();
        echarts.registerMap('china', geoJson);
        setMapReady(true);
      } catch (err) {
        console.error('Failed to load China map', err);
      }
    };
    loadMap();
  }, []);

  // Render chart
  useEffect(() => {
    if (!mapReady || !chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    // Count visits per province
    const visitCount: Record<string, number> = {};
    entries.forEach((e) => {
      visitCount[e.province] = (visitCount[e.province] || 0) + 1;
    });

    const mapData = PROVINCE_NAMES.map((name) => ({
      name,
      value: visitCount[name] || 0,
    }));

    chart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const count = params.value || 0;
          const entries_list = entries.filter((e) => e.province === params.name);
          let html = `<strong>${params.name}</strong><br/>足迹: ${count} 处`;
          if (entries_list.length > 0) {
            html += entries_list.slice(0, 3).map((e) => `<br/>· ${e.city}: ${e.text.slice(0, 20)}`).join('');
            if (entries_list.length > 3) html += `<br/>... 还有 ${entries_list.length - 3} 条`;
          }
          return html;
        },
      },
      visualMap: {
        min: 0,
        max: Math.max(5, ...mapData.map((d) => d.value)),
        text: ['多', '少'],
        left: 'left',
        bottom: 20,
        inRange: {
          color: ['#e0e7ff', '#6366f1', '#4f46e5', '#4338ca'],
        },
        calculable: true,
      },
      series: [
        {
          type: 'map',
          map: 'china',
          roam: true,
          selectedMode: false,
          label: {
            show: true,
            fontSize: 9,
            color: '#334155',
          },
          itemStyle: {
            areaColor: '#f1f5f9',
            borderColor: '#cbd5e1',
            borderWidth: 0.5,
          },
          emphasis: {
            label: { color: '#fff', fontSize: 11 },
            itemStyle: {
              areaColor: '#6366f1',
              shadowBlur: 20,
              shadowColor: 'rgba(99,102,241,0.3)',
            },
          },
          data: mapData,
        },
      ],
    });

    chart.on('click', (params: any) => {
      if (params.name) {
        setSelectedProvince(params.name);
        setFormCity('');
        setFormText('');
        setFormImages('');
        setShowModal(true);
      }
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
      chartInstance.current = null;
    };
  }, [mapReady, entries]);

  const handleAddEntry = () => {
    if (!formCity.trim()) return;
    const newEntry: FootprintEntry = {
      id: `fp-${Date.now()}`,
      province: selectedProvince,
      city: formCity.trim(),
      text: formText.trim(),
      images: formImages.trim(),
      date: new Date().toISOString(),
    };
    setEntries((prev) => [...prev, newEntry]);
    setShowModal(false);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Group entries by province
  const grouped = entries.reduce<Record<string, FootprintEntry[]>>((acc, e) => {
    if (!acc[e.province]) acc[e.province] = [];
    acc[e.province].push(e);
    return acc;
  }, {});

  const visitedProvinces = Object.keys(grouped).sort();

  return (
    <div>
      {!mapReady && (
        <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
          正在加载中国地图数据...
        </div>
      )}

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Map */}
        <div style={{ flex: '1 1 60%', minWidth: 320 }}>
          <div ref={chartRef} style={{ width: '100%', height: 520, borderRadius: 12, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }} />
          <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
            点击省份添加足迹 | 滚轮缩放 | 拖拽平移
          </div>
        </div>

        {/* Footprint list */}
        <div style={{ flex: '1 1 35%', minWidth: 280 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>
            我的足迹 ({entries.length})
          </div>

          {entries.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13, borderRadius: 12, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              点击地图上的省份添加你的足迹
            </div>
          ) : (
            <div style={{ maxHeight: 460, overflowY: 'auto', paddingRight: 4 }}>
              {visitedProvinces.map((province) => (
                <div key={province} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', marginBottom: 6 }}>
                    {province} ({grouped[province].length})
                  </div>
                  {grouped[province].map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        padding: '10px 12px',
                        background: '#fff',
                        borderRadius: 8,
                        marginBottom: 6,
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'box-shadow 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{entry.city}</div>
                          {entry.text && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{entry.text}</div>}
                          {entry.images && (
                            <div style={{ fontSize: 11, color: '#6366f1', marginTop: 2, cursor: 'pointer' }}>
                              查看图片
                            </div>
                          )}
                          <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 2 }}>
                            {new Date(entry.date).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          style={{
                            background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer',
                            fontSize: 14, padding: '0 4px', lineHeight: 1,
                          }}
                        >
                          x
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            style={{
              background: '#fff', borderRadius: 16, padding: 28,
              width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
              添加足迹 - {selectedProvince}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>
              记录你在这片土地上的故事
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>城市 / 地点</label>
              <input
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
                placeholder="例如: 杭州市西湖区"
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>文字记录</label>
              <textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="写点什么..."
                rows={3}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
                  fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>图片 URL（可选，一行一个）</label>
              <textarea
                value={formImages}
                onChange={(e) => setFormImages(e.target.value)}
                placeholder="https://..."
                rows={2}
                style={{
                  width: '100%', padding: '8px 12px', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: 13, outline: 'none',
                  fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 13,
                  fontFamily: 'inherit',
                }}
              >
                取消
              </button>
              <button
                onClick={handleAddEntry}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13,
                  fontFamily: 'inherit', fontWeight: 500,
                }}
              >
                保存足迹
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
