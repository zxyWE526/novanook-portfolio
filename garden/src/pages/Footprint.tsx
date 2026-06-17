import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

/* ================================================================
   类型 / 常量
   ================================================================ */

interface LabelData {
  id: string;
  text: string;
  position: { x: number; y: number; z: number };
}

const GEO_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';
const CT = [104, 33]; // 中国中心经纬度

const PALETTE = [
  0x6366f1, 0x7c3aed, 0xa855f7, 0xd946ef, 0xec4899,
  0xf43f5e, 0xef4444, 0xf97316, 0xf59e0b, 0xeab308,
  0x84cc16, 0x22c55e, 0x10b981, 0x14b8a6, 0x06b6d4,
  0x0ea5e9, 0x3b82f6, 0x4f46e5, 0x7c3aed, 0x9333ea,
  0xc026d3, 0xdb2777, 0xe11d48, 0xdc2626, 0xea580c,
  0xd97706, 0xca8a04, 0x65a30d, 0x16a34a, 0x059669,
  0x0d9488, 0x0891b2,
];

const LS_LABELS = 'fp_three_labels';
const LS_TEX = 'fp_three_textures';

/* ================================================================
   工具函数
   ================================================================ */

function loadLabels(): LabelData[] {
  try { return JSON.parse(localStorage.getItem(LS_LABELS) || '[]'); } catch { return []; }
}
function saveLabels(v: LabelData[]) { localStorage.setItem(LS_LABELS, JSON.stringify(v)); }

function loadTex(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(LS_TEX) || '{}'); } catch { return {}; }
}
function saveTex(v: Record<string, string>) { localStorage.setItem(LS_TEX, JSON.stringify(v)); }

/** 从阿里云 DataV 获取 GeoJSON */
async function fetchGeo() {
  const r = await fetch(GEO_URL, { cache: 'force-cache' });
  return r.json();
}

/** 将 GeoJSON feature 挤出为 THREE.Mesh 列表 */
function makeMeshes(feature: any, color: number, _idx: number) {
  const meshes: any[] = [];
  const name = feature.properties?.name || '未知';
  const geo = feature.geometry;
  if (!geo || (geo.type !== 'Polygon' && geo.type !== 'MultiPolygon')) return meshes;

  const polys: number[][][][] =
    geo.type === 'MultiPolygon' ? geo.coordinates : [geo.coordinates];

  for (const poly of polys) {
    const outer = poly[0];
    if (outer.length < 4) continue;

    const shape = new THREE.Shape();
    for (let i = 0; i < outer.length; i++) {
      const x = outer[i][0] - CT[0];
      const z = outer[i][1] - CT[1];
      i === 0 ? shape.moveTo(x, z) : shape.lineTo(x, z);
    }
    for (let h = 1; h < poly.length; h++) {
      const hole = poly[h];
      const p = new THREE.Path();
      for (let i = 0; i < hole.length; i++) {
        const x = hole[i][0] - CT[0];
        const z = hole[i][1] - CT[1];
        i === 0 ? p.moveTo(x, z) : p.lineTo(x, z);
      }
      shape.holes.push(p);
    }

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.45,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.015,
      bevelSegments: 2,
    });
    const mat = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.6,
      shininess: 40,
      specular: new THREE.Color(0x222244),
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.userData = { province: name, isProvince: true, baseColor: color, baseY: 0 };

    // 白色描边
    const edge = new THREE.EdgesGeometry(geom);
    const line = new THREE.LineSegments(
      edge,
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }),
    );
    mesh.add(line);

    meshes.push(mesh);
  }
  return meshes;
}

/* ================================================================
   组件
   ================================================================ */

export default function Footprint() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<any>(null); // 存 Three 场景对象, 供事件用
  const pendingProvinceRef = useRef<string | null>(null); // 左键选中省份

  const [labels, setLabels] = useState<LabelData[]>(loadLabels);
  const [textures, setTextures] = useState<Record<string, string>>(loadTex);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------- 初始化 Three.js 场景 ---------- */
  useEffect(() => {
    const ctn = containerRef.current;
    if (!ctn) return;

    let disposed = false;
    const data: any = { scene: null, camera: null, renderer: null, labelRenderer: null, controls: null, meshes: [], provinceMap: {} as Record<string, any[]>, labelObjs: [] as any[] };

    (async () => {
      try {
        if (disposed) return;

        /* ---- 场景 / 相机 / 渲染器 ---- */
	        const scene = new THREE.Scene();
	        scene.background = new THREE.Color(0x0b1120);

	        const camera = new THREE.PerspectiveCamera(45, ctn.clientWidth / ctn.clientHeight, 0.1, 200);
        camera.position.set(10, 14, 18);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(ctn.clientWidth, ctn.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        ctn.appendChild(renderer.domElement);

        const lr = new CSS2DRenderer();
        lr.setSize(ctn.clientWidth, ctn.clientHeight);
        lr.domElement.style.position = 'absolute';
        lr.domElement.style.top = '0';
        lr.domElement.style.pointerEvents = 'none'; // 标签自己设 pointer-events:auto
        ctn.appendChild(lr.domElement);

        /* ---- 灯光 ---- */
        const amb = new THREE.AmbientLight(0x404066, 0.6);
        scene.add(amb);

        const dir = new THREE.DirectionalLight(0xffeedd, 1.8);
        dir.position.set(15, 25, 10);
        dir.castShadow = true;
        scene.add(dir);

        const fill = new THREE.DirectionalLight(0x8888ff, 0.5);
        fill.position.set(-10, 5, -15);
        scene.add(fill);

        /* ---- 地面微弱雾效增加景深 ---- */
        scene.fog = new THREE.FogExp2(0x0b1120, 0.012);

        /* ---- 控制器 ---- */
        const ctrl = new OrbitControls(camera, renderer.domElement);
        ctrl.target.set(0, 0, 0);
        ctrl.enableDamping = true;
        ctrl.dampingFactor = 0.08;
        ctrl.minDistance = 6;
        ctrl.maxDistance = 50;
        ctrl.maxPolarAngle = Math.PI / 2.1;
        ctrl.autoRotate = false;
        ctrl.update();

        /* ---- 加载 GeoJSON ---- */
        const geo = await fetchGeo();
        if (disposed) return;

        const provinceMap: Record<string, any[]> = {};
        let colorIdx = 0;

        for (const feat of geo.features) {
          const name = feat.properties?.name;
          if (!name) continue;
          const meshes = makeMeshes(feat, PALETTE[colorIdx % PALETTE.length], colorIdx);
          colorIdx++;
          if (meshes.length) {
            provinceMap[name] = meshes;
            for (const m of meshes) {
              scene.add(m);
              data.meshes.push(m);
            }
          }
        }

        data.scene = scene;
        data.camera = camera;
        data.renderer = renderer;
        data.labelRenderer = lr;
        data.controls = ctrl;
        data.provinceMap = provinceMap;
        sceneRef.current = data;

        setLoading(false);

        /* ---- Raycaster ---- */
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        function getIntersects(e: MouseEvent) {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);
          return raycaster.intersectObjects(data.meshes);
        }

        function resetProvince() {
          const prev = pendingProvinceRef.current;
          if (prev && provinceMap[prev]) {
            for (const m of provinceMap[prev]) {
              m.position.y = 0;
              m.material.color.setHex(m.userData.baseColor);
              m.material.map = null;
              m.material.needsUpdate = true;
            }
          }
          pendingProvinceRef.current = null;
        }

        /* ---- 左键：省份 → 上传图片 ---- */
        renderer.domElement.addEventListener('click', (e: MouseEvent) => {
          if (e.button !== 0) return;
          const hits = getIntersects(e);
          const provHit = hits.find((h: any) => h.object?.userData?.isProvince);

          if (provHit) {
            const name = provHit.object.userData.province;
            // 如果点击同一个省份, 直接开文件选择器
            if (pendingProvinceRef.current !== name) {
              resetProvince();
            }
            pendingProvinceRef.current = name;
            fileRef.current?.click();
          } else {
            resetProvince();
          }
        });

        /* ---- 右键：添加文字标签 ---- */
        renderer.domElement.addEventListener('contextmenu', (e: MouseEvent) => {
          e.preventDefault();
          const hits = getIntersects(e);
          if (!hits.length) return;
          const pt = hits[0].point;

          const label: LabelData = {
            id: `l${Date.now()}`,
            text: '新地标',
            position: { x: pt.x, y: pt.y + 0.4, z: pt.z },
          };
          setLabels((prev) => {
            const next = [...prev, label];
            saveLabels(next);
            return next;
          });
        });

        /* ---- 动画循环 ---- */
        function animate() {
          if (disposed) return;
          requestAnimationFrame(animate);
          ctrl.update();
          renderer.render(scene, camera);
          lr.render(scene, camera);
        }
        animate();

        /* ---- Resize ---- */
        function onResize() {
          if (!ctn) return;
          const w = ctn.clientWidth;
          const h = ctn.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
          lr.setSize(w, h);
        }
        window.addEventListener('resize', onResize);
        data._resize = onResize;
      } catch (e: any) {
        if (!disposed) {
          console.error(e);
          setError(e.message || '加载失败');
          setLoading(false);
        }
      }
    })();

    return () => {
      disposed = true;
      const d = data;
      sceneRef.current = null;
      if (d?.controls) d.controls.dispose();
      if (d?.renderer) {
        d.renderer.dispose();
        d.renderer.domElement.remove();
      }
      if (d?.labelRenderer) {
        d.labelRenderer.domElement.remove();
      }
    };
  }, []);

  /* ---------- 同步已保存的纹理（页面加载后重新贴图） ---------- */
  useEffect(() => {
    if (loading || !sceneRef.current) return;
    const { provinceMap, THREE } = sceneRef.current;
    const loader = new THREE.TextureLoader();
    for (const [name, dataUrl] of Object.entries(textures)) {
      if (!provinceMap[name]) continue;
      const tex = loader.load(dataUrl);
      tex.needsUpdate = true;
      for (const m of provinceMap[name]) {
        m.material.map = tex;
        m.material.color.setHex(0xffffff);
        m.material.needsUpdate = true;
        m.position.y = 0.3;
      }
    }
  }, [loading, textures]);

  /* ---------- 同步 label DOM ---------- */
  useEffect(() => {
    const d = sceneRef.current;
    if (!d || !d.scene) return;
    const { CSS2DObject } = d;
    const { THREE } = d;

    // 清除旧 label
    for (const ob of d.labelObjs) {
      d.scene.remove(ob);
    }
    d.labelObjs = [];

    for (const lab of labels) {
      const div = document.createElement('div');
      div.style.cssText = `
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        color: #fff;
        padding: 5px 12px 5px 10px;
        border-radius: 8px;
        font-size: 13px;
        font-family: 'Inter', sans-serif;
        white-space: nowrap;
        pointer-events: auto;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        user-select: none;
      `;
      // 小圆点
      const dot = document.createElement('span');
      dot.style.cssText = `
        display: inline-block;
        width: 7px; height: 7px;
        border-radius: 50%;
        background: #f59e0b;
        box-shadow: 0 0 6px rgba(245,158,11,0.5);
        flex-shrink: 0;
      `;
      const txt = document.createElement('span');
      txt.textContent = lab.text;
      div.appendChild(dot);
      div.appendChild(txt);

      // 双击编辑
      div.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const next = prompt('编辑地标名称：', lab.text);
        if (next && next.trim()) {
          setLabels((prev) => {
            const updated = prev.map((l) =>
              l.id === lab.id ? { ...l, text: next.trim() } : l
            );
            saveLabels(updated);
            return updated;
          });
        }
      });

      const obj = new CSS2DObject(div);
      obj.position.set(lab.position.x, lab.position.y, lab.position.z);
      d.scene.add(obj);
      d.labelObjs.push(obj);
    }
  }, [labels]);

  /* ---------- 文件选择 ---------- */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const f = files[0];

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const prov = pendingProvinceRef.current;
      if (!prov) return;

      setTextures((prev) => {
        const next = { ...prev, [prov]: dataUrl };
        saveTex(next);
        return next;
      });

      // 即时贴图
      const d = sceneRef.current;
      if (d?.provinceMap[prov]) {
        const loader = new d.THREE.TextureLoader();
        const tex = loader.load(dataUrl);
        tex.needsUpdate = true;
        for (const m of d.provinceMap[prov]) {
          m.material.map = tex;
          m.material.color.setHex(0xffffff);
          m.material.needsUpdate = true;
          m.position.y = 0.3;
        }
      }
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  };

  /* ================================================================
     Render
     ================================================================ */

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 560,
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative',
          background: '#0b1120',
        }}
      >
        {/* 指令提示 */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            zIndex: 10,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 12,
            color: 'rgba(255,255,255,0.8)',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.02em',
            border: '1px solid rgba(255,255,255,0.06)',
            pointerEvents: 'none',
          }}
        >
          🖱️ 左键省份：上传图片 &nbsp;|&nbsp; 右键地面：添加文字 &nbsp;|&nbsp; 双击文字：编辑
        </div>

        {/* 加载状态 */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 14,
              fontFamily: "'Inter', sans-serif",
              background: '#0b1120',
              zIndex: 9,
            }}
          >
            加载地图数据…
          </div>
        )}

        {/* 错误 */}
        {error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f87171',
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
              background: '#0b1120',
              zIndex: 9,
            }}
          >
            ❌ {error}
          </div>
        )}

        {/* 隐藏的文件输入 */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
      </div>

      {/* 状态脚注 */}
      <div
        style={{
          marginTop: 8,
          fontSize: 11,
          color: '#64748b',
          textAlign: 'center',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        拖拽旋转 · 滚轮缩放 · 已标记 {Object.keys(textures).length} 省 · {labels.length} 处地标
      </div>
    </div>
  );
}
