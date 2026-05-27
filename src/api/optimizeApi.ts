// src/api/optimizeApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// All calls against the  /optimize  router.
// ─────────────────────────────────────────────────────────────────────────────

import { apiFetch, buildQuery } from "./apiConfig";
import type {
  ApiCreateOptimizationResponse,
  ApiOptimizationRequest,
  ApiOptimizationResult,
  ApiSimResult,
  ApiLicenseType,
  CreateOptimizationPayload,
} from "./apiTypes";

// ── GET /optimize/license ─────────────────────────────────────────────────────

/**
 * Initiates an AI-powered SAP role licence optimisation job.
 * Returns immediately with a `request_id`; processing continues in the background.
 *
 * Poll `GET /optimize/requests` or `getOptimizationRequests()` until STATUS = COMPLETED.
 */
export async function createOptimizationRequest(
  payload: CreateOptimizationPayload
): Promise<ApiCreateOptimizationResponse> {
  const qs = buildQuery({
    system_id:       payload.system_id,
    target_license:  payload.target_license,
    sap_system_info: payload.sap_system_info,
    role_names:      payload.role_names,
    ratio_threshold: payload.ratio_threshold,
  });

  return apiFetch<ApiCreateOptimizationResponse>(`/optimize/license${qs}`, {
    // Background jobs can be slow to acknowledge; give extra headroom.
    timeoutMs: 30_000,
  });
}

// ── GET /optimize/requests ────────────────────────────────────────────────────

/**
 * Returns all optimisation requests ordered by most-recent first.
 */
export async function getOptimizationRequests(): Promise<
  ApiOptimizationRequest[]
> {
  return apiFetch<ApiOptimizationRequest[]>("/optimize/requests");
}

// ── GET /optimize/results/{req_id} ───────────────────────────────────────────

/**
 * Returns the per-auth-object AI analysis rows for a completed request.
 *
 * @param reqId  The request ID returned by `createOptimizationRequest`.
 */
export async function getOptimizationResults(
  reqId: string
): Promise<ApiOptimizationResult[]> {
  return apiFetch<ApiOptimizationResult[]>(
    `/optimize/results/${encodeURIComponent(reqId)}`
  );
}

// ── GET /optimize/sim-results/{req_id} ───────────────────────────────────────

/**
 * Returns per-role FUE simulation rows for a request.
 * `systemId` is required to locate the correct per-system simulation table.
 *
 * @param reqId     The request ID.
 * @param systemId  The SAP system identifier used when the request was created.
 */
export async function getSimResults(
  reqId: string,
  systemId: string
): Promise<ApiSimResult[]> {
  const qs = buildQuery({ system_id: systemId });
  return apiFetch<ApiSimResult[]>(
    `/optimize/sim-results/${encodeURIComponent(reqId)}${qs}`
  );
}

// ── GET /optimize/license-types ───────────────────────────────────────────────

/**
 * Returns distinct license classification values available for `systemId`.
 *
 * @param systemId  The SAP system identifier.
 */
export async function getLicenseTypes(
  systemId: string
): Promise<ApiLicenseType[]> {
  const qs = buildQuery({ system_id: systemId });
  return apiFetch<ApiLicenseType[]>(`/optimize/license-types${qs}`);
}