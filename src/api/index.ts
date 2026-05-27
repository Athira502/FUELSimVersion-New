// src/api/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single entry-point for every API function.
// Import from here rather than from individual files:
//
//   import { getRoleDetails, createOptimizationRequest } from "@/api";
//
// ─────────────────────────────────────────────────────────────────────────────

export { API_BASE_URL, apiFetch, buildQuery, ApiError } from "./apiConfig";
export type { FetchOptions } from "./apiConfig";

// ── /systems ──────────────────────────────────────────────────────────────────
export { fetchAllSystems } from "../api/overview";
export type { SystemResponse } from "../api/overview";

// ── /fue ──────────────────────────────────────────────────────────────────────
export {
  getRoleDetails,
  getSpecificRoleDetails,
  getUsersByRole,
  getFueDashboard,
} from "./fueApi";

// ── /optimize ─────────────────────────────────────────────────────────────────
export {
  createOptimizationRequest,
  getOptimizationRequests,
  getOptimizationResults,
  getSimResults,
  getLicenseTypes,
} from "./optimizeApi";

// ── Shared backend types ───────────────────────────────────────────────────────
export type {
  ApiRoleDetail,
  ApiAuthObjectDetail,
  ApiSpecificRoleDetails,
  ApiUserByRole,
  ApiUsersByRoleResponse,
  ApiLicenseTierCount,
  ApiFueDashboard,
  ApiCreateOptimizationResponse,
  ApiOptimizationRequest,
  ApiOptimizationResult,
  ApiSimResult,
  ApiLicenseType,
  CreateOptimizationPayload,
} from "./apiTypes";