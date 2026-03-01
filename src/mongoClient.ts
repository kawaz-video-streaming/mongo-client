import mongoose, { Connection, Model, Schema } from "mongoose";
import { MongoConfig } from "./config";
import { DatabaseConnectionError } from "./errors";

type ModelCollection = Model<any>[];

export class MongoClient {
    private connection: Connection;

    constructor(config: MongoConfig) {
        const { mongoConnectionString, mongoConnectionTimeoutMS } = config;
        this.connection = mongoose.createConnection(mongoConnectionString, { serverSelectionTimeoutMS: mongoConnectionTimeoutMS });
    }

    async ensureIndexes(models: ModelCollection): Promise<void> {
        await Promise.all(Object.values(models).map((model) => model.ensureIndexes()));
    }

    async start(): Promise<void> {
        const startTime = Date.now();

        await this.connection.asPromise().catch((error) => {
            throw new DatabaseConnectionError(error.message);
        });

        const endTime = Date.now();
        console.log(`MongoDB Client started successfully in ${endTime - startTime} ms`);
    }

    async stop(): Promise<void> {
        await this.connection.close();
    }

    createModel<T>(name: string, schema: Schema<T>): Model<T> {
        return this.connection.model<T>(name, schema);
    }
}

