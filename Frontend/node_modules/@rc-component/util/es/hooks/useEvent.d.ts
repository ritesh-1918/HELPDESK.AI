declare function useEvent<T extends ((...args: any[]) => any) | undefined>(callback: T): undefined extends T ? (...args: Parameters<NonNullable<T>>) => ReturnType<NonNullable<T>> | undefined : T;
export default useEvent;
