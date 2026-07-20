export interface AsyncKeyedCache<T> {
  has(key: string): boolean;
  get(key: string): T | undefined;
  getOrLoad(key: string, loader: () => T | Promise<T>): Promise<T>;
  delete(key: string): void;
}

export function createAsyncKeyedCache<T>(): AsyncKeyedCache<T>;
