import { createMongoConfig } from "../config";
import { ZodError } from "zod";

describe("createMongoConfig", () => {
    const originalEnv = process.env;

    const getZodError = (): ZodError => {
        try {
            createMongoConfig();
            throw new Error("Expected createMongoConfig to throw");
        } catch (error) {
            expect(error).toBeInstanceOf(ZodError);
            return error as ZodError;
        }
    };

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
        const error = getZodError();

        expect(error.issues[0]).toMatchObject({
            path: ["MONGO_CONNECTION_STRING"],
            message: "Invalid input: expected string, received undefined",
        });
    });

    it("throws when connection string is not a URI", () => {
        process.env.MONGO_CONNECTION_STRING = "not-a-uri";

        const error = getZodError();

        expect(error.issues[0]).toMatchObject({
            path: ["MONGO_CONNECTION_STRING"],
            message: "Invalid URL",
        });
    });

    it("throws with exact reason when timeout is not numeric", () => {
        process.env.MONGO_CONNECTION_STRING = "mongodb://localhost:27017/my-db";
        process.env.MONGO_CONNECTION_TIMEOUT_MS = "abc";

        const error = getZodError();

        expect(error.issues[0]).toMatchObject({
            path: ["MONGO_CONNECTION_TIMEOUT_MS"],
            message: "Invalid input: expected number, received NaN",
        });
    });
});
