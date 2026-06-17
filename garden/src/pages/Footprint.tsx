/* 临时占位 — 排除 Three.js 问题 */
export default function Footprint() {
  return (
    <div style={{
      width: '100%', height: 480,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0b1120', borderRadius: 12,
      color: 'rgba(255,255,255,0.5)', fontSize: 15,
      fontFamily: 'Inter, sans-serif',
    }}>
      🗺️ 地图加载中…
    </div>
  );
}
