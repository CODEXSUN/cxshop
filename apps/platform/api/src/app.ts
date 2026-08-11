import { createApiApp, registerHealthRoute, registerRequestLogging } from "@cxshop/framework/api";
import { registerModules } from "@cxshop/framework/modules";
import { createMailModule } from "@cxshop/mail-api";
import {
  billingApiModuleKeys,
  closeAllBillingDatabases,
  registerBillingApi
} from "@cxshop/billing-api";
import { closeCoreDatabase, coreApiModuleKeys, registerCoreApi } from "@cxshop/core-api";
import { AppError } from "@cxshop/framework/errors";
import type { FastifyRequest } from "fastify";
import type { HealthCheck } from "@cxshop/framework/health";
import { registerAuthRoutes } from "./auth/auth.routes.js";
import { appRegistryModule } from "./modules/app-registry/index.js";
import { tenantUserModule } from "./modules/tenant-user/index.js";
import { tenantRoleModule } from "./modules/tenant-role/index.js";
import { tenantPermissionModule } from "./modules/tenant-permission/index.js";
import { tenantUserRoleModule } from "./modules/tenant-user-role/index.js";
import { tenantRolePermissionModule } from "./modules/tenant-role-permission/index.js";
import { IndustryService, industryModule } from "./modules/industry/index.js";
import { accessControlModule } from "./modules/access-control/index.js";
import { platformActivityModule } from "./modules/platform-activity/index.js";
import { queueManagerModule } from "./modules/queue-manager/index.js";
import { storageManagerModule } from "./modules/storage-manager/index.js";
import { taskManagerModule } from "./modules/task-manager/index.js";
import { credentialRecoveryModule } from "./modules/credential-recovery/index.js";
import { appOrchestrationModule } from "./modules/app-orchestration/index.js";
import { startQueueManagerWorker } from "./modules/queue-manager/queue-manager.runtime.js";
import { QueueManagerService } from "./modules/queue-manager/queue-manager.service.js";
import { tenantAccessContext } from "./auth/tenant-access-context.js";
import { env } from "./env.js";
import { bootstrapPlatformDatabase, closePlatformDatabase } from "./database/platform-database.js";
import { closeAllTenantDatabases } from "./database/tenant-database.js";
import { registerAuthRequestContext } from "./auth/auth-request-context.js";
import { registerDevkitHost } from "./devkit-host.js";
import { devkitApiModuleKeys } from "@cxshop/devkit-api";
import {
  closeAllEcommerceDatabases,
  ecommerceApiModuleKeys,
  processSemanticCatalogMatch,
  registerEcommerceApi,
  semanticCatalogMatchJobName,
  startCatalogMatchingOutboxRelay
} from "@cxshop/ecommerce-api";
import { registerQueueJobHandler } from "./modules/queue-manager/queue-handler.registry.js";
import { applicationSetupModule } from "./modules/application-setup/index.js";
import { blogsApiModuleKeys, closeBlogsDatabase, registerBlogsApi } from "@cxshop/blogs-api";

export async function createApp() {
  console.info("[platform.boot] bootstrap started");
  await bootstrapPlatformDatabase();

  const app = await createApiApp({
    appName: "CODEXSUN Platform API",
    cookieSecret: env.JWT_SECRET,
    corsOrigins: await platformWebOrigins(),
    environment: env.NODE_ENV,
    shutdownHooks: [
      async () => {
        console.info("[shutdown] closing Blogs MariaDB pool");
        await closeBlogsDatabase();
      },
      async () => {
        console.info("[shutdown] closing Ecommerce MariaDB pools");
        await closeAllEcommerceDatabases();
      },
      async () => {
        console.info("[shutdown] closing Billing MariaDB pools");
        await closeAllBillingDatabases();
      },
      async () => {
        console.info("[shutdown] closing Core MariaDB pools");
        await closeCoreDatabase();
      },
      async () => {
        console.info("[shutdown] closing application MariaDB pools");
        await closeAllTenantDatabases();
      },
      async () => {
        console.info("[shutdown] closing platform MariaDB pools");
        await closePlatformDatabase();
      }
    ]
  });
  const queueService = new QueueManagerService();
  registerQueueJobHandler(semanticCatalogMatchJobName, (payload) =>
    processSemanticCatalogMatch(payload)
  );
  registerAuthRequestContext(app);
  await registerDevkitHost(app);
  console.info("[platform.routes] DevKit package ready");
  const mailModule = createMailModule({
    enqueue: (payload) => queueService.enqueue(payload),
    resolveContext: mailContext,
    secretKey: env.JWT_SECRET
  });

  const healthChecks: HealthCheck[] = [
    {
      name: "platform-api",
      check: () => ({
        details: {
          modules: [
            ...coreApiModuleKeys,
            ...billingApiModuleKeys,
            ...devkitApiModuleKeys,
            ...ecommerceApiModuleKeys,
            ...blogsApiModuleKeys,
            appRegistryModule.key,
            applicationSetupModule.key,
            tenantUserModule.key,
            tenantRoleModule.key,
            tenantPermissionModule.key,
            tenantUserRoleModule.key,
            tenantRolePermissionModule.key,
            industryModule.key,
            accessControlModule.key,
            platformActivityModule.key,
            queueManagerModule.key,
            credentialRecoveryModule.key,
            storageManagerModule.key,
            taskManagerModule.key,
            appOrchestrationModule.key,
            mailModule.key
          ],
          runtime: "platform-foundation"
        },
        status: "ok"
      })
    }
  ];

  registerRequestLogging(app);
  registerHealthRoute(app, healthChecks);
  app.get("/public/runtime-config", async () => ({
    data: {
      VITE_DEV_AUTO_TENANT_LOGIN: env.DEV_AUTO_TENANT_LOGIN,
      VITE_PLATFORM_API_URL: "/api/platform",
      VITE_TENANT_NAME: env.DEFAULT_TENANT_NAME
    },
    success: true
  }));
  console.info("[platform.routes] health ready");
  await registerAuthRoutes(app);
  console.info("[platform.routes] auth ready");
  const industryService = new IndustryService();
  await registerCoreApi(app, {
    resolveIndustryName: (industryId) => industryService.resolveActiveIndustryName(industryId)
  });
  console.info("[platform.routes] Core package ready");
  await registerBillingApi(app);
  console.info("[platform.routes] Billing package ready");
  await registerEcommerceApi(app);
  startCatalogMatchingOutboxRelay(app, (payload) => queueService.enqueue(payload));
  console.info("[platform.routes] Ecommerce package ready");
  await registerBlogsApi(app);
  console.info("[platform.routes] Blogs package ready");
  await registerModules(
    [
      appRegistryModule,
      applicationSetupModule,
      tenantUserModule,
      tenantRoleModule,
      tenantPermissionModule,
      tenantUserRoleModule,
      tenantRolePermissionModule,
      industryModule,
      accessControlModule,
      platformActivityModule,
      queueManagerModule,
      credentialRecoveryModule,
      storageManagerModule,
      taskManagerModule,
      appOrchestrationModule,
      mailModule
    ],
    { app },
    {
      onRegister: (module) => console.info(`[module.register] ${module.key}`),
      onReady: (module) => console.info(`[module.ready] ${module.key}`)
    }
  );
  startQueueManagerWorker(app, queueService);
  console.info("[platform.worker] queue manager ready");
  console.info("[platform.boot] bootstrap completed");

  return app;
}

async function platformWebOrigins() {
  const configuredOrigins = [env.PLATFORM_WEB_ORIGIN];
  if (env.NODE_ENV !== "production") {
    configuredOrigins.push(
      `http://127.0.0.1:${env.PLATFORM_WEB_PORT}`,
      `http://localhost:${env.PLATFORM_WEB_PORT}`
    );
  }

  return Array.from(
    new Set(
      configuredOrigins
        .map((origin) => origin.trim())
        .filter(Boolean)
        .flatMap(localOriginAliases)
        .map((origin) => origin.trim().replace(/\/$/u, ""))
    )
  );
}

function localOriginAliases(origin: string) {
  const origins = [origin];
  const url = new URL(origin);
  if (url.hostname === "localhost") {
    url.hostname = "127.0.0.1";
    origins.push(url.origin);
  } else if (url.hostname === "127.0.0.1") {
    url.hostname = "localhost";
    origins.push(url.origin);
  }
  return origins;
}

async function mailContext(request: FastifyRequest) {
  const context = tenantAccessContext(request);
  const header = request.headers["x-company-id"];
  const companyId = Number(Array.isArray(header) ? header[0] : header);
  if (!Number.isInteger(companyId) || companyId <= 0) {
    throw AppError.validation("x-company-id is required for Mail access.");
  }
  return { ...context, companyId, database: context.database as never };
}
