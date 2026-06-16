/* =================================================================
   白噪音组件 — 精致卡片式设计
   ================================================================= */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, Button, Slider, Typography, Tooltip } from 'antd';
import {
  SoundOutlined, PauseCircleFilled, SoundFilled,
} from '@ant-design/icons';

const { Text } = Typography;

type NoiseType = 'white' | 'pink' | 'brown';

interface TrackDef {
  key: NoiseType;
  label: string;
  icon: string;
  gradient: string;
  desc: string;
}

const TRACKS: TrackDef[] = [
  { key: 'white', label: '白噪音', icon: '📡', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', desc: '屏蔽干扰' },
  { key: 'pink', label: '自习室', icon: '📖', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', desc: '沉浸笔触' },
  { key: 'brown', label: '雨声', icon: '🌧', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', desc: '助眠放松' },
];

export default function WhiteNoise() {
  const [activeTrack, setActiveTrack] = useState<NoiseType | null>(null);
  const [volume, setVolume] = useState(0.3);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const createNoise = useCallback((ctx: AudioContext, type: NoiseType, len: number) => {
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, len * sr, sr);
    const data = buf.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520;
        b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else {
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const w = Math.random() * 2 - 1;
        data[i] = (last + 0.02 * w) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    }
    return buf;
  }, []);

  const play = useCallback((type: NoiseType) => {
    stop();
    const ctx = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);
    const buf = createNoise(ctx, type, 30);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(gain);
    src.start();
    ctxRef.current = ctx;
    sourceRef.current = src;
    gainRef.current = gain;
    setActiveTrack(type);
  }, [volume, createNoise]);

  const stop = useCallback(() => {
    sourceRef.current?.stop?.(); sourceRef.current = null;
    ctxRef.current?.close(); ctxRef.current = null;
    gainRef.current = null;
    setActiveTrack(null);
  }, []);

  useEffect(() => { gainRef.current && (gainRef.current.gain.value = volume); }, [volume]);
  useEffect(() => () => stop(), [stop]);

  const activeDef = TRACKS.find((t) => t.key === activeTrack);

  return (
    <Card
      style={{
        borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        marginBottom: 24, overflow: 'hidden',
      }}
      bodyStyle={{ padding: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <SoundOutlined style={{ color: '#2DD4BF', fontSize: 16 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>白噪音 · 专注</span>
      </div>

      {/* 音轨选择卡片 */}
      <div style={{ display: 'flex', gap: 10 }}>
        {TRACKS.map((t) => {
          const isActive = activeTrack === t.key;
          return (
            <Tooltip key={t.key} title={t.desc}>
              <div
                onClick={() => (isActive ? stop() : play(t.key))}
                style={{
                  flex: 1, padding: '14px 10px',
                  borderRadius: 12, cursor: 'pointer',
                  background: isActive ? t.gradient : '#f8f8f8',
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  border: '1px solid',
                  borderColor: isActive ? 'transparent' : '#f0f0f0',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isActive ? '0 4px 16px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{t.icon}</div>
                <div
                  style={{
                    fontSize: 12, fontWeight: 600,
                    color: isActive ? '#fff' : '#666',
                  }}
                >
                  {isActive ? '播放中' : t.label}
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>

      {/* 播放控制 */}
      {activeTrack && (
        <div
          style={{
            marginTop: 16, padding: '12px 16px',
            background: '#f8f8f8', borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <Tooltip title="停止">
            {activeDef && (
              <PauseCircleFilled
                style={{ fontSize: 28, color: '#2DD4BF', cursor: 'pointer', flexShrink: 0 }}
                onClick={stop}
              />
            )}
          </Tooltip>
          <SoundFilled style={{ color: '#bbb', fontSize: 14 }} />
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={setVolume}
            style={{ flex: 1, margin: 0 }}
          />
          <Text type="secondary" style={{ fontSize: 12, minWidth: 30, textAlign: 'right' }}>
            {Math.round(volume * 100)}%
          </Text>
        </div>
      )}
    </Card>
  );
}
