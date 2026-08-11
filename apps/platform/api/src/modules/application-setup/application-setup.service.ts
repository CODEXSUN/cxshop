import { resolveEnabledApps, resolveLandingApp } from "../app-registry/app-registry.service.js";
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
}
