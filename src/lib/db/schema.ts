import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const merchants = sqliteTable("merchants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  scpEndpointUrl: text("scp_endpoint_url").notNull(),
  isReference: integer("is_reference", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const scopeSettings = sqliteTable("scope_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  dataType: text("data_type", {
    enum: ["orders", "loyalty", "offers", "preferences"],
  }).notNull(),
  exposed: integer("exposed", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const testRuns = sqliteTable("test_runs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  shopperId: text("shopper_id").notNull(),
  requestedScopes: text("requested_scopes").notNull(),
  filteredScopes: text("filtered_scopes").notNull(),
  responseStatus: integer("response_status").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const auditEvents = sqliteTable("audit_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  actor: text("actor").notNull(),
  requestedScopes: text("requested_scopes").notNull(),
  dataTypesReturned: text("data_types_returned").notNull(),
  status: text("status", { enum: ["success", "denied", "error"] }).notNull(),
  latencyMs: integer("latency_ms"),
  occurredAt: integer("occurred_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const policyChanges = sqliteTable("policy_changes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  merchantId: text("merchant_id")
    .notNull()
    .references(() => merchants.id, { onDelete: "cascade" }),
  dataType: text("data_type").notNull(),
  fromState: integer("from_state", { mode: "boolean" }).notNull(),
  toState: integer("to_state", { mode: "boolean" }).notNull(),
  changedAt: integer("changed_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;
export type ScopeSetting = typeof scopeSettings.$inferSelect;
export type TestRun = typeof testRuns.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type PolicyChange = typeof policyChanges.$inferSelect;
