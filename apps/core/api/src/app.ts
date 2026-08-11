import { requireApplicationAccess } from "@cxshop/framework/api";
import type { FastifyInstance } from "fastify";
import { authorizeCoreRequest } from "./auth/tenant-permission.js";
import { bootstrapCoreDatabase, resolveCoreDatabaseName } from "./database/core-database.js";
import { env } from "./env.js";
import { commonModule } from "./modules/common/index.js";
import { locationModules } from "./modules/common/location/location.module.js";
import { masterModule } from "./modules/master/index.js";
import { organisationModule } from "./modules/organisation/index.js";
import type { CompanyIndustryNameResolver } from "./modules/organisation/index.js";

export type CoreApiDependencies = {
  resolveIndustryName: CompanyIndustryNameResolver;
};

export const coreApiModuleKeys = [
  commonModule.key,
  organisationModule.key,
  masterModule.key,
  ...locationModules.map((module) => module.key)
];

export async function registerCoreApi(app: FastifyInstance, dependencies: CoreApiDependencies) {
  await app.register(async (coreApp) => {
    coreApp.addHook("preHandler", async (request) => {
      const applicationDatabase = resolveCoreDatabaseName(undefined);
      const claims = requireApplicationAccess({
        applicationDatabase,
        authorization: request.headers.authorization,
        secret: env.JWT_SECRET
      });
      await bootstrapCoreDatabase(applicationDatabase);
      await authorizeCoreRequest(request, applicationDatabase, claims.email ?? "");
    });
    await commonModule.register(coreApp);
    await organisationModule.register(coreApp, dependencies.resolveIndustryName);
    await masterModule.register(coreApp);
  });
}
