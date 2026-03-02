import { z } from "zod";

export interface MongoConfig {
    mongoConnectionString: string;
    mongoConnectionTimeoutMS: number;
}

const mongoEnvSchema = z.object({
    MONGO_CONNECTION_STRING: z.url(),
    MONGO_CONNECTION_TIMEOUT_MS: z.coerce.number().default(5000)
});

export const createMongoConfig = (): MongoConfig => {
    const parsedEnv = mongoEnvSchema.parse(process.env);
    return {
        mongoConnectionString: parsedEnv.MONGO_CONNECTION_STRING,
        mongoConnectionTimeoutMS: parsedEnv.MONGO_CONNECTION_TIMEOUT_MS
    };
};