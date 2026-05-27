// src/api/apiTypes.ts
// ─────────────────────────────────────────────────────────────────────────────
// Raw response shapes returned by the FastAPI backend.
// Keep these 1-to-1 with the actual JSON payloads so that service layers can
// map / transform them into frontend-friendly types if needed.
// ─────────────────────────────────────────────────────────────────────────────

// ── /fue ─────────────────────────────────────────────────────────────────────

export interface ApiRoleDetail {
  id: string;
  profile: string;
  description: string;
  classification: "GB Advanced Use" | "GC Core Use" | "GD Self-Service Use" | string;
  assignedUsers: number;
  gb: number;
  gc: number;
  gd: number;
}

export interface ApiAuthObjectDetail {
  object: string;
  fieldName: string;
  valueLow: string;
  valueHigh: string;
  classification: string;
  ttext: string;
}

export interface ApiSpecificRoleDetails {
  roleName: string;
  roleDescription: string;
  objectDetails: ApiAuthObjectDetail[];
}

export interface ApiUserByRole {
  username: string;
  licenseFromRole: string;
}

export interface ApiUsersByRoleResponse {
  roleName: string;
  systemName: string;
  userCount: number;
  users: ApiUserByRole[];
}

export interface ApiLicenseTierCount {
  gb: number;
  gc: number;
  gd: number;
  total: number;
}

export interface ApiFueDashboard {
  user_license_distribution: ApiLicenseTierCount;
  role_license_distribution: ApiLicenseTierCount;
  dormant_90: ApiLicenseTierCount;
  dormant_180: ApiLicenseTierCount;
  expired_not_locked: ApiLicenseTierCount;
  locked_not_expired: ApiLicenseTierCount;
}

// ── /optimize ────────────────────────────────────────────────────────────────

export interface ApiCreateOptimizationResponse {
  message: string;
  request_id: string;
  status: "IN_PROGRESS";
  system_id: string;
}

export interface ApiOptimizationRequest {
  req_id: string;
  system_name: string;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED" | string;
  timestamp: string | null;
}



export interface ApiOptimizationResult {
  result_id: number;
  req_id: string;
  role_id: string;
  role_description: string;
  authorization_object: string;
  field: string;
  value: string;
  license_reducible: "Yes" | "No" | "May Be" | string;
  suggested_role_license: string;  // ADD THIS
  insights: string;
  recommendations: string | null;
  explanations: string | null;
}

export interface ApiSimResult {
  sim_id: number;
  request_id: string;
  system_name: string;
  reducible_roles: string | null;
  reducible_role_count: number;
  before_gb_users: number;
  before_gc_users: number;
  before_gd_users: number;
  before_nc_users: number;
  before_total_fue: number;
  after_gb_users: number;
  after_gc_users: number;
  after_gd_users: number;
  after_nc_users: number;
  after_total_fue: number;
  fue_saved: number;
  users_impacted: number;
}

export interface ApiLicenseType {
  id: string;
  name: string;
}

// ── Request payload ───────────────────────────────────────────────────────────

export interface CreateOptimizationPayload {
  /** Maps to `system_id` query param */
  system_id: string;
  /** Maps to `target_license` query param */
  target_license?: string;
  /** Maps to `sap_system_info` query param */
  sap_system_info?: string;
  /** Maps to repeated `role_names` query params */
  role_names?: string[];
  /** Maps to `ratio_threshold` query param */
  ratio_threshold?: number;
}