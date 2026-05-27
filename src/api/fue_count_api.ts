

const API_BASE_URL = "http://127.0.0.1:8000"; 


export interface RoleDetailResponse {
  id: string;
  profile: string;
  description: string;
  classification: string;
  assignedUsers: number;
  gb: number;
  gc: number;
  gd: number;
}

export interface ObjectDetail {
  object: string;
  fieldName: string;
  valueLow: string;
  valueHigh: string;
  classification: string;
  ttext: string;  // This will be MATCH_TYPE from RoleLic
}

export interface SpecificRoleDetailsResponse {
  roleName: string;
  roleDescription: string;
  objectDetails: ObjectDetail[];
}

export interface UserWithLicense {
  username: string;
  licenseFromRole: string;
}

export interface UsersByRoleResponse {
  roleName: string;
  systemName: string;
  userCount: number;
  users: UserWithLicense[];
}

export interface DashboardSection {
  gb: number;
  gc: number;
  gd: number;
  total: number;
}

export interface DashboardResponse {
  user_license_distribution: DashboardSection;
  role_license_distribution: DashboardSection;
  dormant_90: DashboardSection;
  dormant_180: DashboardSection;
  expired_not_locked: DashboardSection;
  locked_not_expired: DashboardSection;
}

export interface SystemResponse {
  id: number;
  SYSTEM_NAME: string;
  SYSTEM_RELEASE_INFO: string;
}

export async function fetchRoleDetails(
  systemName: string
): Promise<RoleDetailResponse[]> {
  const url = `${API_BASE_URL}/fue/roles/details/?system_name=${encodeURIComponent(systemName)}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch role details: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

export async function fetchSpecificRoleDetails(
  roleName: string,
  systemName: string
): Promise<SpecificRoleDetailsResponse> {
  const url = `${API_BASE_URL}/fue/role-details/${encodeURIComponent(roleName)}?system_name=${encodeURIComponent(systemName)}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch specific role details: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

export async function fetchUsersByRole(
  roleName: string,
  systemName: string
): Promise<UsersByRoleResponse> {
  const url = `${API_BASE_URL}/fue/users-by-role/${encodeURIComponent(roleName)}?system_name=${encodeURIComponent(systemName)}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch users by role: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}

export async function fetchDashboard(
  systemName: string
): Promise<DashboardResponse> {
  const url = `${API_BASE_URL}/fue/dashboard/${encodeURIComponent(systemName)}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch dashboard: ${response.status} - ${errorText}`);
  }
  
  return response.json();
}