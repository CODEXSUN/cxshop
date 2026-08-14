import type { ColumnType, Generated } from "kysely";

export type TimestampColumn = ColumnType<
  Date,
  Date | string | undefined,
  Date | string | undefined
>;

export type DevkitDatabase = {
  devkit_honey_mascot_settings: HoneyMascotSettingsTable;
  devkit_honey_messages: HoneyMessagesTable;
  devkit_honey_runs: HoneyRunsTable;
  devkit_honey_threads: HoneyThreadsTable;
  devkit_platform_registry_activity: PlatformRegistryActivityTable;
  devkit_platform_registry_groups: PlatformRegistryGroupsTable;
  devkit_platform_registry_modules: PlatformRegistryModulesTable;
  devkit_platform_registry_platforms: PlatformRegistryPlatformsTable;
};

export type HoneyMascotSettingsTable = {
  behavior: string;
  created_at: TimestampColumn;
  created_by: string;
  id: Generated<number>;
  status: string;
  updated_at: TimestampColumn;
  updated_by: string;
  uuid: string;
  x_ratio: ColumnType<number, number | string, number | string>;
  y_ratio: ColumnType<number, number | string, number | string>;
};

export type HoneyThreadsTable = {
  actor_id: string;
  created_at: TimestampColumn;
  id: Generated<number>;
  status: string;
  title: string;
  updated_at: TimestampColumn;
  uuid: string;
};
export type HoneyMessagesTable = {
  actor_id: string;
  body: string;
  created_at: TimestampColumn;
  id: Generated<number>;
  role: string;
  thread_uuid: string;
  uuid: string;
};
export type HoneyRunsTable = {
  actor_id: string;
  created_at: TimestampColumn;
  error_text: string | null;
  id: Generated<number>;
  input_text: string;
  mode: string;
  model: string;
  provider: string;
  result_text: string | null;
  status: string;
  steps_json: string;
  thread_uuid: string;
  updated_at: TimestampColumn;
  uuid: string;
};

type RegistryColumns = {
  active: number;
  created_at: TimestampColumn;
  description: string;
  id: Generated<number>;
  name: string;
  sort_order: number;
  status: string;
  updated_at: TimestampColumn;
  uuid: string;
};

export type PlatformRegistryPlatformsTable = RegistryColumns & {
  platform_key: string;
};

export type PlatformRegistryGroupsTable = RegistryColumns & {
  group_key: string;
  parent_group_uuid: string | null;
  platform_uuid: string;
};

export type PlatformRegistryModulesTable = RegistryColumns & {
  documentation_json: string;
  group_uuid: string;
  module_key: string;
  module_type: string;
  parent_module_uuid: string | null;
  planning_notes_json: string;
  route_path: string;
};

export type PlatformRegistryActivityTable = {
  action: string;
  actor_email: string;
  created_at: TimestampColumn;
  details_json: string;
  id: Generated<number>;
  record_kind: string;
  record_uuid: string;
  uuid: string;
};
