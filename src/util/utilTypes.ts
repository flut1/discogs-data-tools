
export type AnyFunc = (...args: Array<any>) => any;

export type TypedObjectKeys = <TInput>(input: TInput) => Array<keyof TInput>;

export type KeysOfType<T, V> = {
    [K in keyof T]: T[K] extends V ? K : never
}[keyof T];

export type KeysNotOfType<T, V> = {
    [K in keyof T]: T[K] extends V ? never : K
}[keyof T];

export type FilterProperties<T, V> = Pick<T, KeysOfType<T, V>>;

export type ExcludeProperties<T, V> = Pick<T, KeysNotOfType<T, V>>;
