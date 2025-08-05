declare type Result = { status: 'completed' | 'failed'; [k: string]: unknown };

declare function isCompleted(r: Result): r is Result & { status: 'completed' };

declare function safeJson<T>(input: string): T;
