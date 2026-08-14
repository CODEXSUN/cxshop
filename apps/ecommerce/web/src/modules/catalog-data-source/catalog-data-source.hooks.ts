import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCatalogDataSource,
  saveFrappeConnection,
  saveCatalogDataSource,
  syncCatalogDataSource,
  testCatalogDataSource,
  verifyFrappeConnection
} from "./catalog-data-source.services";
import type {
  CatalogDataSourceModule,
  CatalogDataSourceProvider
} from "./catalog-data-source.types";

export const catalogDataSourceQueryKey = ["ecommerce", "catalog-data-source"] as const;

export function useCatalogDataSource() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryFn: getCatalogDataSource, queryKey: catalogDataSourceQueryKey });
  const save = useMutation({
    mutationFn: (input: { module: CatalogDataSourceModule; provider: CatalogDataSourceProvider }) =>
      saveCatalogDataSource(input),
    onSuccess: (value) => queryClient.setQueryData(catalogDataSourceQueryKey, value)
  });
  const test = useMutation({
    mutationFn: (provider: CatalogDataSourceProvider) => testCatalogDataSource(provider)
  });
  const saveConnection = useMutation({
    mutationFn: saveFrappeConnection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogDataSourceQueryKey })
  });
  const verifyConnection = useMutation({
    mutationFn: verifyFrappeConnection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catalogDataSourceQueryKey })
  });
  const sync = useMutation({ mutationFn: syncCatalogDataSource });
  return { save, saveConnection, settings, sync, test, verifyConnection };
}
