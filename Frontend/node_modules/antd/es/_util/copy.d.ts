declare function copy(text: string, config?: {
    format?: 'text/plain' | 'text/html';
}): Promise<boolean>;
export default copy;
