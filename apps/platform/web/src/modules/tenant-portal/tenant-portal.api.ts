import { apiGet } from "../../shared/api/platform-api";
import type { PublicCompanyBranding } from "./tenant-portal.types";
import { useQuery } from "@tanstack/react-query";

export function getPublicCompanyBranding() {
  return apiGet<PublicCompanyBranding>("/public/company-branding");
}

export function usePublicCompanyBranding() {
  return useQuery({ queryFn: getPublicCompanyBranding, queryKey: ["public", "company-branding"] });
}
