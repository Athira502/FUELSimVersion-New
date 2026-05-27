// // @ts-nocheck
// import axios from "axios";

// const API_BASE_URL = "http://127.0.0.1:8000"; 

// export interface PivotTableResponse {
//   pivot_table: {
//     Users: {
//       "GB Advanced Use": number;
//       "GC Core Use": number;
//       "GD Self-Service Use": number;
//       Other: number;
//       Total: number;
//     };
//   };
//   fue_summary: {
//     "GB Advanced Use FUE": number;
//     "GC Core Use FUE": number;
//     "GD Self-Service Use FUE": number;
//     "Total FUE Required": number;
//   };
//   client_name: string;
//   system_name: string;
// }

// export const getLicenseClassificationPivotTable = async (
//   clientName: string,
//   systemName: string
// ): Promise<PivotTableResponse> => {
//   console.log("🌐 getLicenseClassificationPivotTable called with:", { clientName, systemName });
  
//   if (!clientName || !systemName) {
//     throw new Error("Client name and system name are required.");
//   }

//   const url = `${API_BASE_URL}/data/pivot-table/license-classification/?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`;
//   console.log("📡 Making request to:", url);

//   try {
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     console.log("📬 Response status:", response.status);

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
//     }

//     const data: PivotTableResponse = await response.json();
//     console.log("📋 Response data:", data);

//     return data;
//   } catch (error) {
//     console.error("🔥 API Error:", error);
//     throw error;
//   }
// };



// // Add these interfaces to your existing simulation_api.ts file

// export interface RoleDetailResponse {
//   id: string;
//   profile: string;
//   description: string;
//   classification: string;
//   assignedUsers: number;
//   gb: number;
//   gc: number;
//   gd: number;
//   not_classified: number;
// }

// // Add this function to your existing simulation_api.ts file

// export const getRoleDetails = async (
//   clientName: string,
//   systemName: string
// ): Promise<RoleDetailResponse[]> => {
//   try {
//     const response = await fetch(
//       `${API_BASE_URL}/fue/roles/details/?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`,
//       {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
//     }

//     const data: RoleDetailResponse[] = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching role details:', error);
//     throw error;
//   }
// };



// export const getRoleDetailsforSim = async (
//   clientName: string,
//   systemName: string
// ): Promise<RoleDetailResponse[]> => {
//   try {
//     const response = await fetch(
//       `${API_BASE_URL}/simulator/roles_for_sim/details/?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`,
//       {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
//     }

//     const data: RoleDetailResponse[] = await response.json();
//     return data;
//   } catch (error) {
//     console.error('Error fetching role details:', error);
//     throw error;
//   }
// };


// export interface RoleObjectDetail {
//   object: string;
//   classification: string;
//   fieldName: string;
//   valueLow: string;
//   valueHigh: string;
//   ttext: string;
// }

// export interface SpecificRoleDetailsResponse {
//   roleName: string;
//   roleDescription: string;
//   objectDetails: RoleObjectDetail[];
// }

// export async function getSpecificRoleDetails(
//   roleName: string, 
//   clientName: string,
//   systemName: string
// ): Promise<SpecificRoleDetailsResponse> {
//   const response = await fetch(
//    
//     `${API_BASE_URL}/fue/role-details/${encodeURIComponent(roleName)}?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`
//   );

//   if (!response.ok) {
//     const errorData = await response.json();
//     throw new Error(errorData.detail || `Failed to fetch role details: HTTP status ${response.status}`);
//   }
//   return response.json();
// }


// export interface SpecificRoleDetailsResponseforSim {
//   roleName: string;
//   objectDetails: RoleObjectDetail[];
// }


// export const getSpecificRoleDetailsforSim = async (
//   roleName: string,
//   clientName: string,
//   systemName: string
// ): Promise<SpecificRoleDetailsResponseforSim> => {
//   try {
  
//     const encodedRoleName = encodeURIComponent(roleName);
    
//     const response = await fetch(
//       `${API_BASE_URL.replace(/\/$/, '')}/simulator/role-details-for-simulation/${encodedRoleName}?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`
//     );

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Error fetching specific role details:', error);
//     throw error;
//   }
// };

// export interface AuthObjectFieldLicenseData {
//   AUTHORIZATION_OBJECT: string;
//   FIELD: string;
//   ACTIVITIY: string;
//   TEXT: string;
//   LICENSE: string;
//   UI_TEXT: string; 
// }

// export const getAuthObjFieldLicData = async (
//   authorizationObject: string,
//   field: string,
//   clientName: string,
//   systemName: string
// ): Promise<AuthObjectFieldLicenseData[]> => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/simulator/auth_object_field_license_data/`, {
//       params: {
//         authorization_object: authorizationObject,
//         field: field,
//         client_name: clientName,
//         system_name: systemName
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error(`Error fetching auth object field license data for ${authorizationObject}, ${field}:`, error);
//     throw error;
//   }
// };

// export interface SimulationChangePayload {
//   role_id: string;
//   object: string;
//   field_name: string;
//   value_low: string;
//   value_high: string;
//   ttext?: string;
//   classification?: string; // Original CLASSIF_S4
//   action: "Add" | "Change" | "Remove"; // Literal types for strictness
//   new_value_ui_text?: string; // The UI_TEXT chosen by the user
//   is_new_object: boolean;
//   frontend_id: number; // Frontend's temporary ID for tracking
// }


// export interface ApplySimulationResponse {
//   simulation_run_id: string;
//   status: "In Progress" | "Processing Changes" | "Completed" | "Failed";
//   timestamp: string;
//   client_name: string;
//   system_name: string;
// }

// // Update the existing interface to match your backend response
// export const applySimulationChangesToDb = async (
//   clientName: string,
//   systemName: string,
//   changes: SimulationChangePayload[]
// ): Promise<ApplySimulationResponse> => {
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}/simulator/apply-simulation-changes/`,
//       changes,
//       {
//         params: { 
//           client_name: clientName, 
//           system_name: systemName 
//         }
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Error applying simulation changes to DB:", error);
//     if (axios.isAxiosError(error) && error.response?.status === 500) {
//       throw new Error("Simulation initialization failed. Please try again.");
//     }
//     throw error;
//   }
// };



// export const getLicenseClassificationPivotTableforSim = async (
//   clientName: string,
//   systemName: string
// ): Promise<PivotTableResponse> => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/simulator/license-classification-simulation/`, {
//       params: { client_name: clientName, system_name: systemName }
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching license classification pivot table:", error);
//     throw error;
//   }
// };

// export interface AddSuggestion {
//   value: string;
//   license: string;
//   ui_text: string;
//   text: string;
// }

// export interface AssignedUserDetail {
//   user_id: string;
//   final_fue_license: string;
// }

// export const getAssignedUsers = async (
//   roleId: string,
//   clientName: string,
//   systemName: string
// ): Promise<AssignedUserDetail[]> => {
//   const response = await fetch(
//     `${API_BASE_URL}/fue/role-assigned-users/${encodeURIComponent(roleId)}?client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`
//   );
//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
//   }
//   return response.json();
// };

// export const getAddSuggestions = async (
//   authorizationObject: string,
//   field: string,
//   clientName: string,
//   systemName: string
// ): Promise<AddSuggestion[]> => {
//   const response = await fetch(
//     `${API_BASE_URL}/simulator/get-add-suggestions/?authorization_object=${encodeURIComponent(authorizationObject)}&field=${encodeURIComponent(field)}&client_name=${encodeURIComponent(clientName)}&system_name=${encodeURIComponent(systemName)}`
//   );

//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   return response.json();
// };

// // Add this to your simulation_api.ts file
// export interface CreateSimulationTableResponse {
//   status: string;
//   message: string;
//   table_name: string;
//   records_copied?: number;
// }
// export async function createSimulationTable(
//   clientName: string,
//   systemName: string,
//   systemReleaseInfo: string
// ): Promise<CreateSimulationTableResponse> {
//   // Create URL with query parameters
//   const url = new URL(`${API_BASE_URL}/data/create-role-obj-lic-simulation-table`);
//   url.searchParams.append('client_name', clientName);
//   url.searchParams.append('system_name', systemName);
//   url.searchParams.append('system_release_info', systemReleaseInfo);

//   const response = await fetch(url.toString(), {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     // Remove the body since we're using query parameters
//   });

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.detail || `Failed to create simulation table: HTTP status ${response.status}`);
//   }

//   return response.json();
// }


// src/api/simulation_api.ts

const API_BASE_URL = "http://localhost:8000";

// ============================================================================
// INTERFACES
// ============================================================================

export interface SimulationRole {
  id: string;
  profile: string;
  description: string;
  classification: string;
  assignedUsers: number;
  gb: number;
  gc: number;
  gd: number;
  total_objects: number;
}

export interface AuthObjectDetail {
  object: string;
  fieldName: string;
  valueLow: string;
  valueHigh: string;
  classification: string;
  operation: string | null;
  originalClassification: string;
}

export interface SpecificRoleSimulationDetails {
  roleName: string;
  objectDetails: AuthObjectDetail[];
}

export interface SimulationChange {
  role_name: string;
  role_description: string;
  object: string;
  field: string;
  value_low: string;
  value_high: string;
  action: string; // 'Add', 'Change', 'Remove'
  original_license: string;
  new_value_low?: string;
  new_value_high?: string;
}

export interface SimulationRequest {
  changes: SimulationChange[];
}

export interface SimulationResultChange {
  role_name: string;
  role_description: string;
  object: string;
  field: string;
  value_low: string;
  value_high: string;
  operation: string;
  prev_license: string;
  current_license: string;
  status: string;
}

export interface SimulationResult {
  simulation_run_id: string;
  timestamp: string;
  status: string;
  total_fue: string;
  gb_fue: string;
  gc_fue: string;
  gd_fue: string;
  changes: SimulationResultChange[];
}

export interface SimulationResultsResponse {
  message: string;
  system_name: string;
  results: SimulationResult[];
}

export interface FUESummary {
  "GB Advanced Use FUE": number;
  "GC Core Use FUE": number;
  "GD Self-Service Use FUE": number;
  "Total FUE Required": number;
}

export interface PivotTable {
  Users: {
    "GB Advanced Use": number;
    "GC Core Use": number;
    "GD Self-Service Use": number;
    "Not Classified": number;
    Total: number;
  };
}

export interface LicenseClassificationPivotResponse {
  pivot_table: PivotTable;
  fue_summary: FUESummary;
  system_name: string;
}

export interface AuthFieldLicense {
  AUTHORIZATION_OBJECT: string;
  FIELD: string;
  ACTIVITY: string;
  LICENSE: string;
  TEXT: string;
  UI_TEXT: string;
}

export interface AddSuggestion {
  value: string;
  license: string;
  ui_text: string;
  text: string;
}

// ============================================================================
// SIMULATION INITIALIZATION & MANAGEMENT
// ============================================================================

/**
 * Initialize simulation table for a system
 */
export const initializeSimulation = async (systemName: string): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulation/${encodeURIComponent(systemName)}/initialize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to initialize simulation: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error initializing simulation:", error);
    throw error;
  }
};

/**
 * Reset simulation table to original state
 */
export const resetSimulation = async (systemName: string): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulation/${encodeURIComponent(systemName)}/reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to reset simulation: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error resetting simulation:", error);
    throw error;
  }
};

// ============================================================================
// SIMULATION ROLE DATA
// ============================================================================

/**
 * Get all roles for simulation UI
 */
export const getSimulationRoles = async (
  systemName: string
): Promise<SimulationRole[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulation-helpers/${encodeURIComponent(systemName)}/roles/details`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch simulation roles: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching simulation roles:", error);
    throw error;
  }
};

/**
 * Get specific role details for simulation
 */
export const getSpecificRoleSimulationDetails = async (
  systemName: string,
  roleName: string
): Promise<SpecificRoleSimulationDetails> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulation-helpers/${encodeURIComponent(systemName)}/role-details/${encodeURIComponent(roleName)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch role simulation details: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching role simulation details:", error);
    throw error;
  }
};

// ============================================================================
// SIMULATION CHANGES
// ============================================================================

/**
 * Apply simulation changes
 */
export const applySimulationChanges = async (
  systemName: string,
  changes: SimulationChange[]
): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulation/${encodeURIComponent(systemName)}/apply-changes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ changes }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to apply simulation changes: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error applying simulation changes:", error);
    throw error;
  }
};

// ============================================================================
// SIMULATION RESULTS
// ============================================================================

/**
 * Get all simulation results for a system
 */
export const getSimulationResults = async (
  systemName: string
): Promise<SimulationResultsResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulation/${encodeURIComponent(systemName)}/results`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch simulation results: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching simulation results:", error);
    throw error;
  }
};

// ============================================================================
// FUE CALCULATION
// ============================================================================

/**
 * Get current FUE calculation based on simulation state
 */
export const getCurrentSimulationFUE = async (
  systemName: string
): Promise<LicenseClassificationPivotResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulation-helpers/${encodeURIComponent(systemName)}/fue-calculation`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch simulation FUE: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching simulation FUE:", error);
    throw error;
  }
};

/**
 * Get license classification pivot table (actual FUE from non-simulation tables)
 */
export const getLicenseClassificationPivotTable = async (
  systemName: string
): Promise<LicenseClassificationPivotResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/fue/dashboard/${encodeURIComponent(systemName)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch actual FUE: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform dashboard response to pivot table format
    const userLicDist = data.user_license_distribution || {};
    const total = (userLicDist.GB || 0) + (userLicDist.GC || 0) + (userLicDist.GD || 0) + (userLicDist["Not Classified"] || 0);
    
    return {
      pivot_table: {
        Users: {
          "GB Advanced Use": userLicDist.GB || 0,
          "GC Core Use": userLicDist.GC || 0,
          "GD Self-Service Use": userLicDist.GD || 0,
          "Not Classified": userLicDist["Not Classified"] || 0,
          Total: total
        }
      },
      fue_summary: {
        "GB Advanced Use FUE": Math.ceil((userLicDist.GB || 0) * 1.0),
        "GC Core Use FUE": Math.ceil((userLicDist.GC || 0) * 0.2),
        "GD Self-Service Use FUE": Math.ceil((userLicDist.GD || 0) * 0.0333),
        "Total FUE Required": Math.ceil((userLicDist.GB || 0) * 1.0) + 
                             Math.ceil((userLicDist.GC || 0) * 0.2) + 
                             Math.ceil((userLicDist.GD || 0) * 0.0333)
      },
      system_name: systemName
    };
  } catch (error) {
    console.error("Error fetching actual FUE:", error);
    throw error;
  }
};

// ============================================================================
// AUTH OBJECT & FIELD DATA
// ============================================================================

/**
 * Get auth object field license data
 */
export const getAuthFieldLicenses = async (
  systemName: string,
  authorizationObject: string,
  field: string
): Promise<AuthFieldLicense[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulation-helpers/${encodeURIComponent(systemName)}/auth-field-licenses?authorization_object=${encodeURIComponent(authorizationObject)}&field=${encodeURIComponent(field)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch auth field licenses: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching auth field licenses:", error);
    throw error;
  }
};

/**
 * Get add suggestions for authorization object and field
 */
export const getAddSuggestions = async (
  systemName: string,
  authorizationObject: string,
  field: string
): Promise<AddSuggestion[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simulation-helpers/${encodeURIComponent(systemName)}/add-suggestions?authorization_object=${encodeURIComponent(authorizationObject)}&field=${encodeURIComponent(field)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch add suggestions: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching add suggestions:", error);
    throw error;
  }
};



export interface RoleForSimulation {
  id: string;
  profile: string;
  description: string;
  classification: string;
  assignedUsers: number;
  gb: number;
  gc: number;
  gd: number;
  total_objects: number;
}

export interface ObjectDetail {
  object: string;
  fieldName: string;
  valueLow: string;
  valueHigh: string;
  classification: string;
  operation?: string | null;
  originalClassification: string;
  ttext?: string;
}

export interface SpecificRoleDetails {
  roleName: string;
  objectDetails: ObjectDetail[];
}

export interface AuthObjectFieldLicenseData {
  AUTHORIZATION_OBJECT: string;
  FIELD: string;
  ACTIVITY: string;
  LICENSE: string;
  TEXT: string;
  UI_TEXT: string;
}

export interface AddSuggestion {
  value: string;
  license: string;
  ui_text: string;
  text: string;
}

export interface SimulationChangePayload {
  role_name: string;
  role_description: string;
  object: string;
  field: string;
  value_low: string;
  value_high: string;
  action: "Add" | "Change" | "Remove";
  original_license: string;
  new_value_low?: string | null;
  new_value_high?: string | null;
}


export interface SimulationInitResponse {
  simulation_run_id: string;
  status: string;
  timestamp: string;
  changes_count: number;
  roles_affected: number;
}

export interface FUECalculation {
  pivot_table: {
    Users: {
      "GB Advanced Use": number;
      "GC Core Use": number;
      "GD Self-Service Use": number;
      "Not Classified": number;
      Total: number;
    };
  };
  fue_summary: {
    "GB Advanced Use FUE": number;
    "GC Core Use FUE": number;
    "GD Self-Service Use FUE": number;
    "Total FUE Required": number;
  };
  system_name: string;
}

export interface SimulationResultChange {
  role_name: string;
  role_description: string;
  object: string;
  field: string;
  value_low: string;
  value_high: string;
  operation: string;
  prev_license: string;
  current_license: string;
  status: string;
}

export interface SimulationResult {
  simulation_run_id: string;
  timestamp: string;
  status: string;
  total_fue: string;
  gb_fue: string;
  gc_fue: string;
  gd_fue: string;
  changes: SimulationResultChange[];
}

export interface SimulationResultsResponse {
  message: string;
  system_name: string;
  results: SimulationResult[];
}

// ════════════════════════════════════════════════════════════════════════════
// API Functions - Simulation Helpers
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get all roles with their classification details for simulation UI
 * Endpoint: GET /simulation-helpers/{system_name}/roles/details
 */
export async function getRoleDetailsforSim(
  clientName: string,
  systemName: string
): Promise<RoleForSimulation[]> {
  const response = await fetch(
    `${API_BASE_URL}/simulation-helpers/${systemName}/roles/details`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch role details: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get detailed authorization objects for a specific role
 * Endpoint: GET /simulation-helpers/{system_name}/role-details/{role_name}
 */
export async function getSpecificRoleDetailsforSim(
  roleName: string,
  clientName: string,
  systemName: string
): Promise<SpecificRoleDetails> {
  const response = await fetch(
    `${API_BASE_URL}/simulation-helpers/${systemName}/role-details/${encodeURIComponent(roleName)}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch specific role details: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get license data for authorization object and field (for Change operations)
 * Endpoint: GET /simulation-helpers/{system_name}/auth-field-licenses
 */
export async function getAuthObjFieldLicData(
  authorizationObject: string,
  field: string,
  clientName: string,
  systemName: string
): Promise<AuthObjectFieldLicenseData[]> {
  const params = new URLSearchParams({
    authorization_object: authorizationObject,
    field: field,
  });

  const response = await fetch(
    `${API_BASE_URL}/simulation-helpers/${systemName}/auth-field-licenses?${params}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch auth field license data: ${response.statusText}`);
  }

  return response.json();
}


// ════════════════════════════════════════════════════════════════════════════
// API Functions - Simulation Operations
// ════════════════════════════════════════════════════════════════════════════

/**
 * Initialize simulation table (create and populate with current data)
 * Endpoint: POST /simulation/{system_name}/initialize
 */
export async function createSimulationTable(
  systemName: string
): Promise<{ status: string; message: string; records_copied: number }> {
  const response = await fetch(
    `${API_BASE_URL}/simulation/${systemName}/initialize`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to initialize simulation: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Apply simulation changes and run FUE calculation in background
 * Endpoint: POST /simulation/{system_name}/apply-changes
 */
/**
 * Apply simulation changes and run FUE calculation in background
 * Endpoint: POST /simulation/{system_name}/apply-changes
 */
export async function applySimulationChangesToDb(
  clientName: string,
  systemName: string,
  changes: SimulationChangePayload[]
): Promise<SimulationInitResponse> {
  console.log("=== API CALL DEBUG ===");
  console.log("System:", systemName);
  console.log("Changes count:", changes.length);
  console.log("First change:", changes[0]);
  
  // ✅ Validate that all required fields are present and are strings
  const validatedChanges = changes.map(change => ({
    role_name: String(change.role_name),
    role_description: String(change.role_description || ""),
    object: String(change.object),
    field: String(change.field),
    value_low: String(change.value_low),
    value_high: String(change.value_high || ""),  // ✅ Ensure empty string if null/undefined
    action: String(change.action),
    original_license: String(change.original_license),
    new_value_low: change.new_value_low ? String(change.new_value_low) : "",
    new_value_high: change.new_value_high ? String(change.new_value_high) : "",
  }));

  const payload = { changes: validatedChanges };
  
  console.log("Payload being sent:", JSON.stringify(payload, null, 2));
  console.log("===================");

  const response = await fetch(
    `${API_BASE_URL}/simulation/${systemName}/apply-changes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),  // ✅ Send wrapped payload
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.detail || `Failed to apply simulation changes: ${response.statusText}`);
    } catch (parseError) {
      throw new Error(`Failed to apply simulation changes: ${response.statusText} - ${errorText}`);
    }
  }

  return response.json();
}

// export async function applySimulationChangesToDb(
//   clientName: string,
//   systemName: string,
//   changes: SimulationChangePayload[]
// ): Promise<SimulationInitResponse> {
//   const response = await fetch(
//     `${API_BASE_URL}/simulation/${systemName}/apply-changes`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ changes }), // ✅ Wrapped in { changes } to match SimulationRequest schema
//     }
//   );

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({}));
//     throw new Error(errorData.detail || `Failed to apply simulation changes: ${response.statusText}`);
//   }

//   return response.json();
// }
