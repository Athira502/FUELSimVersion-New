const API_BASE_URL = "http://127.0.0.1:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SystemResponse {
  id: number;
  SYSTEM_NAME: string;
  SYSTEM_RELEASE_INFO: string;
}

export interface LicenseBreakdownItem {
  category: string;
  count: number;
  fue?: number;
}

export interface DashboardSection {
  breakdown: LicenseBreakdownItem[];
  total_count: number;
  total_fue?: number;
}

export interface DashboardResponse {
  user_license_distribution: DashboardSection;
  role_license_distribution: DashboardSection;
  dormant_90: DashboardSection;
  dormant_180: DashboardSection;
  expired_not_locked: DashboardSection;
  locked_not_expired: DashboardSection;
}


export interface SystemCreate {
  SYSTEM_NAME: string;
  SYSTEM_RELEASE_INFO: string;
}
/**
 * GET /systems
 * Returns all systems for the dropdown.
 */
export async function fetchAllSystems(): Promise<SystemResponse[]> {
  const res = await fetch(`${API_BASE_URL}/manage-data/systems`);
  if (!res.ok) throw new Error(`Systems fetch failed: ${res.status}`);
  return res.json();
}

export async function createSystem(payload: SystemCreate): Promise<SystemResponse> {
  const res = await fetch(`${API_BASE_URL}/manage-data/systems`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 409) throw new Error(`System '${payload.SYSTEM_NAME}' already exists.`);
  if (!res.ok) throw new Error(`Failed to create system: ${res.status}`);
  return res.json();
}

/**
 * GET /data/fue/{system_name}/dashboard
 * Returns all dashboard data — users, roles, dormant, expired, locked.
 */
export async function fetchDashboard(systemName: string): Promise<DashboardResponse> {
  const res = await fetch(
    `${API_BASE_URL}/data/fue/${encodeURIComponent(systemName)}/dashboard`
  );
  if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
  return res.json();
}




export const deleteSystem = async (systemName: string) => {
  const response = await fetch(
    `${API_BASE_URL}/manage-data/systems/${encodeURIComponent(systemName)}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to delete system ${systemName}`);
  }
  return await response.json();
};

/**
 * Fetch tables associated with a specific system name
 * GET /manage-data/tables/{system_name}
 */
export const fetchTablesForClientSystem = async (systemName: string): Promise<string[]> => {
  const response = await fetch(
    `${API_BASE_URL}/manage-data/tables/${encodeURIComponent(systemName)}`
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to fetch tables for system ${systemName}`);
  }
  return await response.json();
};

/**
 * Download a specific table's dataset as a CSV stream file
 * GET /manage-data/download/{system_name}/{table_name}
 */
export const downloadTableData = async (systemName: string, tableName: string) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/manage-data/download/${encodeURIComponent(systemName)}/${encodeURIComponent(tableName)}`
    );
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `Failed to download ${tableName} for system ${systemName}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tableName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error(`Error downloading ${tableName} for system ${systemName}:`, error);
    throw error;
  }
};

/**
 * Drops or truncates a table for a given system
 * DELETE /manage-data/delete/{system_name}/{table_name}
 */
export const truncateTableData = async (systemName: string, tableName: string) => {
  const response = await fetch(
    `${API_BASE_URL}/manage-data/delete/${encodeURIComponent(systemName)}/${encodeURIComponent(tableName)}`,
    { method: "DELETE" }
  );
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Failed to truncate table ${tableName} for system ${systemName}`);
  }
  return await response.json();
};

