import { resolveEnabledApps, resolveLandingApp } from "../app-registry/app-registry.service.js";
import { getDefaultCompanyBrandingForDatabase } from "@cxshop/core-api";
import { env } from "../../env.js";
import { ApplicationSetupRepository } from "./application-setup.repository.js";

export class ApplicationSetupService {
  constructor(private readonly repository = new ApplicationSetupRepository()) {}

  async runtime() {
    const application = await this.repository.get();
    const defaultLandingApp = resolveLandingApp(
      application.defaultLandingApp,
      application.enabledModuleKeys
    );
    return {
      application: { ...application, defaultLandingApp },
      apps: resolveEnabledApps(application.enabledModuleKeys).map((app) => ({
        alwaysEnabled: app.alwaysEnabled,
        defaultLanding: app.appId === defaultLandingApp,
        description: app.description,
        enabled: app.enabled,
        id: app.appId,
        label: app.label,
        moduleKey: app.moduleKey,
        stack: app.stack
      })),
      defaultLandingApp
    };
  }

  async publicBranding() {
    const company = await getDefaultCompanyBrandingForDatabase(env.DB_MASTER_NAME);
    const version = company?.updatedAt ? `?v=${encodeURIComponent(company.updatedAt)}` : "";
    const logoUrl = hasStoredLogo(company?.logoPath)
      ? `/api/platform/public/company-logo/logo${version}`
      : null;
    return {
      brandName: company?.legalName?.trim() || company?.name.trim() || "",
      logoDarkUrl: hasStoredLogo(company?.logoDarkPath)
        ? `/api/platform/public/company-logo/logo-dark${version}`
        : logoUrl,
      logoUrl
    };
  }
}

function hasStoredLogo(path: string | null | undefined) {
  return path?.startsWith("storage/") ?? false;
}
