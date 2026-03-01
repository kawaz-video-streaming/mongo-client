export class DatabaseConnectionError extends Error {
    constructor(message: string) {
        super(`Database connection error:\n${message}`);
    }
}