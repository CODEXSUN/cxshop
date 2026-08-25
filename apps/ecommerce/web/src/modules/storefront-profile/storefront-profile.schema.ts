import { z } from "zod";

const optionalUrl = z.union([
  z.literal(""),
  z.string().url("Enter a complete https:// link.").max(500)
]);
export const storefrontProfileSchema = z.object({
  aboutUs: z.string().max(2000),
  copyrightText: z.string().max(240),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  poweredByText: z.string().max(240),
  serviceActionLabel: z.string().max(120),
  serviceActionUrl: z.string().max(500),
  serviceDescription: z.string().max(500),
  serviceEyebrow: z.string().max(120),
  serviceTitle: z.string().max(240),
  tagline: z.string().max(240),
  trustedDescription: z.string().max(500),
  trustedEyebrow: z.string().max(120),
  trustedProofPoints: z.string().max(1000),
  trustedTitle: z.string().max(240),
  threadsUrl: optionalUrl,
  whatsappUrl: optionalUrl,
  xUrl: optionalUrl,
  youtubeUrl: optionalUrl
});
