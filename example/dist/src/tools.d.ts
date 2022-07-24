export declare type Void = undefined | null;
export declare type Maybe<T> = T | Void;
export declare function isDefined<T>(value: T | undefined | null): value is T;
export declare function isNotDefined<T>(value: T | undefined | null): value is Void;
