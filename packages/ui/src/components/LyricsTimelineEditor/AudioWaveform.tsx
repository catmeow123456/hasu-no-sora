import React, { useRef, useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { theme, getSingerColor } from '../../styles/theme';
import type { EditableLyricLine, WaveformData } from './types';

interface DragState {
  isDragging: boolean;
  dragLineId: string | null;
  startX: number;
  startTime: number;
}

const WaveformContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${theme.colors.surface};
  overflow: hidden;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: crosshair;
  
  &:hover {
    cursor: pointer;
  }
`;

const TimeLabels = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  display: flex;
  align-items: center;
  background: linear-gradient(to top, ${theme.colors.surfaceHover}, transparent);
  font-size: ${theme.fontSizes.xs};
  color: ${theme.colors.text.secondary};
  pointer-events: none;
`;

const TimeLabel = styled.div<{ $left: number }>`
  position: absolute;
  left: ${props => props.$left}%;
  transform: translateX(-50%);
  padding: 0 ${theme.spacing.xs};
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.sm};
  white-space: nowrap;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.surface}cc;
  color: ${theme.colors.text.secondary};
  font-size: ${theme.fontSizes.sm};
`;

interface AudioWaveformProps {
  audioFile: File | null;
  currentTime: number;
  duration: number;
  lyrics: EditableLyricLine[];
  onTimeClick: (time: number) => void;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  audioFile,
  currentTime,
  duration,
  lyrics,
  onTimeClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [waveformData, setWaveformData] = useState<WaveformData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 生成波形数据
  const generateWaveform = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const samples = audioBuffer.getChannelData(0);
      const blockSize = Math.floor(samples.length / 1000); // 1000个采样点
      const peaks = new Float32Array(1000);
      
      for (let i = 0; i < 1000; i++) {
        let sum = 0;
        let max = 0;
        for (let j = 0; j < blockSize; j++) {
          const sample = Math.abs(samples[i * blockSize + j] || 0);
          sum += sample;
          max = Math.max(max, sample);
        }
        // 使用RMS和峰值的组合来获得更好的视觉效果
        peaks[i] = Math.sqrt(sum / blockSize) * 0.7 + max * 0.3;
      }
      
      setWaveformData({
        peaks,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate
      });
      
      audioContext.close();
    } catch (error) {
      console.error('Failed to generate waveform:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 当音频文件改变时生成波形
  useEffect(() => {
    if (audioFile) {
      generateWaveform(audioFile);
    } else {
      setWaveformData(null);
    }
  }, [audioFile, generateWaveform]);

  // 初始化 canvas 尺寸
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // 只在尺寸变化时才重新设置 canvas 尺寸
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(dpr, dpr);
    }
  }, []);

  // 绘制静态波形（不包含动态元素）
  const drawStaticWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData) return;

    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const { peaks } = waveformData;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制背景网格
    ctx.strokeStyle = theme.colors.border;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 2]);
    
    // 垂直网格线（每10秒）
    if (duration > 0) {
      for (let time = 0; time <= duration; time += 10) {
        const x = (time / duration) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }
    
    // 水平中线
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    ctx.setLineDash([]);

    // 绘制波形
    ctx.strokeStyle = theme.colors.primary;
    ctx.fillStyle = `${theme.colors.primary}30`;
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let i = 0; i < peaks.length; i++) {
      const x = (i / peaks.length) * width;
      const amplitude = peaks[i] * (height / 2) * 0.8;
      const y = height / 2 - amplitude;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    // 绘制上半部分
    ctx.stroke();
    
    // 绘制下半部分（镜像）
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    
    for (let i = 0; i < peaks.length; i++) {
      const x = (i / peaks.length) * width;
      const amplitude = peaks[i] * (height / 2) * 0.8;
      const y = height / 2 + amplitude;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();

    // 绘制歌词时间标记
    lyrics.forEach(line => {
      if (duration > 0) {
        const x = (line.time / duration) * width;
        const singerColor = getSingerColor(line.segments[0]?.singer, theme.colors.accent);
        
        ctx.strokeStyle = singerColor;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height - 20);
        ctx.stroke();
        
        // 绘制小圆点
        ctx.fillStyle = singerColor;
        ctx.beginPath();
        ctx.arc(x, 10, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }, [waveformData, currentTime, duration, lyrics]);

  // 绘制动态元素（播放位置）
  const drawDynamicElements = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData || duration <= 0) return;

    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // 先重绘静态波形
    drawStaticWaveform();

    // 绘制当前播放位置
    const currentX = (currentTime / duration) * width;
    ctx.strokeStyle = theme.colors.secondary;
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.moveTo(currentX, 0);
    ctx.lineTo(currentX, height);
    ctx.stroke();
    
    // 绘制播放头
    ctx.fillStyle = theme.colors.secondary;
    ctx.beginPath();
    ctx.arc(currentX, height / 2, 6, 0, 2 * Math.PI);
    ctx.fill();
  }, [waveformData, currentTime, duration, drawStaticWaveform]);

  // 初始化 canvas
  useEffect(() => {
    initializeCanvas();
  }, [initializeCanvas]);

  // 绘制静态波形（当波形数据或歌词改变时）
  useEffect(() => {
    if (waveformData) {
      initializeCanvas();
      drawStaticWaveform();
    }
  }, [waveformData, lyrics, duration, initializeCanvas, drawStaticWaveform]);

  // 只更新动态元素（播放位置）
  useEffect(() => {
    if (waveformData && duration > 0) {
      drawDynamicElements();
    }
  }, [currentTime, drawDynamicElements]);

  // 处理画布点击
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!duration || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickTime = (x / rect.width) * duration;
    
    onTimeClick(Math.max(0, Math.min(duration, clickTime)));
  }, [duration, onTimeClick]);

  // 格式化时间标签
  const formatTimeLabel = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // 生成时间标签
  const generateTimeLabels = useCallback(() => {
    if (!duration || duration === 0) return [];
    
    const labels = [];
    const interval = duration > 300 ? 60 : duration > 60 ? 30 : 10; // 根据总时长调整间隔
    
    for (let time = 0; time <= duration; time += interval) {
      labels.push({
        time,
        position: (time / duration) * 100,
        label: formatTimeLabel(time)
      });
    }
    
    return labels;
  }, [duration, formatTimeLabel]);

  return (
    <WaveformContainer ref={containerRef}>
      <Canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ width: '100%', height: '100%' }}
      />
      
      <TimeLabels>
        {generateTimeLabels().map(({ time, position, label }) => (
          <TimeLabel key={time} $left={position}>
            {label}
          </TimeLabel>
        ))}
      </TimeLabels>
      
      {isLoading && (
        <LoadingOverlay>
          正在生成波形...
        </LoadingOverlay>
      )}
      
      {!audioFile && !isLoading && (
        <LoadingOverlay>
          请选择音频文件
        </LoadingOverlay>
      )}
    </WaveformContainer>
  );
};

AudioWaveform.displayName = 'AudioWaveform';
