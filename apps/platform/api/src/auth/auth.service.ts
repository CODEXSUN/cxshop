import { randomUUID } from "node:crypto";
import { sql } from "kysely";
import { getTenantDatabaseByName } from "../database/tenant-database.js";
import { env } from "../env.js";
import { ApplicationSetupRepository } from "../modules/application-setup/application-setup.repository.js";
import { CredentialRecoveryRepository } from "../modules/credential-recovery/index.js";
import {
  AuthSessionRepository,
  emptySessionCache,
  type TenantSessionCache
} from "./auth-session.repository.js";
import { signAuthToken, type AuthUserType } from "./jwt.js";
import { hashPassword, passwordNeedsRehash, verifyPassword } from "./password-hash.js";

const credentialRepository = new CredentialRecoveryRepository();
const sessionRepository = new AuthSessionRepository();
const setupRepository = new ApplicationSetupRepository();

export class AuthService {
  async login(input: LoginInput) {
    const desk = normalizeDesk(input.desk);
    const email = input.email?.trim().toLowerCase() ?? "";
    const password = input.password ?? "";
    const loginHost = normalizeHost(input.domain ?? "");
    if (!email || !password || !loginHost) return null;
    return desk === "tenant"
      ? this.loginApplicationUser({ email, loginHost, password })
      : this.loginPlatformUser({ desk, email, loginHost, password });
  }

  private async loginApplicationUser(input: {
    email: string;
    loginHost: string;
    password: string;
  }) {
    const database = getTenantDatabaseByName(env.DB_MASTER_NAME);
    const user = await database
      .selectFrom("app_users")
      .selectAll()
      .where("email", "=", input.email)
      .executeTakeFirst();
    if (!user || user.status !== "active" || !verifyPassword(input.password, user.password_hash)) {
      return null;
    }
    if (passwordNeedsRehash(user.password_hash)) {
      await database
        .updateTable("app_users")
        .set({ password_hash: hashPassword(input.password), updated_at: new Date() })
        .where("uuid", "=", user.uuid)
        .execute();
    }

    const context = await buildApplicationSessionCache();
    const jti = randomUUID();
    const accessToken = signAuthToken(
      {
        email: user.email,
        loginHost: input.loginHost,
        name: user.name,
        tenantAccessMode: "platform",
        tenantCode: "CXSHOP",
        tenantDbName: env.DB_MASTER_NAME,
        tenantId: "application",
        tenantUuid: "application",
        userId: user.uuid,
        userType: "tenant"
      },
      { jti }
    );
    await sessionRepository.create({
      context,
      expiresAt: expiresAt(),
      jti,
      loginHost: input.loginHost,
      tenantAccessMode: "platform",
      tenantCode: "CXSHOP",
      tenantDbName: env.DB_MASTER_NAME,
      tenantId: "application",
      userEmail: user.email,
      userName: user.name,
      userType: "tenant",
      userUuid: user.uuid
    });
    return {
      accessToken,
      context,
      email: user.email,
      name: user.name,
      tenantCode: "CXSHOP",
      tenantId: "application",
      tenantUuid: "application",
      userType: "tenant" as const
    };
  }

  private async loginPlatformUser(input: {
    desk: "staff" | "super_admin";
    email: string;
    loginHost: string;
    password: string;
  }) {
    const credential = await credentialRepository.findPlatformCredential(input.desk, input.email);
    if (
      !credential ||
      credential.status !== "active" ||
      !verifyPassword(input.password, credential.passwordHash)
    ) {
      return null;
    }
    if (passwordNeedsRehash(credential.passwordHash)) {
      await credentialRepository.updatePlatformCredentialPasswordHash(
        input.desk,
        credential.uuid,
        hashPassword(input.password)
      );
    }
    const jti = randomUUID();
    const context = emptySessionCache();
    const accessToken = signAuthToken(
      {
        email: credential.email,
        loginHost: input.loginHost,
        name: credential.name,
        tenantAccessMode: "platform",
        userId: credential.uuid,
        userType: input.desk
      },
      { jti }
    );
    await sessionRepository.create({
      context,
      expiresAt: expiresAt(),
      jti,
      loginHost: input.loginHost,
      tenantAccessMode: "platform",
      tenantCode: null,
      tenantDbName: null,
      tenantId: null,
      userEmail: credential.email,
      userName: credential.name,
      userType: input.desk,
      userUuid: credential.uuid
    });
    return {
      accessToken,
      context,
      email: credential.email,
      name: credential.name,
      userType: input.desk
    };
  }
}

type LoginInput = {
  desk?: unknown;
  domain?: string;
  email?: string;
  password?: string;
};

function normalizeDesk(value: unknown): AuthUserType {
  if (value === "sa" || value === "super_admin") return "super_admin";
  if (value === "staff") return "staff";
  return "tenant";
}

function expiresAt() {
  return new Date(Date.now() + env.AUTH_SESSION_TTL_HOURS * 60 * 60 * 1000);
}

async function buildApplicationSessionCache(): Promise<TenantSessionCache> {
  let defaultCompany: TenantSessionCache["defaultCompany"] = null;
  try {
    const result = await sql<{
      company_id: number | string;
      company_name: string;
      financial_year_id: number | string;
      financial_year_name: string;
      landing_app: string;
    }>`SELECT defaults.company_id, company.name AS company_name,
      defaults.financial_year_id, financial_year.name AS financial_year_name,
      defaults.landing_app
      FROM core_default_company_settings defaults
      INNER JOIN core_companies company ON company.id = defaults.company_id
      INNER JOIN core_financial_years financial_year
        ON financial_year.id = defaults.financial_year_id
      WHERE defaults.singleton_key = 1 AND defaults.status = 'active'
      LIMIT 1`.execute(getTenantDatabaseByName(env.DB_MASTER_NAME));
    const row = result.rows[0];
    if (row) {
      defaultCompany = {
        companyId: Number(row.company_id),
        companyName: row.company_name,
        financialYearId: Number(row.financial_year_id),
        financialYearName: row.financial_year_name,
        landingApp: row.landing_app
      };
    }
  } catch {}

  const setup = await setupRepository.get();
  const landingPage = defaultCompany?.landingApp || setup.defaultLandingApp;
  return {
    cachedAt: new Date().toISOString(),
    company: defaultCompany
      ? { code: "", id: defaultCompany.companyId, name: defaultCompany.companyName }
      : null,
    defaultCompany,
    enabledModuleKeys: [...setup.enabledModuleKeys],
    landingPage,
    safeSettings: { landing: landingPage },
    tenant: { code: setup.applicationCode, id: setup.uuid, name: setup.applicationName }
  };
}

function normalizeHost(value: string) {
  return value.trim().toLowerCase().split(":")[0] ?? "";
}
