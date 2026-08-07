import { bootstrapDatabase, migrateDatabase, seedDatabase } from "./lifecycle";
import { loadConfig } from "../config";
import { DatabaseProvider } from "../infrastructure/database";

const command = process.argv[2];
const config = loadConfig();

if (command === "bootstrap") {
  await bootstrapDatabase(config);
} else {
  const database = new DatabaseProvider(config.databaseUrl);
  try {
    if (command === "migrate") await migrateDatabase(database.connection);
    else if (command === "seed") await seedDatabase(database.connection, config);
    else throw new Error("Use bootstrap, migrate, or seed");
  } finally {
    await database.database.destroy();
  }
}
