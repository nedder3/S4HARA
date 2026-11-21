/**
 * Repository Pattern (Dependency Inversion Principle - SOLID DIP)
 * Decouples domain state persistence from browser localStorage so unit/integration tests
 * can swap in an InMemoryStateRepository with zero browser dependencies.
 */
export interface IStateRepository {
  load<T>(key: string, fallback: T): T;
  save<T>(key: string, value: T): void;
  remove(key: string): void;
}

export class LocalStorageRepository implements IStateRepository {
  private readonly prefix: string;

  constructor(prefix = 'S4HARA_SAP_UTN_V2') {
    this.prefix = prefix;
  }

  private fullKey(key: string): string {
    return `${this.prefix}_${key}`;
  }

  load<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(this.fullKey(key));
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  save<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(this.fullKey(key), JSON.stringify(value));
    } catch {
      // Ignore quota exceeded / private browsing errors gracefully
    }
  }

  remove(key: string): void {
    try {
      window.localStorage.removeItem(this.fullKey(key));
    } catch {
      // No-op
    }
  }
}

export class InMemoryStateRepository implements IStateRepository {
  private readonly store = new Map<string, string>();

  load<T>(key: string, fallback: T): T {
    const raw = this.store.get(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  }

  save<T>(key: string, value: T): void {
    this.store.set(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.store.delete(key);
  }
}
