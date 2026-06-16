/* =================================================================
   白噪音组件（Web Audio API 原生生成，无需音频文件）
   ================================================================= */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, Button, Space, Slider, Typography } from 'antd';
import { SoundOutlined, PauseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

type NoiseType = 'white' | 'pink' | 'brown';

interface TrackDef {
  key: NoiseType;
  label: string;
  icon: string;
}

const TRACKS: TrackDef[] = [
  { key: 'white', label: '白噪音', icon: '📡' },
  { key: 'pink', label: '自习室', icon: '📖' },
  { key: 'brown', label: '雨声', icon: '🌧' },
];

export default function WhiteNoise() {
  const [activeTrack, setActiveTrack] = useState<NoiseType | null>(null);
  const [volume, setVolume] = useState(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | AudioScheduledSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // 生成噪声 buffer
  const createNoise = useCallback((ctx: AudioContext, type: NoiseType, len: number) => {
    const sampleRate = ctx.sampleRate;
    const buf = ctx.createBuffer(1, len * sampleRate, sampleRate);
    const data = buf.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      // Pink noise using Paul Kellet's refined method
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      // Brown noise (integrated white noise)
      let lastOut = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // 放大
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

    const buf = createNoise(ctx, type, 30); // 30 秒循环
    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;
    source.connect(gain);
    source.start();

    audioCtxRef.current = ctx;
    sourceRef.current = source;
    gainRef.current = gain;
    setActiveTrack(type);
  }, [volume, createNoise]);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    gainRef.current = null;
    setActiveTrack(null);
  }, []);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => stop(); // 卸载时停止
  }, [stop]);

  return (
    <Card
      size="small"
      title={
        <span>
          <SoundOutlined style={{ marginRight: 6 }} />
          白噪音 · 专注
          {activeTrack && (
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              正在播放 {TRACKS.find((t) => t.key === activeTrack)?.label}
            </Text>
          )}
        </span>
      }
      style={{ marginBottom: 24 }}
    >
      <Space style={{ width: '100%' }} direction="vertical">
        <div style={{ display: 'flex', gap: 8 }}>
          {TRACKS.map((t) => (
            <Button
              key={t.key}
              size="small"
              type={activeTrack === t.key ? 'primary' : 'default'}
              style={{
                flex: 1,
                background: activeTrack === t.key ? '#2DD4BF' : undefined,
                borderColor: activeTrack === t.key ? '#2DD4BF' : undefined,
              }}
              onClick={() => (activeTrack === t.key ? stop() : play(t.key))}
            >
              <span style={{ marginRight: 4 }}>{t.icon}</span>
              {activeTrack === t.key ? '暂停' : t.label}
            </Button>
          ))}
        </div>

        {activeTrack && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PauseCircleOutlined style={{ color: '#2DD4BF', cursor: 'pointer' }} onClick={stop} />
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={setVolume}
              style={{ flex: 1, margin: 0 }}
            />
            <Text type="secondary" style={{ fontSize: 12, minWidth: 32 }}>
              {Math.round(volume * 100)}%
            </Text>
          </div>
        )}
      </Space>
    </Card>
  );
}
