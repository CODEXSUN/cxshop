import { loginSchema, portalSchema, type Portal, type SessionDto } from "@cxshop/contracts";
import argon2 from "argon2";
import { jwtVerify, SignJWT } from "jose";
import { IdentityRepository } from "./identity.repository";

type DevelopmentLoginConfig = {
  NODE_ENV?: string;
  DEV_LOGIN_AUTO: "0" | "1";
  DEV_LOGIN_STORE_EMAIL: string;
  DEV_LOGIN_VENDOR_EMAIL: string;
  DEV_LOGIN_ADMIN_EMAIL: string;
  DEV_LOGIN_SA_EMAIL: string;
  LOGIN_SESSION_HOURS: number;
};

export class IdentityService {
  private readonly key: Uint8Array;

  constructor(
    private readonly repository: IdentityRepository,
    secret: string,
    private readonly development: DevelopmentLoginConfig
  ) {
    this.key = new TextEncoder().encode(secret);
  }

  async login(input: unknown): Promise<string | undefined> {
    const request = loginSchema.parse(input);
    const identity = await this.repository.findForLogin(request.email, request.portal);
    if (!identity || !(await argon2.verify(identity.passwordHash, request.password))) return undefined;
    return this.sign(this.repository.toSession(identity));
  }

  async developmentLogin(input: unknown): Promise<string | undefined> {
    if (this.development.NODE_ENV === "production" || this.development.DEV_LOGIN_AUTO !== "1") return undefined;
    const portal = portalSchema.parse((input as { portal?: unknown } | undefined)?.portal);
    const identity = await this.repository.findForLogin(this.developmentEmail(portal), portal);
    return identity ? this.sign(this.repository.toSession(identity)) : undefined;
  }

  async verify(token: string, portal?: string): Promise<SessionDto | undefined> {
    try {
      const { payload } = await jwtVerify(token, this.key);
      const session = payload as unknown as SessionDto;
      return !portal || session.portal === portal ? session : undefined;
    } catch {
      return undefined;
    }
  }

  private sign(session: SessionDto): Promise<string> {
    return new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setSubject(session.actorId).setIssuedAt().setExpirationTime(`${this.development.LOGIN_SESSION_HOURS}h`).sign(this.key);
  }

  private developmentEmail(portal: Portal): string {
    return {
      store: this.development.DEV_LOGIN_STORE_EMAIL,
      vendor: this.development.DEV_LOGIN_VENDOR_EMAIL,
      admin: this.development.DEV_LOGIN_ADMIN_EMAIL,
      sa: this.development.DEV_LOGIN_SA_EMAIL
    }[portal];
  }
}
