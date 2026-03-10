# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build          # clean + tsc compile to dist/
npm run build:watch    # watch mode
npm test               # build + jest --runInBand
npm run package        # full clean rebuild + test + npm publish
```

To run a single test file:
```bash
npx jest --runInBand src/__tests__/config.test.ts
```

## Architecture

This is a small npm library (`@ido_kawaz/mongo-client`) that wraps Mongoose to provide a typed MongoDB connection helper.

**Core flow:**
1. `createMongoConfig()` — reads `MONGO_CONNECTION_STRING` and `MONGO_CONNECTION_TIMEOUT_MS` from env, validates with Zod, returns a `MongoConfig`.
2. `new MongoClient(config)` — creates a Mongoose `Connection` (not the default mongoose connection, uses `mongoose.createConnection`).
3. `mongoClient.start()` — awaits the connection, throws `DatabaseConnectionError` on failure.
4. `mongoClient.createModel<T>(name, schema)` — registers models on the isolated connection.
5. `mongoClient.ensureIndexes(models)` — accepts a `Record<string, Model<any>>` (not an array).
6. `Dal<T>` — abstract base class for data access layers; subclass it and inject a `Model<T>`.

**Key design detail:** `ensureIndexes` takes a `ModelCollection` (object map), not an array. All of mongoose's exports are re-exported from `index.ts`, so consumers import `Schema`, `Model`, etc. from this package directly.

**Build output:** `dist/` — TypeScript compiles to `dist/index.js` + `dist/index.d.ts`. Tests run against the compiled output (the `test` script runs `build` first).
