// @ts-nocheck
import React, { useState, useEffect } from "react"; 
import { Link, useNavigate } from "@tanstack/react-router"; 
import Layout from "@/components/Layout"; 
import RoleSearchDropdown, { RoleOption } from "@/components/FilterRoles";
import RoleProfileSummary from "@/components/RoleProfileSummary"; 
import AuthorizationObjects from "../components/AuthorizationObjects"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button"; 
import { ArrowLeft, RefreshCw, Loader2, AlertCircle } from "lucide-react"; 
import { useToast } from "@/components/ui/use-toast"; 
import { Alert, AlertDescription } from "@/components/ui/alert"; 

import {
  getRoleDetailsforSim,
  getSpecificRoleDetailsforSim,
  getAuthObjFieldLicData,
  applySimulationChangesToDb,
  getLicenseClassificationPivotTable,
  AuthObjectFieldLicenseData,
  SimulationChangePayload,
  AddSuggestion,
  getAddSuggestions,
  createSimulationTable,
} from "@/api/simulation_api";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  fetchAllSystems,
  SystemResponse,
} from "@/api/overview"; 

interface Role { 
  id: string; 
  description: string; 
  classification: string; 
  gb: number; 
  gc: number; 
  gd: number; 
  assignedUsers: number; 
  objects: any[]; 
} 

interface ObjectDetail { 
  id: number; 
  object: string; 
  classification: string; 
  fieldName: string; 
  valueLow: string; 
  valueHigh: string; 
  ttext?: string; 
  action: string | null; 
  newValue: string; 
  isNew: boolean; 
  dynamicLicenseOptions?: { value: string; label: string }[]; 
  addSuggestions?: AddSuggestion[]; 
  selectedLicense?: string; 
} 

interface AllEditedObjects { 
  [roleId: string]: ObjectDetail[]; 
} 

interface PendingChangesSummary { 
  totalChanges: number; 
  changesByAction: Record<string, number>; 
} 

const CreateSimulation = () => { 
  const navigate = useNavigate(); 
  const { toast } = useToast(); 
  // const [searchTerm, setSearchTerm] = useState(""); 
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [licenseFilter, setLicenseFilter] = useState("all"); 
  const [selectedRole, setSelectedRole] = useState<Role | null>(null); 
  const [currentEditedObjects, setCurrentEditedObjects] = useState<ObjectDetail[]>([]); 
  const [hasChanges, setHasChanges] = useState(false); 
  const [objectSearchTerm, setObjectSearchTerm] = useState("");

  const [isEditing, setIsEditing] = useState(false); 
  const [savedChanges, setSavedChanges] = useState(false); 
  const [roles, setRoles] = useState<Role[]>([]); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 

  // ✅ Only system-related state (no client)
  const [systemsList, setSystemsList] = useState<SystemResponse[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>("");

  const [isLoadingRoles, setIsLoadingRoles] = useState(false); 
  const [dataLoaded, setDataLoaded] = useState(false); 
  const [loadingDynamicOptions, setLoadingDynamicOptions] = useState<{ [key: number]: boolean }>({}); 
  const [allEditedObjects, setAllEditedObjects] = useState<AllEditedObjects>({}); 
  const [simulationRunning, setSimulationRunning] = useState(false); 
  const [isCreatingTable, setIsCreatingTable] = useState(false); 

  const [systemReleaseInfo, setSystemReleaseInfo] = useState(""); 
  const [classificationSearchTerm, setClassificationSearchTerm] = useState("");

  // ✅ Load systems on mount
  useEffect(() => {
    const loadSystems = async () => {
      try {
        const systems = await fetchAllSystems();
        console.log("Fetched systems:", systems);
        
        if (Array.isArray(systems)) {
          setSystemsList(systems);
          
          if (systems.length > 0) {
            setSelectedSystem(systems[0].SYSTEM_NAME);
          }
        } else {
          console.error("Systems is not an array:", systems);
          toast({ 
            title: "Error", 
            description: "Invalid systems data received", 
            variant: "destructive",
            duration: 900, 
          });
        }
      } catch (error: any) {
        console.error("Error fetching systems:", error);
        toast({ 
          title: "Error", 
          description: error.message, 
          variant: "destructive",
          duration: 900, 
        });
      }
    };

    loadSystems();
  }, [toast]);

  // ✅ Updated localStorage keys (only system, no client)
  const getLocalStorageKey = (roleId: string, system: string) => 
    `edited_objects_${roleId}_${system}`; 

  const getAllRolesLocalStorageKey = (system: string) => 
    `all_edited_roles_${system}`; 

  // ✅ Load from localStorage when system changes
  useEffect(() => { 
    if (selectedSystem) { 
      const storedAllEditedObjects = localStorage.getItem(getAllRolesLocalStorageKey(selectedSystem)); 
      if (storedAllEditedObjects) { 
        try { 
          const parsed = JSON.parse(storedAllEditedObjects); 
          setAllEditedObjects(parsed); 
        } catch (e) { 
          console.error("Failed to parse allEditedObjects from localStorage:", e); 
          localStorage.removeItem(getAllRolesLocalStorageKey(selectedSystem)); 
        } 
      } 
    } 
  }, [selectedSystem]); 

  useEffect(() => { 
    if (selectedRole && allEditedObjects[selectedRole.id]) { 
      setCurrentEditedObjects(allEditedObjects[selectedRole.id]); 
      setHasChanges(true); 
      setSavedChanges(true); 
    } else if (selectedRole) { 
      setCurrentEditedObjects(selectedRole.objects); 
      setHasChanges(false); 
      setSavedChanges(false); 
    } 
  }, [selectedRole, allEditedObjects]); 

  // ✅ Fetch roles (no client parameter)
  const fetchRoles = async () => {
    if (!selectedSystem.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a system.",
        variant: "destructive",
        duration: 900,
      });
      return;
    }

    setIsLoadingRoles(true);
    setError(null);
    setRoles([]);
    setSelectedRole(null); 
    setCurrentEditedObjects([]); 
    setAllEditedObjects({}); 
    localStorage.removeItem(getAllRolesLocalStorageKey(selectedSystem)); 

    try { 
      // ✅ API only needs system name now
      const roleData = await getRoleDetailsforSim("", selectedSystem.trim()); 

      const transformedRoles: Role[] = roleData.map(role => ({ 
        id: role.id, 
        description: role.description, 
        classification: role.classification, 
        gb: role.gb, 
        gc: role.gc, 
        gd: role.gd, 
        assignedUsers: role.assignedUsers, 
        objects: [] 
      })); 

      setRoles(transformedRoles); 
      setDataLoaded(true); 

      toast({ 
        title: "Success", 
        description: `Loaded ${transformedRoles.length} roles successfully.`, 
        duration: 900,
      }); 
    } catch (err) { 
      setError(err instanceof Error ? err.message : 'Failed to fetch roles'); 
      toast({ 
        title: "Error", 
        description: "Failed to fetch roles. Please check your system name.", 
        variant: "destructive", 
        duration: 900,
      }); 
    } finally { 
      setIsLoadingRoles(false); 
    } 
  }; 

  const reloadAllData = () => { 
    fetchRoles(); 
  }; 

  const wildcardToRegExp = (pattern: string): RegExp => {
    let regexPattern;
    const hasExplicitWildcard = pattern.includes('*') || pattern.includes('%');

    if (hasExplicitWildcard) {
      let escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      regexPattern = escaped.replace(/[*%]/g, '.*');
      regexPattern = `^${regexPattern}$`;
    } else {
      let escaped = pattern.replace(/[+?^${}()|[\]\\]/g, '\\$&');
      regexPattern = `^${escaped}.*`; 
    }
    
    return new RegExp(regexPattern, 'i'); 
  };

  // const filteredRoles = roles.filter((role) => {
  //   const matchesSearch = !searchTerm.trim()
  //     ? true
  //     : wildcardToRegExp(searchTerm.trim()).test(role.id) ||
  //       wildcardToRegExp(searchTerm.trim()).test(role.description || "");

  //   const matchesLicense =
  //     licenseFilter === "all" ||
  //     role.classification.toLowerCase().includes(licenseFilter.toLowerCase());

  //   return matchesSearch && matchesLicense;
  // });
   const filteredRoles = roles.filter((role) => {
    // If roles are selected via dropdown, only show those roles
    const matchesSelection = selectedRoleIds.length === 0 || selectedRoleIds.includes(role.id);

    const matchesLicense =
      licenseFilter === "all" ||
      role.classification.toLowerCase().includes(licenseFilter.toLowerCase());

    return matchesSelection && matchesLicense;
  });

  const roleOptions: RoleOption[] = roles.map((role) => ({
    value: role.id,
    label: role.id,
    description: role.description || "",
    classification: role.classification,
  }));
 

  // ✅ Handle role select (no client parameter)
  const handleRoleSelect = async (role: Role) => { 
    if (!selectedSystem.trim()) { 
      toast({ 
        title: "Missing Information", 
        description: "Please select a system.", 
        variant: "destructive", 
        duration: 900,
      }); 
      return; 
    } 

    setLoading(true); 
    try { 
      const roleDetails = await getSpecificRoleDetailsforSim(role.id, "", selectedSystem.trim()); 

      const transformedObjects: ObjectDetail[] = roleDetails.objectDetails.map((obj, index) => ({ 
        id: index + 1, 
        object: obj.object, 
        classification: obj.classification, 
        fieldName: obj.fieldName, 
        valueLow: obj.valueLow, 
        valueHigh: obj.valueHigh, 
        ttext: obj.ttext, 
        action: null, 
        newValue: "", 
        isNew: false, 
        dynamicLicenseOptions: undefined 
      })); 

      const updatedRole = { 
        ...role, 
        objects: transformedObjects 
      }; 

      setSelectedRole(updatedRole); 

      let objectsToDisplay = transformedObjects; 
      if (allEditedObjects[role.id]) { 
        const savedForThisRole = allEditedObjects[role.id]; 
        const mergedObjects = transformedObjects.map(originalObj => { 
          const savedObj = savedForThisRole.find(p => p.id === originalObj.id); 
          return savedObj ? { ...originalObj, ...savedObj } : originalObj; 
        }); 
        const newObjectsFromSaved = savedForThisRole.filter(p => p.isNew && !transformedObjects.some(o => o.id === p.id)); 
        objectsToDisplay = [...mergedObjects, ...newObjectsFromSaved]; 

        setHasChanges(true); 
        setSavedChanges(true); 
        toast({ 
          title: "Unsaved Changes Loaded", 
          description: "Previous unsaved changes for this role have been loaded.", 
          duration: 900,
        }); 
      } else { 
        setHasChanges(false); 
        setSavedChanges(false); 
      } 

      setCurrentEditedObjects(objectsToDisplay); 
      setIsEditing(false); 
    } catch (err) { 
      setError(err instanceof Error ? err.message : 'Failed to fetch role details'); 
      toast({ 
        title: "Error", 
        description: "Failed to fetch role details. Please try again.", 
        variant: "destructive", 
        duration: 900,
      }); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  const handleEditClick = () => { 
    setIsEditing(true); 
  }; 

  // ✅ Fetch add suggestions (no client parameter)
  const fetchAddSuggestions = async (objId: number, authorizationObject: string, fieldName: string) => { 
    if (!selectedSystem.trim()) { 
      toast({ 
        title: "Missing Data", 
        description: "Cannot fetch suggestions: System Name is missing.", 
        variant: "destructive", 
        duration: 900,
      }); 
      return; 
    } 

    setLoadingDynamicOptions(prev => ({ ...prev, [objId]: true })); 
    try { 
      const suggestions = await getAddSuggestions(authorizationObject, fieldName, "", selectedSystem); 

      setCurrentEditedObjects(prev => { 
        const updated = prev.map(obj => 
          obj.id === objId ? {  
            ...obj,  
            addSuggestions: suggestions, 
            ...(suggestions.length > 0 && !obj.valueLow ? { 
              valueLow: suggestions[0].value, 
              selectedLicense: suggestions[0].license, 
              newValue: suggestions[0].ui_text 
            } : {}) 
          } : obj 
        ); 
        if (selectedRole) { 
          setAllEditedObjects(prevAll => { 
            const newAll = { ...prevAll, [selectedRole.id]: updated }; 
            localStorage.setItem(getAllRolesLocalStorageKey(selectedSystem.trim()), JSON.stringify(newAll)); 
            return newAll; 
          }); 
        } 
        return updated; 
      }); 
    } catch (err) { 
      toast({ 
        title: "Error", 
        description: `Failed to fetch suggestions for ${authorizationObject}/${fieldName}.`, 
        variant: "destructive", 
        duration: 900,
      }); 
      console.error(`Error fetching add suggestions for ${authorizationObject}/${fieldName}:`, err); 
    } finally { 
      setLoadingDynamicOptions(prev => ({ ...prev, [objId]: false })); 
    } 
  }; 

  // ✅ Fetch dynamic license options (no client parameter)
  const fetchDynamicLicenseOptions = async (objId: number, authorizationObject: string, fieldName: string) => { 
    if (!selectedSystem.trim()) { 
      toast({ 
        title: "Missing Data", 
        description: "Cannot fetch new values: System Name is missing.", 
        variant: "destructive", 
        duration: 900,
      }); 
      return; 
    } 

    setLoadingDynamicOptions(prev => ({ ...prev, [objId]: true })); 
    try { 
      const data = await getAuthObjFieldLicData(authorizationObject, fieldName, "", selectedSystem); 
      const options = data 
        .filter(item => item.UI_TEXT != null && item.UI_TEXT.trim() !== '') 
        .map(item => ({ value: item.UI_TEXT, label: item.UI_TEXT })); 

      setCurrentEditedObjects(prev => { 
        const updated = prev.map(obj => 
          obj.id === objId ? { ...obj, dynamicLicenseOptions: options } : obj 
        ); 
        if (selectedRole) { 
          setAllEditedObjects(prevAll => { 
            const newAll = { ...prevAll, [selectedRole.id]: updated }; 
            localStorage.setItem(getAllRolesLocalStorageKey(selectedSystem.trim()), JSON.stringify(newAll)); 
            return newAll; 
          }); 
        } 
        return updated; 
      }); 
    } catch (err) { 
      toast({ 
        title: "Error", 
        description: `Failed to fetch new values for ${authorizationObject}/${fieldName}.`, 
        variant: "destructive",
        duration: 900, 
      }); 
      console.error(`Error fetching dynamic options for ${authorizationObject}/${fieldName}:`, err); 
    } finally { 
      setLoadingDynamicOptions(prev => ({ ...prev, [objId]: false })); 
    } 
  }; 

  const updateObjectAction = (objectId: number, action: string) => { 
    setCurrentEditedObjects(prev => { 
      const updated = prev.map(obj => { 
        if (obj.id === objectId) { 
          if (action === "Change" && !obj.isNew) { 
            if (obj.object && obj.fieldName) { 
              fetchDynamicLicenseOptions(obj.id, obj.object, obj.fieldName); 
            } else { 
              toast({ 
                title: "Missing Object Data", 
                description: "Cannot fetch new values: Authorization Object or Field Name is missing for this row.", 
                variant: "destructive", 
                duration: 900,
              }); 
            } 
          } else if (action === "Add" && obj.isNew) { 
            if (obj.object && obj.fieldName) { 
              fetchAddSuggestions(obj.id, obj.object, obj.fieldName); 
            } 
          } 
          return {  
            ...obj,  
            action,  
            newValue: action === "Remove" ? "" : obj.newValue, 
            ...(action !== "Add" ? { addSuggestions: undefined, selectedLicense: undefined } : {}), 
            ...(action !== "Change" ? { dynamicLicenseOptions: undefined } : {}) 
          }; 
        } 
        return obj; 
      }); 

      if (selectedRole) { 
        setAllEditedObjects(prevAll => { 
          const newAll = { ...prevAll, [selectedRole.id]: updated }; 
          localStorage.setItem(getAllRolesLocalStorageKey(selectedSystem.trim()), JSON.stringify(newAll)); 
          return newAll; 
        }); 
      } 
      setHasChanges(true); 
      setSavedChanges(false); 
      return updated; 
    }); 
  }; 

  const handleAddSuggestionSelect = (objectId: number, suggestion: AddSuggestion) => { 
    setCurrentEditedObjects(prev => { 
      const updated = prev.map(obj => 
        obj.id === objectId ? {  
          ...obj,  
          valueLow: suggestion.value, 
          selectedLicense: suggestion.license, 
          newValue: suggestion.ui_text 
        } : obj 
      ); 

      if (selectedRole) { 
        setAllEditedObjects(prevAll => { 
          const newAll = { ...prevAll, [selectedRole.id]: updated }; 
          localStorage.setItem(getAllRolesLocalStorageKey(selectedSystem.trim()), JSON.stringify(newAll)); 
          return newAll; 
        }); 
      } 
      setHasChanges(true); 
      setSavedChanges(false); 
      return updated; 
    }); 
  }; 

  const updateObjectNewValue = (objectId: number, newValue: string) => { 
    setCurrentEditedObjects(prev => { 
      const updated = prev.map(obj => 
        obj.id === objectId ? { ...obj, newValue } : obj 
      ); 
      if (selectedRole) { 
        setAllEditedObjects(prevAll => { 
          const newAll = { ...prevAll, [selectedRole.id]: updated }; 
          localStorage.setItem(getAllRolesLocalStorageKey(selectedSystem.trim()), JSON.stringify(newAll)); 
          return newAll; 
        }); 
      } 
      setHasChanges(true); 
      setSavedChanges(false); 
      return updated; 
    }); 
  }; 

  const updateObjectField = (objectId: number, field: string, value: string) => { 
    setCurrentEditedObjects(prev => { 
      const updated = prev.map(obj => 
        obj.id === objectId ? { ...obj, [field]: value } : obj 
      ); 
      if (selectedRole) { 
        setAllEditedObjects(prevAll => { 
          const newAll = { ...prevAll, [selectedRole.id]: updated }; 
          localStorage.setItem(getAllRolesLocalStorageKey(selectedSystem.trim()), JSON.stringify(newAll)); 
          return newAll; 
        }); 
      } 
      setHasChanges(true); 
      setSavedChanges(false); 
      return updated; 
    }); 
  }; 

  const handleAddObject = () => { 
    const newObject: ObjectDetail = { 
      id: Date.now(), 
      object: "", 
      classification: "", 
      fieldName: "", 
      valueLow: "", 
      valueHigh: "", 
      ttext: "", 
      action: "Add", 
      newValue: "", 
      isNew: true, 
      dynamicLicenseOptions: undefined, 
      addSuggestions: undefined, 
      selectedLicense: undefined 
    }; 
    setCurrentEditedObjects(prev => { 
      const updated = [...prev, newObject]; 
      if (selectedRole) { 
        setAllEditedObjects(prevAll => { 
          const newAll = { ...prevAll, [selectedRole.id]: updated }; 
          localStorage.setItem(getAllRolesLocalStorageKey(selectedSystem.trim()), JSON.stringify(newAll)); 
          return newAll; 
        }); 
      } 
      setHasChanges(true); 
      setSavedChanges(false); 
      return updated; 
    }); 
  }; 

  const handleSave = () => { 
    if (selectedRole) { 
      setSavedChanges(true); 
      toast({ 
        title: "Changes Saved Locally", 
        description: `Changes for role '${selectedRole.id}' have been saved to your browser. Click "Run Simulation" to apply to database.`, 
        variant: "default",
        duration: 1000, 
      }); 
    } 
    setIsEditing(false); 
  }; 

  const handleReset = () => { 
    if (selectedRole) { 
      setCurrentEditedObjects([...selectedRole.objects]); 
      setHasChanges(false); 
      setIsEditing(false); 
      setSavedChanges(false); 
      setAllEditedObjects(prevAll => { 
        const newAll = { ...prevAll }; 
        delete newAll[selectedRole.id]; 
        localStorage.setItem(getAllRolesLocalStorageKey(selectedSystem.trim()), JSON.stringify(newAll)); 
        return newAll; 
      }); 
      toast({ 
        title: "Changes Reset", 
        description: "All unsaved changes for this role have been discarded.", 
        variant: "default",
        duration: 900, 
      }); 
    } 
  }; 
const handleRunSimulation = async () => {
  if (!selectedSystem.trim()) {
    toast({
      title: "Missing Information",
      description: "Please select a system.",
      variant: "destructive",
      duration: 900,
    });
    return;
  }

  setSimulationRunning(true);
  setError(null);

  try {
    const allChangesToSend: SimulationChangePayload[] = [];
    const rolesWithChanges = Object.keys(allEditedObjects);

    if (rolesWithChanges.length === 0) {
      toast({
        title: "No Changes to Simulate",
        description: "No pending changes found to apply to the database.",
        variant: "default",
        duration: 900,
      });
      setSimulationRunning(false);
      return;
    }

    // ✅ Prepare changes payload matching backend schema
    for (const roleId of rolesWithChanges) {
      const roleChanges = allEditedObjects[roleId];
      const roleInfo = roles.find(r => r.id === roleId);

      const changesForThisRole = roleChanges
        .filter(obj => obj.action !== null && obj.action !== "")
        .map(obj => {
          // ✅ Parse newValue correctly based on action type
          let new_value_low = null;
          let new_value_high = null;

          if (obj.action === "Change" && obj.newValue) {
            // newValue format from UI_TEXT: "value;field;license"
            const parts = obj.newValue.split(';');
            new_value_low = parts[0] || obj.valueLow;
            // For Change operations, new_value_high usually stays the same
            new_value_high = obj.valueHigh;
          } else if (obj.action === "Add" && obj.valueLow) {
            // For Add operations, use valueLow/valueHigh as the new values
            new_value_low = obj.valueLow;
            new_value_high = obj.valueHigh;
          }

          return {
            role_name: roleId,
            role_description: roleInfo?.description || "",
            object: obj.object,
            field: obj.fieldName,
            value_low: obj.valueLow,
            value_high: obj.valueHigh || "",  // ✅ Ensure it's never null
            action: obj.action as "Add" | "Change" | "Remove",
            original_license: obj.classification,
            new_value_low: new_value_low,
            new_value_high: new_value_high,
          };
        });

      allChangesToSend.push(...changesForThisRole);
    }

    if (allChangesToSend.length === 0) {
      toast({
        title: "No Valid Changes",
        description: "No valid changes found to apply to the database.",
        variant: "default",
        duration: 1000,
      });
      setSimulationRunning(false);
      return;
    }

    console.log("Sending changes to backend:", JSON.stringify(allChangesToSend, null, 2));

    // ✅ Call the API (no client parameter)
    const response = await applySimulationChangesToDb(
      "",  // No client
      selectedSystem.trim(),
      allChangesToSend
    );

    const requestNumber = response.simulation_run_id;

    toast({
      title: "Simulation Started Successfully",
      description: `Simulation ${requestNumber} has been queued for processing.`,
      variant: "default",
      duration: 1500,
    });

    // Clear localStorage
    localStorage.removeItem(getAllRolesLocalStorageKey(selectedSystem.trim()));
    setAllEditedObjects({});

    // Clear current view
    if (selectedRole) {
      setCurrentEditedObjects([...selectedRole.objects]);
      setHasChanges(false);
      setSavedChanges(false);
    }

    // Navigate to simulation run page
    setTimeout(() => {
      navigate({
        to: "/simulation-run",
        search: {
          system: selectedSystem.trim(),
          highlight: requestNumber,
        },
      });
    }, 100);

  } catch (err) {
    console.error("Error running simulation:", err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to run simulation';
    setError(errorMessage);

    toast({
      title: "Error Starting Simulation",
      description: `Failed to start simulation: ${errorMessage}`,
      variant: "destructive",
      duration: 1800,
    });
  } finally {
    setSimulationRunning(false);
  }
};

  const handleKeyPress = (e: React.KeyboardEvent) => { 
    if (e.key === 'Enter') { 
      reloadAllData(); 
    } 
  }; 

  const getPendingChangesSummary = (): PendingChangesSummary | null => { 
    const totalChanges = Object.values(allEditedObjects).reduce((total, roleChanges) => { 
      return total + roleChanges.filter(obj => obj.action !== null && obj.action !== "").length; 
    }, 0); 

    if (totalChanges === 0) return null; 

    const changesByAction: Record<string, number> = {}; 
    Object.values(allEditedObjects).forEach(roleChanges => { 
      roleChanges.filter(obj => obj.action !== null && obj.action !== "").forEach(obj => { 
        changesByAction[obj.action!] = (changesByAction[obj.action!] || 0) + 1; 
      }); 
    }); 

    return { totalChanges, changesByAction }; 
  }; 

  const getRoleChangesSummary = (roleId: string): { changesCount: number; hasChanges: boolean } => { 
    const roleChanges = allEditedObjects[roleId]; 
    if (!roleChanges) return { changesCount: 0, hasChanges: false }; 

    const changesCount = roleChanges.filter(obj => obj.action !== null && obj.action !== "").length; 
    return { changesCount, hasChanges: changesCount > 0 }; 
  }; 

  const pendingChangesSummary = getPendingChangesSummary(); 

  return ( 
    <Layout title="Create New Simulation"> 
      <div className="space-y-6"> 
        <div className="flex items-center justify-between"> 
          <Link to="/simulation-run" className="flex items-center text-blue-600 hover:text-blue-800"> 
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Simulation Run 
          </Link> 
        </div> 

        {error && ( 
          <Alert variant="destructive"> 
            <AlertCircle className="h-4 w-4" /> 
            <AlertDescription>{error}</AlertDescription> 
          </Alert> 
        )} 

        <Card> 
          <CardHeader> 
            <CardTitle>System Selection</CardTitle> 
          </CardHeader> 
          <CardContent> 
            <div className="grid gap-4 md:grid-cols-2">
              {/* System Select */}
              <div className="space-y-2">
                <label htmlFor="systemSelect" className="text-sm font-medium">
                  Select System *
                </label>
                <Select
                  value={selectedSystem}
                  onValueChange={setSelectedSystem}
                  disabled={systemsList.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select System" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemsList.map((system) => (
                      <SelectItem key={system.id} value={system.SYSTEM_NAME}>
                        {system.SYSTEM_NAME}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end"> 
                <Button 
                  onClick={reloadAllData} 
                  disabled={loading || isLoadingRoles || simulationRunning || !selectedSystem} 
                  className="flex items-center gap-2 ml-auto" 
                > 
                  {(loading || isLoadingRoles) ? ( 
                    <Loader2 className="h-4 w-4 animate-spin" /> 
                  ) : ( 
                    <RefreshCw className="h-4 w-4" /> 
                  )} 
                  {(loading || isLoadingRoles) ? "Loading..." : "Load Data"} 
                </Button> 
              </div> 
            </div> 
          </CardContent> 
        </Card> 

        {!dataLoaded && !isLoadingRoles && ( 
          <Card> 
            <CardContent className="text-center py-8"> 
              <p className="text-gray-600">Please select a system and click "Load Data" to fetch roles.</p> 
            </CardContent> 
          </Card> 
        )} 

        {dataLoaded && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Filter Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <RoleSearchDropdown
                    label="Search by Role ID or Description"
                    options={roleOptions}
                    value={searchTerm}
                    onChange={(val) => setSearchTerm(val as string)}
                    placeholder={
                      isLoadingRoles
                        ? "Loading roles..."
                        : `Search ${roleOptions.length} roles... (e.g. z*fi*, Z%DISPLAY)`
                    }
                    disabled={isLoadingRoles}
                  /> */}
                   <RoleSearchDropdown
                    label="Search by Role ID or Description"
                    options={roleOptions}
                    value={selectedRoleIds}  // ✅ Now array
                    onChange={(val) => setSelectedRoleIds(val as string[])}  // ✅ Update array
                    placeholder={
                      isLoadingRoles
                        ? "Loading roles..."
                        : `Search ${roleOptions.length} roles... (e.g. z*fi*, Z%DISPLAY)`
                    }
                    disabled={isLoadingRoles}
                    multiSelect={true}  // ✅ Enable multi-select
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2">License Type</label>
                    <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All License Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All License Types</SelectItem>
                        <SelectItem value="GB Advanced Use">GB Advanced Use</SelectItem>
                        <SelectItem value="GC Core Use">GC Core Use</SelectItem>
                        <SelectItem value="GD Self-Service Use">GD Self-Service Use</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selectedRoleIds.length > 0 && (
                  <div className="mt-4 text-sm text-gray-600">
                    Showing {selectedRoleIds.length} selected role{selectedRoleIds.length > 1 ? 's' : ''} 
                    {licenseFilter !== "all" && ` (filtered by ${licenseFilter})`}
                  </div>
                )}
              </CardContent>
            </Card>

            <RoleProfileSummary
              simulationRunning={simulationRunning}
              filteredRoles={filteredRoles}
              selectedRole={selectedRole}
              onRoleSelect={handleRoleSelect}
              onRunSimulation={handleRunSimulation}
              savedChanges={savedChanges}
              pendingChangesSummary={pendingChangesSummary}
              getRoleChangesSummary={getRoleChangesSummary}
            />
          </>
        )}

        {selectedRole && (
          <>
            <AuthorizationObjects
              selectedRole={selectedRole}
              editedObjects={currentEditedObjects}
              isEditing={isEditing}
              onEditClick={handleEditClick}
              onSave={handleSave}
              onReset={handleReset}
              onAddObject={handleAddObject}
              updateObjectAction={updateObjectAction}
              updateObjectNewValue={updateObjectNewValue}
              updateObjectField={updateObjectField}
              isLoadingDynamicOptions={loadingDynamicOptions}
              fetchDynamicLicenseOptions={fetchDynamicLicenseOptions}
            />
          </>
        )}
      </div> 
    </Layout> 
  ); 
}; 

export default CreateSimulation;