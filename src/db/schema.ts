import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Tenants / Projects Table
 * Stores metadata and configuration for each isolated BaaS Pod
 */
export const tenants = sqliteTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status", {
    enum: ["active", "paused", "provisioning", "failed", "deleted"],
  })
    .notNull()
    .default("provisioning"),

  // Security Credentials
  jwtSecret: text("jwt_secret").notNull(),
  dbPassword: text("db_password").notNull(),
  anonKey: text("anon_key"),
  serviceKey: text("service_key"),

  // Resource Allocation & Network Ports
  dbPort: integer("db_port"),
  restPort: integer("rest_port"),

  // Add-ons
  addonRedis: integer("addon_redis").notNull().default(0),
  addonEdgeFunctions: integer("addon_edge_functions").notNull().default(0),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Real-time Metrics Table
 * Stores CPU/RAM stats gathered via Docker Socket API
 */
export const metrics = sqliteTable("metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  cpuUsage: real("cpu_usage").notNull().default(0), // Percentage (e.g. 0.45%)
  ramUsageMb: real("ram_usage_mb").notNull().default(0), // RAM in MB
  lastPing: integer("last_ping", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * API Keys Table
 * Stores generated Anon and Service-Role JWT tokens per project
 */
export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role", { enum: ["anon", "service_role"] }).notNull(),
  token: text("token").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type Metric = typeof metrics.$inferSelect;
export type NewMetric = typeof metrics.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
