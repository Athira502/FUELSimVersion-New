
// // @ts-nocheck
// import React, { useState, useEffect } from "react";
// import Layout from "@/components/Layout";
// import { useToast } from "@/components/ui/use-toast";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import OptimizationRequestsTable from "@/components/OptimizationRequestsTable";
// import { Loader2 } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
// import RoleSearchDropdown, { RoleOption } from "@/components/FilterRoles";

// import {
//   OptimizationRequest,
//   LicenseType as FrontendLicenseType,
// } from "@/types/optimization";

// import {
//   getLicenseTypes,
//   getOptimizationRequests,
//   createOptimizationRequest,
// } from "@/services/optimizationService";

// import { fetchSystems, DEFAULT_CLIENT } from "@/api/data_post";
// import { getRoleDetails } from "@/api/simulation_api";

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { CreateOptimizationRequestPayload } from "@/api/lic_opt";

// interface Option {
//   value: string;
//   label: string;
// }

// const RoleOptimization = () => {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
//   const [systemsList, setSystemsList] = useState<Array<{ system_name: string; system_release?: string }>>([]);
//   const [selectedSystem, setSelectedSystem] = useState<string>("");
//   const [SAPsysteminfo, setSAPsysteminfo] = useState<string>("");
//   const [selectedLicense, setSelectedLicense] = useState<string>("");
//   const [ratioInput, setRatioInput] = useState<string>("");

//   const [isFilterOpen, setIsFilterOpen] = useState(true);

//   // Load systems on mount
//   useEffect(() => {
//     const load = async () => {
//       try {
//         const systems = await fetchSystems();
//         setSystemsList(systems);
//       } catch (error: any) {
//         toast({ title: "Error", description: error.message, variant: "destructive", duration: 900 });
//       }
//     };
//     load();
//   }, [toast]);

//   // Load roles for the selected system (for multi-select dropdown)
//   const { data: roleDetails = [], isLoading: isLoadingRoles } = useQuery({
//     queryKey: ["roleDetails", DEFAULT_CLIENT, selectedSystem],
//     queryFn: () => getRoleDetails(DEFAULT_CLIENT, selectedSystem),
//     enabled: !!selectedSystem,
//     staleTime: 5 * 60 * 1000,
//   });

//   const roleOptions: RoleOption[] = (roleDetails || []).map((r: any) => ({
//     value: r.profile || r.role_name || r.role_id,
//     label: r.profile || r.role_name || r.role_id,
//     description: r.description,
//     classification: r.classification,
//   }));

//   const { data: licenseTypes = [], isLoading: isLoadingLicenseTypes } = useQuery({
//     queryKey: ["licenseTypes", DEFAULT_CLIENT, selectedSystem],
//     queryFn: () => getLicenseTypes(DEFAULT_CLIENT, selectedSystem),
//     enabled: !!selectedSystem,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   });

//   const {
//     data: requests = [],
//     refetch: refetchRequests,
//     isLoading: isLoadingRequests,
//   } = useQuery({
//     queryKey: ["roleOptimizationRequests"],
//     queryFn: () => getOptimizationRequests(),
//   });

//   const licenseOptions: Option[] = licenseTypes.map((license: FrontendLicenseType) => ({
//     value: license.id,
//     label: license.name,
//   }));

//   const createRequestMutation = useMutation({
//     mutationFn: createOptimizationRequest,
//     onSuccess: (data) => {
//       toast({
//         title: "Request Initiated",
//         description: `Optimization request ${data.request_id} has been started and is processing in the background.`,
//         duration: 1000,
//       });
//       queryClient.invalidateQueries({ queryKey: ["roleOptimizationRequests"] });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create optimization request. Please try again.",
//         variant: "destructive",
//         duration: 900,
//       });
//     },
//   });

//   const handleAnalyze = () => {
//     if (!selectedSystem) {
//       toast({
//         title: "Missing Information",
//         description: "System SID is required.",
//         variant: "destructive",
//         duration: 900,
//       });
//       return;
//     }

//     const payload: CreateOptimizationRequestPayload = {
//       client_name: DEFAULT_CLIENT,
//       system_id: selectedSystem,
//       role_names: selectedRoles,
//       target_license: selectedLicense || undefined,
//       ratio_threshold: ratioInput ? parseFloat(ratioInput) : undefined,
//       sap_system_info: SAPsysteminfo || "S4 HANA OnPremise 1909 Initial Support Pack",
//     };

//     if (payload.ratio_threshold !== undefined && isNaN(payload.ratio_threshold)) {
//       toast({
//         title: "Invalid Input",
//         description: "Ratio Threshold must be a valid number.",
//         variant: "destructive",
//         duration: 900,
//       });
//       return;
//     }

//     createRequestMutation.mutate(payload);

//     setTimeout(() => {
//       queryClient.invalidateQueries({ queryKey: ["roleOptimizationRequests"] });
//     }, 1000);
//   };

//   const handleClear = () => {
//     setSelectedRoles([]);
//     setSelectedSystem("");
//     setSelectedLicense("");
//     setRatioInput("");
//     setSAPsysteminfo("");
//   };

//   const isAnalyzing = createRequestMutation.status === "pending";

//   return (
//     <Layout title="Role Level License Optimization">
//       <div className="space-y-6">
//         <Card>
//           <CardHeader className="pb-3">
//             <CardTitle className="text-xl flex justify-between items-center">
//               <span>Optimization Filters</span>
//               <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)}>
//                 {isFilterOpen ? "Hide" : "Show"}
//               </Button>
//             </CardTitle>
//           </CardHeader>
//           <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
//             <CollapsibleContent>
//               <CardContent className="space-y-4">
//                 {/* Row 1: System SID */}
//                 <div className="grid gap-4 md:grid-cols-2">
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">Select System SID *</label>
//                     <Select value={selectedSystem} onValueChange={setSelectedSystem}>
//                       <SelectTrigger className="w-full">
//                         <SelectValue placeholder="Select System SID" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {systemsList.map((s) => (
//                           <SelectItem key={s.system_name} value={s.system_name}>
//                             {s.system_name}{s.system_release ? ` — ${s.system_release}` : ""}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 {/* Row 2: Role multi-select, License Type, Ratio */}
//                 <div >
//                   <div className="space-y-2">
//                     <label className="text-sm font-medium">Role(s)</label>
//                     <RoleSearchDropdown
//                       options={roleOptions}
//                       value={selectedRoles}
//                       onChange={(v) => setSelectedRoles(Array.isArray(v) ? v : [v])}
//                       multiSelect
//                       disabled={!selectedSystem || isLoadingRoles}
//                       placeholder={
//                         !selectedSystem
//                           ? "Select a system first"
//                           : isLoadingRoles
//                           ? "Loading roles…"
//                           : "Search & select roles (e.g. Z*FI*)"
//                       }
//                     />
//                     <p className="text-xs text-gray-500">
//                       Leave empty to analyze all roles. Wildcards supported (e.g. <code>Z*FI*</code>).
//                     </p>
//                   </div>

                 

                
//                 </div>

//                 <div className="flex items-center justify-end space-x-2 pt-4">
//                   <Button variant="outline" onClick={handleClear}>
//                     Clear
//                   </Button>
//                   <Button
//                     onClick={handleAnalyze}
//                     disabled={isAnalyzing || !selectedSystem}
//                   >
//                     {isAnalyzing ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Analyzing...
//                       </>
//                     ) : (
//                       "Analyze"
//                     )}
//                   </Button>
//                 </div>
//               </CardContent>
//             </CollapsibleContent>
//           </Collapsible>
//         </Card>

//         <div>
//           <div className="flex items-center justify-between mb-4">
//             <h3 className="text-lg font-medium">Optimization Requests</h3>
//             <Button variant="outline" onClick={() => refetchRequests()}>
//               Refresh
//             </Button>
//           </div>

//           {isLoadingRequests ? (
//             <div className="flex justify-center items-center p-12">
//               <Loader2 className="h-8 w-8 animate-spin text-belize-600" />
//             </div>
//           ) : (
//             <OptimizationRequestsTable requests={requests} requestType="role" />
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default RoleOptimization;


// src/pages/RoleOptimization.tsx
// @ts-nocheck
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import OptimizationRequestsTable from "@/components/OptimizationRequestsTable";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import RoleSearchDropdown, { RoleOption } from "@/components/FilterRoles";

import type { LicenseType as FrontendLicenseType } from "@/types/optimization";
import type { CreateOptimizationPayload } from "@/api";

import {
  getLicenseTypes,
  getOptimizationRequests,
  createOptimizationRequest,
} from "@/services/optimizationService";

import { fetchAllSystems, SystemResponse } from "../api/overview";
import { getRoleDetails } from "@/api";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const RoleOptimization = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [SAPsysteminfo, setSAPsysteminfo] = useState<string>("");
  const [selectedLicense, setSelectedLicense] = useState<string>("");
  const [ratioInput, setRatioInput] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // ── Systems list ────────────────────────────────────────────────────────────
  const { 
    data: systemsList = [], 
    isLoading: isLoadingSystem,
    error: systemsError 
  } = useQuery({
    queryKey: ["systems"],
    queryFn: fetchAllSystems,
    staleTime: 5 * 60 * 1000,
    onError: (err: Error) => {
      console.error("Error loading systems:", err);
      toast({ 
        title: "Error loading systems", 
        description: err.message, 
        variant: "destructive", 
        duration: 2000 
      });
    },
  });

  // Debug: Log systems data when it loads
  useEffect(() => {
    console.log("Systems list loaded:", systemsList);
    if (systemsError) {
      console.error("Systems error:", systemsError);
    }
  }, [systemsList, systemsError]);

  // ── Roles for selected system ────────────────────────────────────────────────
  const { data: roleDetails = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roleDetails", selectedSystem],
    queryFn: () => getRoleDetails(selectedSystem),
    enabled: !!selectedSystem,
    staleTime: 5 * 60 * 1000,
  });

  const roleOptions: RoleOption[] = (roleDetails ?? []).map((r) => ({
    value: r.profile,
    label: r.profile,
    description: r.description,
    classification: r.classification,
  }));

  // ── License types for selected system ───────────────────────────────────────
  const { data: licenseTypes = [], isLoading: isLoadingLicenseTypes } = useQuery({
    queryKey: ["licenseTypes", selectedSystem],
    queryFn: () => getLicenseTypes(selectedSystem),
    enabled: !!selectedSystem,
    staleTime: 5 * 60 * 1000,
  });

  // ── Optimisation requests list ───────────────────────────────────────────────
  const {
    data: requests = [],
    refetch: refetchRequests,
    isLoading: isLoadingRequests,
  } = useQuery({
    queryKey: ["roleOptimizationRequests"],
    queryFn: getOptimizationRequests,
    // Refresh every 15 s so in-progress requests update automatically.
    refetchInterval: 15_000,
  });

  // ── Create optimisation request mutation ─────────────────────────────────────
  const createRequestMutation = useMutation({
    mutationFn: createOptimizationRequest,
    onSuccess: (data) => {
      toast({
        title: "Request Initiated",
        description: `Optimisation request ${data.request_id} is now processing in the background.`,
        duration: 3000,
      });
      // Invalidate immediately and after a short delay to catch the first status update.
      queryClient.invalidateQueries({ queryKey: ["roleOptimizationRequests"] });
      setTimeout(
        () => queryClient.invalidateQueries({ queryKey: ["roleOptimizationRequests"] }),
        3000
      );
    },
    onError: (err: Error) =>
      toast({ title: "Error", description: err.message, variant: "destructive", duration: 2000 }),
  });

  const handleAnalyze = () => {
    if (!selectedSystem) {
      toast({
        title: "Missing Information",
        description: "Please select a System SID.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const threshold = ratioInput ? parseFloat(ratioInput) : undefined;
    if (threshold !== undefined && isNaN(threshold)) {
      toast({
        title: "Invalid Input",
        description: "Ratio Threshold must be a valid number.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const payload: CreateOptimizationPayload = {
      system_id:       selectedSystem,
      role_names:      selectedRoles.length > 0 ? selectedRoles : undefined,
      target_license:  selectedLicense || undefined,
      ratio_threshold: threshold,
      sap_system_info: SAPsysteminfo || "S4 HANA OnPremise 1909 Initial Support Pack",
    };

    createRequestMutation.mutate(payload);
  };

  const handleClear = () => {
    setSelectedRoles([]);
    setSelectedSystem("");
    setSelectedLicense("");
    setRatioInput("");
    setSAPsysteminfo("");
  };

  const isAnalyzing = createRequestMutation.status === "pending";

  return (
    <Layout title="Role Level License Optimization">
      <div className="space-y-6">

        {/* ── Filter Card ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex justify-between items-center">
              <span>Optimization Filters</span>
              <Button variant="ghost" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                {isFilterOpen ? "Hide" : "Show"}
              </Button>
            </CardTitle>
          </CardHeader>
          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <CollapsibleContent>
              <CardContent className="space-y-4">

                {/* System SID */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select System SID *</label>
                    <Select 
                      value={selectedSystem} 
                      onValueChange={(v) => { 
                        console.log("System selected:", v);
                        setSelectedSystem(v); 
                        setSelectedRoles([]); 
                        setSelectedLicense(""); 
                      }}
                      disabled={isLoadingSystem}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingSystem ? "Loading systems..." : "Select System SID"} />
                      </SelectTrigger>
                      <SelectContent>
                        {systemsList && systemsList.length > 0 ? (
                          systemsList.map((s: SystemResponse) => (
                            <SelectItem key={s.SYSTEM_NAME} value={s.SYSTEM_NAME}>
                              {s.SYSTEM_NAME}
                              {s.SYSTEM_RELEASE_INFO ? ` — ${s.SYSTEM_RELEASE_INFO}` : ""}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-systems" disabled>
                            {isLoadingSystem ? "Loading..." : "No systems available"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {systemsError && (
                      <p className="text-xs text-red-500">Error loading systems. Please refresh.</p>
                    )}
                  </div>

                  {/* License type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target License</label>
                    <Select
                      value={selectedLicense}
                      onValueChange={setSelectedLicense}
                      disabled={!selectedSystem || isLoadingLicenseTypes}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingLicenseTypes ? "Loading…" : "Select license type (optional)"} />
                      </SelectTrigger>
                      <SelectContent>
                        {licenseTypes.map((lt: FrontendLicenseType) => (
                          <SelectItem key={lt.id} value={lt.id}>{lt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Roles multi-select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role(s)</label>
                  <RoleSearchDropdown
                    options={roleOptions}
                    value={selectedRoles}
                    onChange={(v) => setSelectedRoles(Array.isArray(v) ? v : [v])}
                    multiSelect
                    disabled={!selectedSystem || isLoadingRoles}
                    placeholder={
                      !selectedSystem
                        ? "Select a system first"
                        : isLoadingRoles
                        ? "Loading roles…"
                        : "Search & select roles (e.g. Z*FI*)"
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to analyse all roles under the selected license.
                  </p>
                </div>

                {/* SAP system info + ratio */}
              

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={handleClear}>Clear</Button>
                  <Button onClick={handleAnalyze} disabled={isAnalyzing || !selectedSystem}>
                    {isAnalyzing ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing…</>
                    ) : "Analyze"}
                  </Button>
                </div>

              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* ── Requests table ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Optimization Requests</h3>
            <Button variant="outline" size="sm" onClick={() => refetchRequests()}>Refresh</Button>
          </div>

          {isLoadingRequests ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-belize-600" />
            </div>
          ) : (
            <OptimizationRequestsTable requests={requests} requestType="role" />
          )}
        </div>

      </div>
    </Layout>
  );
};

export default RoleOptimization;