// Core stores
export { logStore } from './logs';
export { workbenchStore, type ArtifactState } from './workbench';
export { chatStore } from './chat';
export { type FileMap, type File, type Folder } from './files';

// Store types
export type StoreSubscriber<T> = (state: T) => void;
export type StoreUnsubscribe = () => void;

// Constants
export const STORE_VERSION = '1.0.0';

// This ensures all stores are properly exported
