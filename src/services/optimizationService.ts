
import {
  createOptimizationRequest as apiCreateOptimizationRequest,
  getOptimizationRequests as apiGetOptimizationRequests,
  getOptimizationResults as apiGetOptimizationResults,
  getSimResults as apiGetSimResults,
  getLicenseTypes as apiGetLicenseTypes,
} from "../api/optimizeApi";
import type {
  CreateOptimizationPayload,
  ApiSimResult,
} from "../api/apiTypes";

import type {
  OptimizationRequest,
  RoleOptimizationResult,
  LicenseType,
  RatioOption,
} from "@/types/optimization";

// ── License types ─────────────────────────────────────────────────────────────

/**
 * Returns distinct license tiers for the given system.
 * No longer requires a `clientId` — pass only `systemId`.
 */
export async function getLicenseTypes(
  systemId: string
): Promise<LicenseType[]> {
  if (!systemId) return [];
  const items = await apiGetLicenseTypes(systemId);
  return items.map((lt) => ({ id: lt.id, name: lt.name, description: null }));
}

// ── Ratio options (static / mock — not backed by an API endpoint yet) ─────────

export async function getRatioOptions(): Promise<RatioOption[]> {
  return [
    { id: "10", value: "10" },
    { id: "20", value: "20" },
    { id: "30", value: "30" },
  ];
}

// ── Create optimisation request ───────────────────────────────────────────────

/**
 * Fires the background optimisation job and returns the raw API response
 * so callers can access `request_id` and `status`.
 */
export async function createOptimizationRequest(
  payload: CreateOptimizationPayload
): Promise<{ request_id: string; status: string; system_id: string }> {
  if (!payload.system_id) {
    throw new Error("system_id is required.");
  }
  if (
    payload.ratio_threshold !== undefined &&
    payload.ratio_threshold !== null &&
    isNaN(payload.ratio_threshold)
  ) {
    throw new Error("ratio_threshold must be a valid number.");
  }

  return apiCreateOptimizationRequest(payload);
}

// ── List all requests ─────────────────────────────────────────────────────────

/**
 * Returns all optimisation requests mapped to the frontend `OptimizationRequest` shape.
 */
export async function getOptimizationRequests(): Promise<OptimizationRequest[]> {
  const rows = await apiGetOptimizationRequests();

  return rows.map((r) => ({
    id:           r.req_id,
    request_type: "role" as const,
    filters:      {},
    status:       normaliseStatus(r.status),
    client_name:  "",          // backend no longer exposes client_name
    system_id:    r.system_name,
    datetime:     r.timestamp
      ? new Date(r.timestamp).toISOString()
      : new Date().toISOString(),
  }));
}



export async function getRoleOptimizationResults(
  requestId: string
): Promise<RoleOptimizationResult[]> {
  const rows = await apiGetOptimizationResults(requestId);

  return rows.map((r) => ({
    id:                     String(r.result_id),
    request_id:             r.req_id,
    role_id:                r.role_id ?? null,
    role_description:       r.role_description ?? null,
    auth_object:            r.authorization_object ?? null,
    field:                  r.field ?? null,
    value:                  r.value ?? null,
    license_can_be_reduced: (r.license_reducible as "Yes" | "No" | "May Be") ?? null,
    suggested_role_license: r.suggested_role_license ?? null,  // ADD THIS
    insights:               r.insights ?? null,
    recommendations:        r.recommendations ?? null,
    explanations:           r.explanations ?? null,
    created_at:             new Date().toISOString(),
  }));
}
// ── FUE simulation results ────────────────────────────────────────────────────

/**
 * Returns the system-wide FUE simulation summary for a completed request.
 */
export async function getSimulationResults(
  requestId: string,
  systemId: string
): Promise<ApiSimResult[]> {
  return apiGetSimResults(requestId, systemId);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

type FrontendStatus = OptimizationRequest["status"];

function normaliseStatus(raw: string): FrontendStatus {
  switch ((raw ?? "").toUpperCase()) {
    case "COMPLETED":   return "Completed";
    case "FAILED":      return "Error";
    case "IN_PROGRESS": return "In Progress";
    default:            return "Started";
  }
}