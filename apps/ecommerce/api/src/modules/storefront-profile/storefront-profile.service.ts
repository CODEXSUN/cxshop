import { AppError } from "@cxshop/framework/errors";
import { StorefrontProfileRepository } from "./storefront-profile.repository.js";
import type { StorefrontProfileInput } from "./storefront-profile.types.js";

export class StorefrontProfileService {
  constructor(private readonly repository = new StorefrontProfileRepository()) {}

  async get() {
    return (await this.repository.get()) ?? emptyStorefrontProfile();
  }

  async save(input: StorefrontProfileInput, actorEmail: string) {
    const profile = normalize(input);
    const saved = await this.repository.save(profile, actorEmail.trim() || "system:application");
    if (!saved)
      throw new AppError({
        code: "STOREFRONT_PROFILE_SAVE_FAILED",
        message: "The storefront profile could not be saved.",
        statusCode: 500
      });
    return saved;
  }
}

export function emptyStorefrontProfile(): StorefrontProfileInput {
  return {
    aboutUs: "",
    copyrightText: "",
    instagramUrl: "",
    linkedinUrl: "",
    poweredByText: "",
    tagline: "",
    xUrl: ""
  };
}

function normalize(input: StorefrontProfileInput): StorefrontProfileInput {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, value.trim()])
  ) as StorefrontProfileInput;
}
