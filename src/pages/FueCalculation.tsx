// src/pages/FueCalculation.tsx
// @ts-nocheck

const API_BASE_URL = "http://127.0.0.1:8000";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, AlertCircle, Users, FolderKanban } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  fetchRoleDetails,
  RoleDetailResponse
  
} from "@/api/fue_count_api";
import {
  fetchAllSystems,
  SystemResponse,
  fetchDashboard,
  DashboardResponse
} from "@/api/overview";
import RoleSearchDropdown, { RoleOption } from "@/components/FilterRoles";

const FueCalculation = () => {
  // Use TanStack Router hooks
  const navigate = useNavigate({ from: '/fue-calculation' });
  const searchParams = useSearch({ from: '/fue-calculation' }) as { system?: string };
  const { toast } = useToast();

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]); // ✅ ADD THIS
  // const [searchTerm, setSearchTerm] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("all");

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [roleDetails, setRoleDetails] = useState<RoleDetailResponse[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [systemsList, setSystemsList] = useState<SystemResponse[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>(searchParams?.system || "");
  const [hasNoRoleData, setHasNoRoleData] = useState(false);
  const [hasNoDashboardData, setHasNoDashboardData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load all systems on mount
  useEffect(() => {
    const loadSystems = async () => {
      try {
        const systems = await fetchAllSystems();
        setSystemsList(systems);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load systems",
          variant: "destructive",
          duration: 900
        });
      }
    };
    loadSystems();
  }, [toast]);

  // Update URL when system changes
  const handleSystemChange = (system: string) => {
    setSelectedSystem(system);
    setDataLoaded(false);
    navigate({
      to: '/fue-calculation',
      search: { system },
      replace: true
    });
  };

  const loadDashboardData = async () => {
    const systemToUse = searchParams?.system || selectedSystem;
    if (!systemToUse) return;

    setIsLoadingDashboard(true);
    setHasNoDashboardData(false);

    try {
      const data = await fetchDashboard(systemToUse);
      setDashboardData(data);
      
      if (data.user_license_distribution.total === 0) {
        setHasNoDashboardData(true);
        toast({
          title: "No Dashboard Data",
          description: `No dashboard data found for system "${systemToUse}".`,
          variant: "destructive",
          duration: 900
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to load dashboard data.";
      setHasNoDashboardData(true);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 900
      });
      setDashboardData(null);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const loadRoleDetails = async () => {
    const systemToUse = searchParams?.system || selectedSystem;
    if (!systemToUse) return;

    setIsLoadingRoles(true);
    setHasNoRoleData(false);

    try {
      const data = await fetchRoleDetails(systemToUse);
      setRoleDetails(data);

      if (data.length === 0) {
        setHasNoRoleData(true);
        toast({
          title: "No Role Data Found",
          description: `No role details found for system "${systemToUse}".`,
          variant: "destructive",
          duration: 900
        });
      } else {
        toast({
          title: "Success",
          description: `Loaded ${data.length} roles successfully.`,
          variant: "default",
          duration: 900
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to load role details.";
      setHasNoRoleData(true);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 900
      });
      setRoleDetails([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  // const reloadAllData = async () => {
  //   const systemToUse = searchParams?.system || selectedSystem;
  //   if (!systemToUse) {
  //     toast({
  //       title: "Missing Selection",
  //       description: "Please select a system first.",
  //       variant: "destructive",
  //       duration: 900
  //     });
  //     return;
  //   }
  //   await Promise.all([loadDashboardData(), loadRoleDetails()]);
  //   setDataLoaded(true);
  // };

  const reloadAllData = async () => {
    const systemToUse = searchParams?.system || selectedSystem;
    if (!systemToUse) {
        toast({ title: "Missing Selection", description: "Please select a system first.", variant: "destructive", duration: 900 });
        return;
    }

    // Step 1: Trigger compute
    try {
        await fetch(`${API_BASE_URL}/data/fue/${systemToUse}/compute/all`, { method: "POST" });
    } catch (error) {
        toast({ title: "Compute Error", description: "Failed to run FUE computation.", variant: "destructive", duration: 900 });
        return;
    }

    // Step 2: Load results
    await Promise.all([loadDashboardData(), loadRoleDetails()]);
    setDataLoaded(true);
};

  // Auto-load data when system in URL changes or on first load with system in URL
  useEffect(() => {
    if (searchParams?.system && systemsList.length > 0 && !dataLoaded) {
      setSelectedSystem(searchParams.system);
      loadDashboardData();
      loadRoleDetails();
      setDataLoaded(true);
    }
  }, [searchParams?.system, systemsList, dataLoaded]);

const getUserFueFromDashboard = () => {
  if (!dashboardData?.user_license_distribution?.breakdown) {
    return { 
      gb: 0, 
      gc: 0, 
      gd: 0, 
      total: 0,
      gb_users: 0,      // ✅ Add these
      gc_users: 0,
      gd_users: 0,
      total_users: 0
    };
  }

  const breakdown = dashboardData.user_license_distribution.breakdown;
  
  const gbEntry = breakdown.find(item => item.category === "GB Advanced Use");
  const gcEntry = breakdown.find(item => item.category === "GC Core Use");
  const gdEntry = breakdown.find(item => item.category === "GD Self-Service Use");

  return {
    gb: gbEntry?.fue || 0,
    gc: gcEntry?.fue || 0,
    gd: gdEntry?.fue || 0,
    total: dashboardData.user_license_distribution.total_fue || 0,

    gb_users: gbEntry?.count || 0,
    gc_users: gcEntry?.count || 0,
    gd_users: gdEntry?.count || 0,
    total_users: dashboardData.user_license_distribution.total_count || 0,
  };
};

// Get role FUE counts from dashboard data
const getRoleFueFromDashboard = () => {
  if (!dashboardData?.role_license_distribution?.breakdown) {
    return { 
      gb: 0, 
      gc: 0, 
      gd: 0, 
      total: 0, 
      gb_fue: 0, 
      gc_fue: 0, 
      gd_fue: 0, 
      total_fue: 0 
    };  // ✅ This one is already correct
  }

  const breakdown = dashboardData.role_license_distribution.breakdown;
  
  const gbEntry = breakdown.find(item => item.category === "GB Advanced Use");
  const gcEntry = breakdown.find(item => item.category === "GC Core Use");
  const gdEntry = breakdown.find(item => item.category === "GD Self-Service Use");

  const gb_count = gbEntry?.count || 0;
  const gc_count = gcEntry?.count || 0;
  const gd_count = gdEntry?.count || 0;

  const gb_fue = gb_count;  // GB: 1:1 ratio
  const gc_fue = Math.ceil(gc_count / 5);  // GC: 5:1 ratio
  const gd_fue = Math.ceil(gd_count / 30);  // GD: 30:1 ratio
  const total_fue = gb_fue + gc_fue + gd_fue;

  return {
    gb: gb_count,
    gc: gc_count,
    gd: gd_count,
    total: dashboardData.role_license_distribution.total_count || 0,
    
    gb_fue: gb_fue,
    gc_fue: gc_fue,
    gd_fue: gd_fue,
    total_fue: total_fue
  };
};

  const userFueData = getUserFueFromDashboard();
  const roleFueData = getRoleFueFromDashboard();
  

  const wildcardToRegExp = (pattern: string): RegExp => {
    const hasWildcard = pattern.includes("*") || pattern.includes("%") || pattern.includes("?");
    if (hasWildcard) {
      const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
      const regexStr = escaped.replace(/[*%]/g, ".*").replace(/\?/g, ".");
      return new RegExp(`^${regexStr}$`, "i");
    }
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    return new RegExp(escaped, "i");
  };

  const roleOptions: RoleOption[] = roleDetails.map((role) => ({
    value: role.id,
    label: role.id,
    description: role.description || "",
    classification: role.classification,
  }));

 

  const filteredRoles = roleDetails.filter((role) => {
    // const matchesSearch = !searchTerm.trim()
    //   ? true
    //   : wildcardToRegExp(searchTerm.trim()).test(role.id) ||
    //     wildcardToRegExp(searchTerm.trim()).test(role.description || "");
     const matchesSelection = selectedRoleIds.length === 0 || selectedRoleIds.includes(role.id);

    const matchesLicense =
      licenseFilter === "all" ||
      role.classification.toLowerCase().includes(licenseFilter.toLowerCase());

    return matchesSelection && matchesLicense;
  });

  return (
    <Layout title="FUE Calculation">
      <div className="space-y-6">

        {/* System Selection */}
        <Card>
          <CardHeader>
            <CardTitle>System Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
              
              {/* System Selection Dropdown */}
              <div className="space-y-2 w-full sm:max-w-xs">
                <label htmlFor="systemSelect" className="text-sm font-medium">
                  Select System <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedSystem}
                  onValueChange={handleSystemChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select System" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemsList.map((system) => (
                      <SelectItem key={system.id} value={system.SYSTEM_NAME}>
                        {system.SYSTEM_NAME}
                        {system.SYSTEM_RELEASE_INFO && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({system.SYSTEM_RELEASE_INFO})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Load Data button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={reloadAllData}
                  disabled={isLoadingRoles || isLoadingDashboard || !selectedSystem}
                  className="flex items-center gap-2 h-10"
                >
                  {(isLoadingRoles || isLoadingDashboard)
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <RefreshCw className="h-4 w-4" />}
                  {(isLoadingRoles || isLoadingDashboard) ? "Loading..." : "Load Data"}
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>

        {hasNoDashboardData && !isLoadingDashboard && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>No dashboard data found</strong> for system "<strong>{selectedSystem}</strong>".
              Please verify the system name is correct, or try a different system.
            </AlertDescription>
          </Alert>
        )}

        {/* User FUE Distribution from Dashboard */}
        {selectedSystem && !hasNoDashboardData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                User License Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDashboard ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading user distribution...</span>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700">
                        <div>License Type</div>
                        <div>Users</div>
                        <div>FUEs</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>GB - Advanced Use</div>
                        <div className="font-medium">{userFueData.gb_users.toLocaleString()}</div>
                        <div className="font-medium">{userFueData.gb.toLocaleString()}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>GC - Core Use</div>
                        <div className="font-medium">{userFueData.gc_users.toLocaleString()}</div>
                        <div className="font-medium">{userFueData.gc.toLocaleString()}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>GD - Self-Service Use</div>
                        <div className="font-medium">{userFueData.gd_users.toLocaleString()}</div>
                        <div className="font-medium">{userFueData.gd.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <div className="border-2 border-green-600 bg-green-50 p-6 rounded-lg text-center">
                      <div className="text-4xl font-bold text-green-800">
                        {userFueData.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600 font-medium mt-2">Total User FUE</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
{/* Role FUE Distribution from Dashboard */}
{selectedSystem && !hasNoDashboardData && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FolderKanban className="h-5 w-5 text-blue-600" />
        Role License Distribution
      </CardTitle>
    </CardHeader>
    <CardContent>
      {isLoadingDashboard ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading role distribution...</span>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700">
                <div>License Type</div>
                <div>Roles</div>
                <div>FUE</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>GB - Advanced Use</div>
                <div className="font-medium">{roleFueData.gb.toLocaleString()}</div>
                <div className="font-medium">{roleFueData.gb_fue.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>GC - Core Use</div>
                <div className="font-medium">{roleFueData.gc.toLocaleString()}</div>
                <div className="font-medium">{roleFueData.gc_fue.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>GD - Self-Service Use</div>
                <div className="font-medium">{roleFueData.gd.toLocaleString()}</div>
                <div className="font-medium">{roleFueData.gd_fue.toLocaleString()}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div className="border-2 border-blue-600 bg-blue-50 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-blue-800">
                {roleFueData.total_fue.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600 font-medium mt-2">Total Role FUE</div>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)}
      
      

        {/* Filter Roles */}
        {selectedSystem && !hasNoRoleData && (
          <Card>
            <CardHeader>
              <CardTitle>Filter Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <RoleSearchDropdown
                    label="Search by Role ID or Description"
                    options={roleOptions}
                    value={selectedRoleIds}
                    // onChange={(val) => setSearchTerm(val as string)}
                    onChange={(val) => setSelectedRoleIds(val as string[])}
                    placeholder={
                      isLoadingRoles
                        ? "Loading roles..."
                        : `Search ${roleOptions.length} roles... (e.g. z*fi*, Z%DISPLAY)`
                    }
                    disabled={isLoadingRoles}
                    multiSelect={true}
                  />
                </div>

                 <div>
                  <label className="text-sm font-medium block mb-2">
                    Filter by License Type
                  </label>
                  <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All License Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All License Types</SelectItem>
                      <SelectItem value="GB Advanced Use">GB - Advanced Use</SelectItem>
                      <SelectItem value="GC Core Use">GC - Core Use</SelectItem>
                      <SelectItem value="GD Self-Service Use">GD - Self-Service Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Show selected count */}
              {selectedRoleIds.length > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Showing {selectedRoleIds.length} selected role{selectedRoleIds.length > 1 ? 's' : ''}
                </div>
              )}
            </CardContent>
          </Card>
        )}
            

        {/* Roles Table */}
        {/* {selectedSystem && (
          <Card>
            <CardHeader>
              <CardTitle>
                Role/Profile License Summary
                {isLoadingRoles && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                    Loading roles...
                  </span>
                )}
                {!isLoadingRoles && filteredRoles.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    {filteredRoles.length} of {roleDetails.length} roles
                  </span>
                )}
              </CardTitle> */}
              {selectedSystem && (
          <Card>
            <CardHeader>
              <CardTitle>
                Role/Profile License Summary
                {isLoadingRoles && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
                    Loading roles...
                  </span>
                )}
                {!isLoadingRoles && filteredRoles.length > 0 && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    {filteredRoles.length} of {roleDetails.length} roles
                  </span>
                )}
                </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRoles ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading role details...</span>
                </div>
              ) : hasNoRoleData ? (
                <div className="flex justify-center items-center py-8 text-gray-500">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="lg:text-lg font-medium">No Role Data Available</p>
                    <p className="text-sm">No role details found for the selected system.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role/Profile</TableHead>
                        <TableHead>Authorization Classification</TableHead>
                        <TableHead>GB Advance Use</TableHead>
                        <TableHead>GC Core Use</TableHead>
                        <TableHead>GD Self-Service Use</TableHead>
                        <TableHead>Assigned to Users</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map((role) => (
                          <TableRow key={role.id} className="cursor-pointer hover:bg-gray-50">
                            <TableCell>
                              <Link
                                to="/role-details/$roleId"
                                params={{ roleId: encodeURIComponent(role.id) }}
                                state={{ systemName: selectedSystem }}
                                className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                              >
                                {role.id}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                role.classification === 'GB Advanced Use' 
                                  ? 'bg-red-100 text-red-800'
                                  : role.classification === 'GC Core Use'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {role.classification}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">{role.gb}</TableCell>
                            <TableCell className="text-center">{role.gc}</TableCell>
                            <TableCell className="text-center">{role.gd}</TableCell>
                            <TableCell className="font-medium">
                              {role.assignedUsers > 0 ? (
                                <Link
                                  to="/role-assigned-users/$roleId"
                                  params={{ roleId: encodeURIComponent(role.id) }}
                                  search={{ systemName: selectedSystem }}
                                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                >
                                  {role.assignedUsers.toLocaleString()}
                                </Link>
                              ) : (
                                <span className="text-gray-400">0</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                            No roles match your current filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default FueCalculation;