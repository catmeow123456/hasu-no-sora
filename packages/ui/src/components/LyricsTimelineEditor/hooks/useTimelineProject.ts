import { useState, useCallback, useRef, useEffect } from 'react';
import type { TimelineProject, EditableLyricLine, TimelineProjectHook } from '../types';

const createDefaultProject = (initialProject?: Partial<TimelineProject>): TimelineProject => ({
  id: `project_${Date.now()}`,
  name: initialProject?.name || '新建歌词项目',
  audioFile: initialProject?.audioFile || null,
  lyrics: initialProject?.lyrics || [],
  settings: {
    autoSave: true,
    snapToGrid: false,
    gridInterval: 100,
    defaultSinger: undefined,
    enableAIAssist: false,
    ...initialProject?.settings
  },
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0.0',
    author: undefined,
    description: undefined,
    ...initialProject?.metadata
  }
});

export const useTimelineProject = (initialProject?: Partial<TimelineProject>): TimelineProjectHook => {
  const [project, setProject] = useState<TimelineProject>(() => 
    createDefaultProject(initialProject)
  );
  const [isDirty, setIsDirty] = useState(false);
  const originalProjectRef = useRef<TimelineProject>(project);

  // 更新项目
  const updateProject = useCallback((updates: Partial<TimelineProject>) => {
    setProject(prev => ({
      ...prev,
      ...updates,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }));
    setIsDirty(true);
  }, []);

  // 添加歌词行
  const addLyricLine = useCallback((line: EditableLyricLine) => {
    setProject(prev => {
      // 按时间排序插入
      const newLyrics = [...prev.lyrics, line].sort((a, b) => a.time - b.time);
      
      // 清除其他行的选中状态
      const updatedLyrics = newLyrics.map(l => ({
        ...l,
        isSelected: l.id === line.id
      }));

      return {
        ...prev,
        lyrics: updatedLyrics,
        metadata: {
          ...prev.metadata,
          updatedAt: new Date()
        }
      };
    });
    setIsDirty(true);
  }, []);

  // 更新歌词行
  const updateLyricLine = useCallback((id: string, updates: Partial<EditableLyricLine>) => {
    setProject(prev => {
      const updatedLyrics = prev.lyrics.map(line => 
        line.id === id 
          ? { ...line, ...updates, isDraft: false }
          : line
      );

      // 如果更新了时间，重新排序
      if (updates.time !== undefined) {
        updatedLyrics.sort((a, b) => a.time - b.time);
      }

      return {
        ...prev,
        lyrics: updatedLyrics,
        metadata: {
          ...prev.metadata,
          updatedAt: new Date()
        }
      };
    });
    setIsDirty(true);
  }, []);

  // 删除歌词行
  const deleteLyricLine = useCallback((id: string) => {
    setProject(prev => ({
      ...prev,
      lyrics: prev.lyrics.filter(line => line.id !== id),
      metadata: {
        ...prev.metadata,
        updatedAt: new Date()
      }
    }));
    setIsDirty(true);
  }, []);

  // 选择歌词行
  const selectLyricLine = useCallback((id: string) => {
    setProject(prev => ({
      ...prev,
      lyrics: prev.lyrics.map(line => ({
        ...line,
        isSelected: line.id === id
      }))
    }));
  }, []);

  // 选择下一行
  const selectNextLine = useCallback(() => {
    setProject(prev => {
      const currentIndex = prev.lyrics.findIndex(line => line.isSelected);
      if (currentIndex === -1 || currentIndex >= prev.lyrics.length - 1) {
        return prev; // 没有选中行或已经是最后一行
      }
      
      const nextIndex = currentIndex + 1;
      return {
        ...prev,
        lyrics: prev.lyrics.map((line, index) => ({
          ...line,
          isSelected: index === nextIndex
        }))
      };
    });
  }, []);

  // 选择上一行
  const selectPreviousLine = useCallback(() => {
    setProject(prev => {
      const currentIndex = prev.lyrics.findIndex(line => line.isSelected);
      if (currentIndex <= 0) {
        return prev; // 没有选中行或已经是第一行
      }
      
      const prevIndex = currentIndex - 1;
      return {
        ...prev,
        lyrics: prev.lyrics.map((line, index) => ({
          ...line,
          isSelected: index === prevIndex
        }))
      };
    });
  }, []);

  // 调整选中行的时间
  const adjustSelectedLineTime = useCallback((direction: 'left' | 'right', precision: 'fine' | 'normal' | 'coarse') => {
    const adjustmentMap = {
      fine: 0.01,     // 精细调整: ±0.01秒
      normal: 0.1,    // 普通调整: ±0.1秒
      coarse: 1.0     // 粗调整: ±1秒
    };
    
    const adjustment = adjustmentMap[precision] * (direction === 'right' ? 1 : -1);
    
    setProject(prev => {
      const selectedLine = prev.lyrics.find(line => line.isSelected);
      if (!selectedLine) return prev;
      
      const newTime = Math.max(0, selectedLine.time + adjustment);
      
      // 检查时间约束，确保不与其他行重叠
      const otherLines = prev.lyrics.filter(line => line.id !== selectedLine.id);
      const prevLine = otherLines.filter(line => line.time < newTime).sort((a, b) => b.time - a.time)[0];
      const nextLine = otherLines.filter(line => line.time > newTime).sort((a, b) => a.time - b.time)[0];
      
      const minTime = prevLine ? prevLine.time + 0.01 : 0;
      const maxTime = nextLine ? nextLine.time - 0.01 : Infinity;
      const constrainedTime = Math.max(minTime, Math.min(maxTime, newTime));
      
      const updatedLyrics = prev.lyrics.map(line => 
        line.id === selectedLine.id 
          ? { 
              ...line, 
              time: constrainedTime,
              originalTime: formatTime(constrainedTime)
            }
          : line
      );

      // 重新排序
      updatedLyrics.sort((a, b) => a.time - b.time);

      return {
        ...prev,
        lyrics: updatedLyrics,
        metadata: {
          ...prev.metadata,
          updatedAt: new Date()
        }
      };
    });
    setIsDirty(true);
  }, []);

  // 批量调整选中行的时间偏移
  const batchAdjustTime = useCallback((offset: number) => {
    setProject(prev => {
      const selectedLines = prev.lyrics.filter(line => line.isSelected);
      if (selectedLines.length === 0) return prev;
      
      const updatedLyrics = prev.lyrics.map(line => {
        if (line.isSelected) {
          const newTime = Math.max(0, line.time + offset);
          return {
            ...line,
            time: newTime,
            originalTime: formatTime(newTime)
          };
        }
        return line;
      });

      // 重新排序
      updatedLyrics.sort((a, b) => a.time - b.time);

      return {
        ...prev,
        lyrics: updatedLyrics,
        metadata: {
          ...prev.metadata,
          updatedAt: new Date()
        }
      };
    });
    setIsDirty(true);
  }, []);

  // 格式化时间
  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  }, []);

  // 保存项目
  const saveProject = useCallback(async () => {
    try {
      // 创建一个可序列化的项目副本，排除 File 对象
      const serializableProject = {
        ...project,
        audioFile: project.audioFile instanceof File ? {
          name: project.audioFile.name,
          size: project.audioFile.size,
          type: project.audioFile.type,
          lastModified: project.audioFile.lastModified
        } : project.audioFile
      };
      
      const projectData = JSON.stringify(serializableProject);
      localStorage.setItem(`timeline_project_${project.id}`, projectData);
      
      originalProjectRef.current = { ...project };
      setIsDirty(false);
      
      console.log('Project saved successfully');
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  }, [project]);

  // 加载项目
  const loadProject = useCallback(async (projectId: string) => {
    try {
      const projectData = localStorage.getItem(`timeline_project_${projectId}`);
      if (projectData) {
        const loadedProject = JSON.parse(projectData) as TimelineProject;
        
        // 转换日期字符串回 Date 对象
        loadedProject.metadata.createdAt = new Date(loadedProject.metadata.createdAt);
        loadedProject.metadata.updatedAt = new Date(loadedProject.metadata.updatedAt);
        
        setProject(loadedProject);
        originalProjectRef.current = loadedProject;
        setIsDirty(false);
        
        console.log('Project loaded successfully');
      } else {
        throw new Error('Project not found');
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      throw error;
    }
  }, []);

  // 自动保存
  useEffect(() => {
    if (project.settings.autoSave && isDirty) {
      const autoSaveTimer = setTimeout(() => {
        saveProject().catch(console.error);
      }, 5000); // 5秒后自动保存

      return () => clearTimeout(autoSaveTimer);
    }
  }, [project.settings.autoSave, isDirty, saveProject]);

  return {
    project,
    updateProject,
    addLyricLine,
    updateLyricLine,
    deleteLyricLine,
    selectLyricLine,
    selectNextLine,
    selectPreviousLine,
    adjustSelectedLineTime,
    batchAdjustTime,
    saveProject,
    loadProject,
    isDirty
  };
};
