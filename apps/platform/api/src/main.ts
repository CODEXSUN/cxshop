import { createApp } from "./app";
const { app, config } = await createApp();
await app.listen({ host: "0.0.0.0", port: config.API_PORT });
