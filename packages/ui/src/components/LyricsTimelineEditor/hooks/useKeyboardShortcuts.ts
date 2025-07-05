import { useEffect } from 'react';
import type { KeyboardShortcuts } from '../types';

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 防止在输入框中触发快捷键
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
        // 只允许部分快捷键在输入框中工作
        if (event.ctrlKey || event.metaKey) {
          switch (event.key.toLowerCase()) {
            case 's':
              event.preventDefault();
              shortcuts.onSave();
              return;
            case 't':
              event.preventDefault();
              shortcuts.onInsertLyric();
              return;
          }
        }
        return;
      }

      // 处理快捷键
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 's':
            event.preventDefault();
            shortcuts.onSave();
            break;
          case 't':
            event.preventDefault();
            shortcuts.onInsertLyric();
            break;
          case 'z':
            if (event.shiftKey && shortcuts.onRedo) {
              event.preventDefault();
              shortcuts.onRedo();
            } else if (shortcuts.onUndo) {
              event.preventDefault();
              shortcuts.onUndo();
            }
            break;
          case 'a':
            if (shortcuts.onSelectAll) {
              event.preventDefault();
              shortcuts.onSelectAll();
            }
            break;
          case 'w':
          case 'q':
            event.preventDefault();
            shortcuts.onClose();
            break;
          case 'arrowleft':
            // Ctrl+Left: 精细调整 (-0.01秒)
            if (shortcuts.onTimeAdjust) {
              event.preventDefault();
              shortcuts.onTimeAdjust('left', 'fine');
            }
            break;
          case 'arrowright':
            // Ctrl+Right: 精细调整 (+0.01秒)
            if (shortcuts.onTimeAdjust) {
              event.preventDefault();
              shortcuts.onTimeAdjust('right', 'fine');
            }
            break;
          case 'r':
            // Ctrl+R: 修改当前行歌手
            if (shortcuts.onEditCurrentSinger) {
              event.preventDefault();
              shortcuts.onEditCurrentSinger();
            }
            break;
          case 'enter':
            // Ctrl+Enter: 编辑当前行歌词
            if (shortcuts.onEditCurrentLine) {
              event.preventDefault();
              shortcuts.onEditCurrentLine();
            }
            break;
        }
      } else if (event.shiftKey) {
        switch (event.key) {
          case 'ArrowLeft':
            // Shift+Left: 粗调整 (-1秒)
            if (shortcuts.onTimeAdjust) {
              event.preventDefault();
              shortcuts.onTimeAdjust('left', 'coarse');
            }
            break;
          case 'ArrowRight':
            // Shift+Right: 粗调整 (+1秒)
            if (shortcuts.onTimeAdjust) {
              event.preventDefault();
              shortcuts.onTimeAdjust('right', 'coarse');
            }
            break;
          case 'ArrowUp':
            // Shift+Up: 选择上一行
            if (shortcuts.onSelectPrevious) {
              event.preventDefault();
              shortcuts.onSelectPrevious();
            }
            break;
          case 'ArrowDown':
            // Shift+Down: 选择下一行
            if (shortcuts.onSelectNext) {
              event.preventDefault();
              shortcuts.onSelectNext();
            }
            break;
        }
      } else {
        switch (event.key) {
          case ' ':
            // 空格键播放/暂停
            event.preventDefault();
            shortcuts.onPlayPause();
            break;
          case 'Escape':
            shortcuts.onClose();
            break;
          case 'Delete':
          case 'Backspace':
            if (shortcuts.onDelete) {
              event.preventDefault();
              shortcuts.onDelete();
            }
            break;
          case 'ArrowLeft':
            // Left: 普通调整 (-0.1秒)
            if (shortcuts.onTimeAdjust) {
              event.preventDefault();
              shortcuts.onTimeAdjust('left', 'normal');
            }
            break;
          case 'ArrowRight':
            // Right: 普通调整 (+0.1秒)
            if (shortcuts.onTimeAdjust) {
              event.preventDefault();
              shortcuts.onTimeAdjust('right', 'normal');
            }
            break;
          case 'ArrowUp':
            // Up: 选择上一行
            if (shortcuts.onSelectPrevious) {
              event.preventDefault();
              shortcuts.onSelectPrevious();
            }
            break;
          case 'ArrowDown':
            // Down: 选择下一行
            if (shortcuts.onSelectNext) {
              event.preventDefault();
              shortcuts.onSelectNext();
            }
            break;
        }
      }
    };

    // 添加事件监听器
    document.addEventListener('keydown', handleKeyDown);

    // 清理函数
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};
