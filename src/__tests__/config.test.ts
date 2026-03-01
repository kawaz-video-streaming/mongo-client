import { createMongoConfig } from "../config";

describe("createMongoConfig", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        delete process.env.MONGO_CONNECTION_STRING;
        delete process.env.MONGO_CONNECTION_TIMEOUT_MS;
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it("returns parsed config when env vars are valid", () => {
        process.env.MONGO_CONNECTION_STRING = "mongodb://localhost:27017/my-db";
        process.env.MONGO_CONNECTION_TIMEOUT_MS = "7000";

        const config = createMongoConfig();

        expect(config).toEqual({
            mongoConnectionString: "mongodb://localhost:27017/my-db",
            mongoConnectionTimeoutMS: 7000,
        });
    });

    it("uses default timeout when timeout env var is missing", () => {
        process.env.MONGO_CONNECTION_STRING = "mongodb://localhost:27017/my-db";

        const config = createMongoConfig();

        expect(config.mongoConnectionTimeoutMS).toBe(5000);
    });

    it("throws when connection string is missing", () => {
        expect(() => createMongoConfig()).toThrow("Invalid MongoDB configuration");
    });

    it("throws when connection string is not a URI", () => {
        process.env.MONGO_CONNECTION_STRING = "not-a-uri";

        expect(() => createMongoConfig()).toThrow("Invalid MongoDB configuration");
    });
});
