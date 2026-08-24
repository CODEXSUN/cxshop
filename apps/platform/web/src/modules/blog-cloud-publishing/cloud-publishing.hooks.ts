import { useQuery } from "@tanstack/react-query";
import {
  getCloudConnection,
  listCloudPublications,
  listPublishableArticles
} from "./cloud-publishing.services";
export const cloudConnectionKey = ["blogs", "cloud", "connection"] as const;
export const cloudPublicationsKey = ["blogs", "cloud", "publications"] as const;
export function useCloudConnection() {
  return useQuery({ queryFn: getCloudConnection, queryKey: cloudConnectionKey });
}
export function useCloudPublications() {
  return useQuery({
    queryFn: listCloudPublications,
    queryKey: cloudPublicationsKey,
    refetchInterval: 5000
  });
}
export function usePublishableArticles() {
  return useQuery({ queryFn: listPublishableArticles, queryKey: ["blogs", "cloud", "articles"] });
}
