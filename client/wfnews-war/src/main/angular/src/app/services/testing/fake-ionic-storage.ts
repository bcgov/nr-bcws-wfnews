import { IonicStorageService } from '../ionic-storage.service';

/** An in-memory Ionic Storage. create() settles only when `ready` settles. */
export class FakeIonicStorage {
  readonly data = new Map<string, unknown>();

  constructor(private ready: Promise<void> = Promise.resolve()) {}

  async create() {
    await this.ready;
    return this;
  }

  async get(key: string) {
    return this.data.has(key) ? structuredClone(this.data.get(key)) : null;
  }

  async set(key: string, value: unknown) {
    // A copy, as IndexedDB keeps one: a later change to `value` must not reach the store.
    this.data.set(key, structuredClone(value));
    return value;
  }

  async remove(key: string) {
    this.data.delete(key);
  }
}

export function ionicStorageOver(fake: FakeIonicStorage): IonicStorageService {
  return new IonicStorageService(fake as any);
}

/** The error a promise rejects with. @types/jasmine 3.6 has no expectAsync. */
export async function rejectionOf(promise: Promise<unknown>): Promise<Error> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error('Expected the promise to reject');
}
