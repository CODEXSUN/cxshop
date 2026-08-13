import { z } from "zod";

const optionalUrl = z.union([
  z.literal(""),
  z.string().url("Enter a complete https:// link.").max(500)
]);
export const storefrontProfileSchema = z.object({
  aboutUs: z.string().max(2000),
  copyrightText: z.string().max(240),
  instagramUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  poweredByText: z.string().max(240),
  tagline: z.string().max(240),
  xUrl: optionalUrl
});
