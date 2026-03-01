import mongoose, { Schema } from "mongoose";
import { DatabaseConnectionError } from "../errors";
import { MongoClient } from "../mongoClient";

jest.mock("mongoose", () => ({
    __esModule: true,
    default: {
        createConnection: jest.fn(),
    },
}));

describe("MongoClient", () => {
    const mockedMongoose = mongoose as unknown as { createConnection: jest.Mock };

    const connectionMock = {
        asPromise: jest.fn(),
        close: jest.fn(),
        model: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedMongoose.createConnection.mockReturnValue(connectionMock);
    });

    it("creates a connection with config values", () => {
        const config = {
            mongoConnectionString: "mongodb://localhost:27017/test-db",
            mongoConnectionTimeoutMS: 4500,
        };

        new MongoClient(config);

        expect(mockedMongoose.createConnection).toHaveBeenCalledWith(config.mongoConnectionString, {
            serverSelectionTimeoutMS: config.mongoConnectionTimeoutMS,
        });
    });

    it("starts successfully when connection resolves", async () => {
        connectionMock.asPromise.mockResolvedValue(undefined);
        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);

        const client = new MongoClient({
            mongoConnectionString: "mongodb://localhost:27017/test-db",
            mongoConnectionTimeoutMS: 5000,
        });

        await expect(client.start()).resolves.toBeUndefined();
        expect(connectionMock.asPromise).toHaveBeenCalledTimes(1);

        consoleSpy.mockRestore();
    });

    it("throws DatabaseConnectionError when connection fails", async () => {
        connectionMock.asPromise.mockRejectedValue(new Error("connection refused"));

        const client = new MongoClient({
            mongoConnectionString: "mongodb://localhost:27017/test-db",
            mongoConnectionTimeoutMS: 5000,
        });

        await expect(client.start()).rejects.toBeInstanceOf(DatabaseConnectionError);
        await expect(client.start()).rejects.toThrow("connection refused");
    });

    it("creates models through the underlying connection", () => {
        const createdModel = { modelName: "User" };
        connectionMock.model.mockReturnValue(createdModel);

        const client = new MongoClient({
            mongoConnectionString: "mongodb://localhost:27017/test-db",
            mongoConnectionTimeoutMS: 5000,
        });

        const userSchema = {} as Schema<{ email: string }>;
        const result = client.createModel("User", userSchema);

        expect(connectionMock.model).toHaveBeenCalledWith("User", userSchema);
        expect(result).toBe(createdModel);
    });

    it("ensures indexes for all provided models", async () => {
        const modelA = { ensureIndexes: jest.fn().mockResolvedValue(undefined) };
        const modelB = { ensureIndexes: jest.fn().mockResolvedValue(undefined) };

        const client = new MongoClient({
            mongoConnectionString: "mongodb://localhost:27017/test-db",
            mongoConnectionTimeoutMS: 5000,
        });

        await client.ensureIndexes([modelA, modelB] as any);

        expect(modelA.ensureIndexes).toHaveBeenCalledTimes(1);
        expect(modelB.ensureIndexes).toHaveBeenCalledTimes(1);
    });

    it("stops by closing the connection", async () => {
        connectionMock.close.mockResolvedValue(undefined);

        const client = new MongoClient({
            mongoConnectionString: "mongodb://localhost:27017/test-db",
            mongoConnectionTimeoutMS: 5000,
        });

        await client.stop();

        expect(connectionMock.close).toHaveBeenCalledTimes(1);
    });
});
