import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDataSourceSettings,
  switchDataSourceProvider,
  testDataSourceConnection
} from "./data-source-settings.services";
import { saveFrappeConnection, verifyFrappeConnection } from "./data-source-settings.services";
import type { DataSourceProvider } from "./data-source-settings.types";
export const dataSourceSettingsQueryKey = ["sa", "data-source-settings"] as const;
export function useDataSourceSettingsQuery() {
  return useQuery({ queryFn: getDataSourceSettings, queryKey: dataSourceSettingsQueryKey });
}
export function useDataSourceSettingsMutations() {
  const client = useQueryClient();
  return {
    switchProvider: useMutation({
      mutationFn: switchDataSourceProvider,
      onSuccess: () => void client.invalidateQueries({ queryKey: dataSourceSettingsQueryKey })
    }),
    testConnection: useMutation({
      mutationFn: (provider: DataSourceProvider) => testDataSourceConnection(provider)
    }),
    saveFrappe: useMutation({
      mutationFn: saveFrappeConnection,
      onSuccess: () => void client.invalidateQueries({ queryKey: dataSourceSettingsQueryKey })
    }),
    verifyFrappe: useMutation({
      mutationFn: verifyFrappeConnection,
      onSuccess: () => void client.invalidateQueries({ queryKey: dataSourceSettingsQueryKey })
    })
  };
}
