// src/api/fueApi.ts
// ─────────────────────────────────────────────────────────────────────────────
// All calls against the  /fue  router.
// ─────────────────────────────────────────────────────────────────────────────

import { apiFetch, buildQuery } from "./apiConfig";
import type {
  ApiRoleDetail,
  ApiSpecificRoleDetails,
  ApiUsersByRoleResponse,
  ApiFueDashboard,
} from "../api/apiTypes";

// ── GET /fue/roles/details/ ───────────────────────────────────────────────────

/**
 * Fetch all roles with pre-computed license classifications and assigned user counts.
 *
 * @param systemName  The SAP system identifier, e.g. "S4H_PRD".
 */
export async function getRoleDetails(
  systemName: string
): Promise<ApiRoleDetail[]> {
  const qs = buildQuery({ system_name: systemName });
  return apiFetch<ApiRoleDetail[]>(`/fue/roles/details/${qs}`, {
    timeoutMs: 90_000,
  });
}

// ── GET /fue/role-details/{role_name} ────────────────────────────────────────

/**
 * Fetch detailed authorization objects for a specific role.
 * Role names may contain slashes — they are encoded automatically.
 *
 * @param roleName    The AGR_NAME of the role.
 * @param systemName  The SAP system identifier.
 */
export async function getSpecificRoleDetails(
  roleName: string,
  systemName: string
): Promise<ApiSpecificRoleDetails> {
  // The backend uses `{role_name:path}` so forward-slashes must be kept.
  // Encode everything except slashes to match FastAPI path behaviour.
  const encodedRole = roleName
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const qs = buildQuery({ system_name: systemName });
  return apiFetch<ApiSpecificRoleDetails>(
    `/fue/role-details/${encodedRole}${qs}`
  );
}

// ── GET /fue/users-by-role/{role_name} ───────────────────────────────────────

/**
 * Fetch all users assigned to a given role with their per-role license.
 *
 * @param roleName    The AGR_NAME of the role.
 * @param systemName  The SAP system identifier.
 */
export async function getUsersByRole(
  roleName: string,
  systemName: string
): Promise<ApiUsersByRoleResponse> {
  const encodedRole = roleName
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  const qs = buildQuery({ system_name: systemName });
  return apiFetch<ApiUsersByRoleResponse>(
    `/fue/users-by-role/${encodedRole}${qs}`
  );
}

// ── GET /fue/dashboard/{system_name} ─────────────────────────────────────────

/**
 * Fetch the FUE dashboard summary: user/role distribution, dormancy, governance.
 *
 * @param systemName  The SAP system identifier.
 */
export async function getFueDashboard(
  systemName: string
): Promise<ApiFueDashboard> {
  return apiFetch<ApiFueDashboard>(
    `/fue/dashboard/${encodeURIComponent(systemName)}`
  );
}