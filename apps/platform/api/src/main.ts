import { createApp } from "./app";
import { loadConfig } from "./config";
import { bootstrapDatabase } from "./database/lifecycle";
import { preflightPort, startServer } from "./startup";

const config = loadConfig();
await preflightPort("0.0.0.0", config.API_PORT);
await bootstrapDatabase(config);
const { app } = await createApp();
await startServer(app, "0.0.0.0", config.API_PORT);
