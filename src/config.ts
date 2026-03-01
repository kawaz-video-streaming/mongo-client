import Joi from "joi";

export interface MongoConfig {
    mongoConnectionString: string;
    mongoConnectionTimeoutMS: number;
}

interface MongoEnv {
    MONGO_CONNECTION_STRING: string;
    MONGO_CONNECTION_TIMEOUT_MS: number;
}

const mongoEnvSchema = Joi.object<MongoEnv>({
    MONGO_CONNECTION_STRING: Joi.string().uri().required(),
    MONGO_CONNECTION_TIMEOUT_MS: Joi.number().default(5000)
});

export const createMongoConfig = (): MongoConfig => {
    const { error, value } = mongoEnvSchema.validate(process.env, { allowUnknown: true });
    if (error) {
        throw new Error(`Invalid MongoDB configuration: ${error.message}`);
    }
    return {
        mongoConnectionString: value.MONGO_CONNECTION_STRING,
        mongoConnectionTimeoutMS: value.MONGO_CONNECTION_TIMEOUT_MS
    };
};