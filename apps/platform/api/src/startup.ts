import { createServer } from "node:net";
import type { FastifyInstance } from "fastify";

export async function preflightPort(host: string, port: number): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen({ host, port, exclusive: true }, () => server.close(error => error ? reject(error) : resolve()));
  });
  console.info(`[port.preflight] ${host}:${port} available`);
}

export async function startServer(app: FastifyInstance, host: string, port: number): Promise<string> {
  for (let attempt = 1; attempt <= 15; attempt += 1) {
    try {
      const address = await app.listen({ host, port });
      console.info(`[server.ready] ${address}`);
      return address;
    } catch (error) {
      if (!addressInUse(error) || attempt === 15) throw error;
      app.log.warn(`Port ${port} is in use. Retry ${attempt}/15.`);
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Unable to start API on ${host}:${port}`);
}

function addressInUse(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && (error as { code?: unknown }).code === "EADDRINUSE");
}
