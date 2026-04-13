# mongo-client
Lightweight MongoDB client helper for Node.js services using Mongoose.

## Installation
```bash
npm i @ido_kawaz/mongo-client
```

## Environment Variables
- `MONGO_CONNECTION_STRING` (required): MongoDB connection URI.
- `MONGO_CONNECTION_TIMEOUT_MS` (optional): server selection timeout in milliseconds. Default is `5000`.

## Usage
```ts
import { MongoClient, Schema, createMongoConfig } from "@ido_kawaz/mongo-client";

type User = {
	email: string;
	createdAt: Date;
};

const config = createMongoConfig();
const mongoClient = new MongoClient(config);

const userSchema = new Schema<User>({
	email: { type: String, required: true, unique: true },
	createdAt: { type: Date, required: true },
});

async function bootstrap() {
	await mongoClient.start();

	const userModel = mongoClient.createModel<User>("User", userSchema);
	await mongoClient.ensureIndexes({ userModel });

	// Use your model or pass it into your DAL layer.
}

async function shutdown() {
	await mongoClient.stop();
}
```

## API
- `createMongoConfig()`: reads and validates MongoDB config from environment variables.
- `new MongoClient(config)`: creates a Mongoose connection wrapper.
- `start()`: opens and validates the MongoDB connection.
- `createModel<T>(name, schema)`: creates and returns a typed model.
- `ensureIndexes(models)`: ensures indexes for all provided models.
- `stop()`: closes the active MongoDB connection.

## Tests
```bash
npx jest --runInBand
```
