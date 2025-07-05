/**
 * 音频文件缓存工具
 * 使用 IndexedDB 缓存音频文件，支持状态恢复
 */

interface CachedAudioFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  data: ArrayBuffer;
  cachedAt: number;
}

class AudioCacheManager {
  private dbName = 'TimelineEditorCache';
  private dbVersion = 1;
  private storeName = 'audioFiles';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'name' });
          store.createIndex('cachedAt', 'cachedAt', { unique: false });
        }
      };
    });
  }

  async cacheAudioFile(file: File): Promise<void> {
    if (!this.db) await this.init();

    const arrayBuffer = await file.arrayBuffer();
    const cachedFile: CachedAudioFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      data: arrayBuffer,
      cachedAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(cachedFile);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCachedAudioFile(fileName: string): Promise<File | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(fileName);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CachedAudioFile | undefined;
        if (result) {
          // 重建 File 对象
          const file = new File([result.data], result.name, {
            type: result.type,
            lastModified: result.lastModified
          });
          resolve(file);
        } else {
          resolve(null);
        }
      };
    });
  }

  async removeCachedAudioFile(fileName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(fileName);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCacheSize(): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const files = request.result as CachedAudioFile[];
        const totalSize = files.reduce((sum, file) => sum + file.data.byteLength, 0);
        resolve(totalSize);
      };
    });
  }
}

// 单例实例
export const audioCacheManager = new AudioCacheManager();

// 工具函数
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
