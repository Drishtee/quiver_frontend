/**
 * Audio Storage Service
 * Handles persistent storage of audio recordings using IndexedDB
 */

const DB_NAME = 'quiver_voice_recordings';
const DB_VERSION = 1;
const STORE_NAME = 'recordings';

interface StoredRecording {
  id: string;
  blob: Blob;
  timestamp: string;
  duration: number;
  transcript?: string;
  sessionId?: string;
  screen?: string;
  uploaded: boolean;
}

class AudioStorageService {
  private db: IDBDatabase | null = null;
  private dbReady: Promise<void>;

  constructor() {
    this.dbReady = this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('sessionId', 'sessionId', { unique: false });
          store.createIndex('uploaded', 'uploaded', { unique: false });
        }
      };
    });
  }

  private async getStore(mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    await this.dbReady;
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const transaction = this.db.transaction(STORE_NAME, mode);
    return transaction.objectStore(STORE_NAME);
  }

  /**
   * Save a recording to IndexedDB
   */
  async saveRecording(recording: {
    id: string;
    blob: Blob;
    timestamp: Date;
    duration: number;
    transcript?: string;
    sessionId?: string;
    screen?: string;
  }): Promise<void> {
    const store = await this.getStore('readwrite');

    const storedRecording: StoredRecording = {
      id: recording.id,
      blob: recording.blob,
      timestamp: recording.timestamp.toISOString(),
      duration: recording.duration,
      transcript: recording.transcript,
      sessionId: recording.sessionId,
      screen: recording.screen,
      uploaded: false
    };

    return new Promise((resolve, reject) => {
      const request = store.put(storedRecording);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a recording by ID
   */
  async getRecording(id: string): Promise<StoredRecording | null> {
    const store = await this.getStore('readonly');

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all recordings
   */
  async getAllRecordings(): Promise<StoredRecording[]> {
    const store = await this.getStore('readonly');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get recordings by session ID
   */
  async getRecordingsBySession(sessionId: string): Promise<StoredRecording[]> {
    const store = await this.getStore('readonly');
    const index = store.index('sessionId');

    return new Promise((resolve, reject) => {
      const request = index.getAll(sessionId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get recordings that haven't been uploaded
   */
  async getPendingUploads(): Promise<StoredRecording[]> {
    const store = await this.getStore('readonly');
    const index = store.index('uploaded');

    return new Promise((resolve, reject) => {
      const request = index.getAll(false);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark a recording as uploaded
   */
  async markAsUploaded(id: string): Promise<void> {
    const recording = await this.getRecording(id);
    if (!recording) return;

    recording.uploaded = true;
    const store = await this.getStore('readwrite');

    return new Promise((resolve, reject) => {
      const request = store.put(recording);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a recording
   */
  async deleteRecording(id: string): Promise<void> {
    const store = await this.getStore('readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete all recordings
   */
  async clearAllRecordings(): Promise<void> {
    const store = await this.getStore('readwrite');

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete recordings older than specified days
   */
  async deleteOldRecordings(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const all = await this.getAllRecordings();
    let deleted = 0;

    for (const recording of all) {
      if (new Date(recording.timestamp) < cutoffDate) {
        await this.deleteRecording(recording.id);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Get total storage used by recordings (in bytes)
   */
  async getStorageUsed(): Promise<number> {
    const all = await this.getAllRecordings();
    return all.reduce((total, rec) => total + rec.blob.size, 0);
  }

  /**
   * Export a recording as a downloadable file
   */
  async downloadRecording(id: string, filename?: string): Promise<void> {
    const recording = await this.getRecording(id);
    if (!recording) {
      throw new Error('Recording not found');
    }

    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `recording_${recording.id}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export all recordings as a zip (requires JSZip library)
   */
  async exportAllAsZip(): Promise<Blob> {
    const recordings = await this.getAllRecordings();

    // Simple implementation - creates a tar-like blob
    // For production, consider using JSZip library
    const files: { name: string; data: Blob }[] = recordings.map((rec, i) => ({
      name: `recording_${i + 1}_${new Date(rec.timestamp).toISOString().replace(/[:.]/g, '-')}.wav`,
      data: rec.blob
    }));

    // Create a metadata JSON
    const metadata = JSON.stringify(
      recordings.map(rec => ({
        id: rec.id,
        timestamp: rec.timestamp,
        duration: rec.duration,
        transcript: rec.transcript,
        sessionId: rec.sessionId,
        screen: rec.screen
      })),
      null,
      2
    );

    const metadataBlob = new Blob([metadata], { type: 'application/json' });
    files.push({ name: 'metadata.json', data: metadataBlob });

    // For now, just return the first recording or metadata
    // In production, use a proper zip library
    return metadataBlob;
  }
}

// Singleton instance
export const audioStorage = new AudioStorageService();

export default audioStorage;
