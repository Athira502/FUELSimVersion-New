// // @ts-nocheck

// import {
//     getLicenseTypesAPI,
//     createOptimizationRequestAPI,
//     getAllOptimizationRequestsAPI,
//     getOptimizationResultsByRequestIdAPI,
//     LicenseType as BackendLicenseType, 
//     OptimizationRequest as BackendOptimizationRequest, 
//     CreateOptimizationRequestPayload
// } from '../api/lic_opt'; 

// import {
//     OptimizationRequest, 
//     OptimizationRequestType, 
//     RoleOptimizationResult, 
//     LicenseType, 
//     RatioOption, 
//     UserOptimizationResult
// } from "../types/optimization"; 


// export const getLicenseTypes = async (clientId: string, systemId: string): Promise<LicenseType[]> => {
//     if (!clientId || !systemId) {
//         return [];
//     }
   
//     const apiLicenseTypes = await getLicenseTypesAPI(clientId, systemId);

    
//     return apiLicenseTypes.map(lt => ({
//         id: lt.id,
//         name: lt.name,
//         description: null, 
//     }));
// };


// export const getRatioOptions = async (): Promise<RatioOption[]> => {
    
//     const mockRatioOptions: RatioOption[] = [
//         { id: "10", value: "10" },
//         { id: "20", value: "20" },
//         { id: "30", value: "30" },
//     ];
//     return Promise.resolve(mockRatioOptions);
// };


// export const createOptimizationRequest = async (
    
//     payload: CreateOptimizationRequestPayload
//   ): Promise<any> => {
//     if (!payload.client_name || !payload.system_id) {
//       throw new Error("Client Name and System SID are required.");
//     }

//     const finalPayload: CreateOptimizationRequestPayload = {
//         ...payload
//         // ,
//         // validation_type: payload.validation_type || "role",
       
//     };

//     if (finalPayload.ratio_threshold !== undefined && finalPayload.ratio_threshold !== null && isNaN(finalPayload.ratio_threshold)) {
//         throw new Error("Ratio threshold must be a valid number.");
//       }
    
//       return createOptimizationRequestAPI(finalPayload);
//     };


// export const getOptimizationRequests = async (
// ): Promise<OptimizationRequest[]> => {
    
//     const backendRequests = await getAllOptimizationRequestsAPI(); 

    
//     return backendRequests.map(req => ({
//         id: String(req.req_id), 
//         client_name: req.CLIENT_NAME, 
//         system_id: req.SYSTEM_NAME, 
//         status: req.STATUS as OptimizationRequest['status'], 
//         datetime: req.TIMESTAMP ? new Date(req.TIMESTAMP).toISOString() : new Date().toISOString(),
//         request_type: 'role', 
//         filters: {}, 
//     }));
// };

// export const getRoleOptimizationResults = async (
//     requestId: string 
// ): Promise<RoleOptimizationResult[]> => { 
   
    
//     const results = await getOptimizationResultsByRequestIdAPI(requestId); 

    
//     return results.map(res => ({
//         id: String(res.id), 
//         request_id: String(res.req_id), 
//         role_id: res.role_id || null,
//         role_description: res.role_description || null, 
//         auth_object: res.auth_object || null, 
//         field: res.field || null,
//         value: res.value || null, 
//         license_can_be_reduced: res.license_can_be_reduced !== undefined ? res.license_can_be_reduced : null,
//         insights: res.insights || null,
//         recommendations: res.recommendations || null, 
//         explanations: res.explanations || null,
//         created_at: new Date().toISOString(), 
//     }));
// };

// export const getUserOptimizationResults = async (
//   requestId: string
// ): Promise<UserOptimizationResult[]> => {
//   console.log(`Fetching user optimization results for request ID: ${requestId}`);

//   return [
//     {
//       id: crypto.randomUUID(),
//       request_id: requestId,
//       user_id: 'USER001',
//       display_name: 'John Doe',
//       valid_from: new Date('2023-01-01').toISOString(),
//       valid_to: new Date('2024-12-31').toISOString(),
//       user_group: 'FINANCE',
//       last_logon: new Date('2023-06-15').toISOString(),
//       license_can_be_reduced: true,
//       insights: 'User has not logged in for over 3 months',
//       recommendations: 'Consider downgrading to Self-Service license',
//       explanations: 'Infrequent usage does not justify Professional license cost',
//       created_at: new Date().toISOString()
//     },
//     {
//       id: crypto.randomUUID(),
//       request_id: requestId,
//       user_id: 'USER002',
//       display_name: 'Jane Smith',
//       valid_from: new Date('2023-01-01').toISOString(),
//       valid_to: null,
//       user_group: 'IT',
//       last_logon: new Date('2023-10-01').toISOString(),
//       license_can_be_reduced: false,
//       insights: 'User actively uses advanced features',
//       recommendations: 'Maintain current Professional license',
//       explanations: 'Usage patterns justify the current license type',
//       created_at: new Date().toISOString()
//     }
//   ];
// };


// src/services/optimizationService.ts
// ─────────────────────────────────────────────────────────────────────────────
// Service layer: maps raw API responses to the frontend OptimizationRequest /
// RoleOptimizationResult types consumed by React Query hooks and components.
// ─────────────────────────────────────────────────────────────────────────────

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

// ── Role optimisation results ─────────────────────────────────────────────────

/**
 * Returns the per-auth-object AI analysis rows for a completed request.
 */
// export async function getRoleOptimizationResults(
//   requestId: string
// ): Promise<RoleOptimizationResult[]> {
//   const rows = await apiGetOptimizationResults(requestId);

//   return rows.map((r) => ({
//     id:                    String(r.result_id),
//     request_id:            r.req_id,
//     role_id:               r.role_id ?? null,
//     role_description:      r.role_description ?? null,
//     auth_object:           r.authorization_object ?? null,
//     field:                 r.field ?? null,
//     value:                 r.value ?? null,
//     license_can_be_reduced: (r.license_reducible as "Yes" | "No" | "May Be") ?? null,
//     insights:              r.insights ?? null,
//     recommendations:       r.recommendations ?? null,
//     explanations:          r.explanations ?? null,
//     created_at:            new Date().toISOString(),
//   }));
// }


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