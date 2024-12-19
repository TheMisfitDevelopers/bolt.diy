import type { WebContainer } from '@webcontainer/api';

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    webcontainer?: WebContainer;
    chatConfig?: {
      maxTokens: number;
      temperature: number;
      topP: number;
      streamChunkSize: number;
      maxConcurrentRequests: number;
    };
  }
}

interface Performance {
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}

export {};
