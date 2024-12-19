export type StoreSubscriber<T> = (state: T) => void;
export type StoreUnsubscribe = () => void;
