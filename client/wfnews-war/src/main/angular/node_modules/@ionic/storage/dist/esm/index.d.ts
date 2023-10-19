/** @hidden */
export declare const Drivers: {
    SecureStorage: string;
    IndexedDB: string;
    LocalStorage: string;
};
export interface StorageConfig {
    name?: string;
    version?: number;
    size?: number;
    storeName?: string;
    description?: string;
    driverOrder?: Driver[];
    dbKey?: string;
}
export declare type Database = any;
declare type Driver = any;
export declare class Storage {
    private _config;
    private _db;
    private _secureStorageDriver;
    /**
     * Create a new Storage instance using the order of drivers and any additional config
     * options to pass to LocalForage.
     *
     * Possible default driverOrder options are: ['indexeddb', 'localstorage'] and the
     * default is that exact ordering.
     *
     * When using Ionic Secure Storage (enterprise only), use ['ionicSecureStorage', 'indexeddb', 'localstorage'] to ensure
     * Secure Storage is used when available, or fall back to IndexedDB or LocalStorage on the web.
     */
    constructor(config?: StorageConfig);
    create(): Promise<Storage>;
    /**
     * Define a new Driver. Must be called before
     * initializing the database. Example:
     *
     * await storage.defineDriver(myDriver);
     * await storage.create();
     */
    defineDriver(driver: Driver): Promise<void>;
    /**
     * Get the name of the driver being used.
     * @returns Name of the driver
     */
    get driver(): string | null;
    private assertDb;
    /**
     * Get the value associated with the given key.
     * @param key the key to identify this value
     * @returns Returns a promise with the value of the given key
     */
    get(key: string): Promise<any>;
    /**
     * Set the value for the given key.
     * @param key the key to identify this value
     * @param value the value for this key
     * @returns Returns a promise that resolves when the key and value are set
     */
    set(key: string, value: any): Promise<any>;
    /**
     * Remove any value associated with this key.
     * @param key the key to identify this value
     * @returns Returns a promise that resolves when the value is removed
     */
    remove(key: string): Promise<any>;
    /**
     * Clear the entire key value store. WARNING: HOT!
     * @returns Returns a promise that resolves when the store is cleared
     */
    clear(): Promise<void>;
    /**
     * @returns Returns a promise that resolves with the number of keys stored.
     */
    length(): Promise<number>;
    /**
     * @returns Returns a promise that resolves with the keys in the store.
     */
    keys(): Promise<string[]>;
    /**
     * Iterate through each key,value pair.
     * @param iteratorCallback a callback of the form (value, key, iterationNumber)
     * @returns Returns a promise that resolves when the iteration has finished.
     */
    forEach(iteratorCallback: (value: any, key: string, iterationNumber: Number) => any): Promise<void>;
    setEncryptionKey(key: string): void;
}
export {};
