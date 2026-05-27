// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, TrendingUp, TrendingDown, Search, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate, useSearch, Link } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

// Import from simulation API
import {
  getSimulationResults,

} from "@/api/simulation_api";
import {
  SystemResponse,
  fetchAllSystems,
  fetchDashboard
} from "@/api/overview";


const SimulationRun = () => {
  const navigate = useNavigate({ from: '/simulation-run' });
  const searchParams = useSearch({ from: '/simulation-run' });

  const [systemsList, setSystemsList] = useState<SystemResponse[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [simulations, setSimulations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [actualFue, setActualFue] = useState<number | null>(null);
  const [actualFueLoading, setActualFueLoading] = useState(false);
  
  const [highlightedSimulation, setHighlightedSimulation] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    if (autoRefresh && selectedSystem) {
      const refreshWithRetry = async () => {
        try {
          await fetchSimulationResults(false); 
          retryCount = 0;
        } catch (error) {
          console.error("Auto-refresh failed:", error);
          retryCount++;
          
          if (retryCount >= maxRetries) {
            console.warn("Auto-refresh disabled after multiple failures");
            setAutoRefresh(false);
            toast({
              title: "Auto-refresh Disabled",
              description: "Multiple refresh attempts failed. Please manually refresh to check simulation status.",
              variant: "destructive",
              duration: 2000,
            });
          }
        }
      };

      const initialTimeout = setTimeout(refreshWithRetry, 1000);
      refreshIntervalRef.current = setInterval(refreshWithRetry, 5000);

      return () => {
        clearTimeout(initialTimeout);
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      };
    }
  }, [autoRefresh, selectedSystem]);


  useEffect(() => {
    const hasInProgressSimulations = simulations.some(sim => 
      sim.status === "In Progress" || 
      sim.status === "Processing Changes"
    );
    
    if (hasInProgressSimulations !== autoRefresh) {
      setAutoRefresh(hasInProgressSimulations);
      
      if (hasInProgressSimulations) {
        console.log("Auto-refresh enabled - simulations in progress detected");
      } else {
        console.log("Auto-refresh disabled - all simulations completed");
      }
    }
  }, [simulations, autoRefresh]);


  useEffect(() => {
    const loadSystems = async () => {
      try {
        const systems = await fetchAllSystems();
        console.log("Fetched systems:", systems);
        
        if (Array.isArray(systems)) {
          setSystemsList(systems);
          
          if (systems.length > 0) {
            const systemFromUrl = searchParams?.system;
            if (systemFromUrl && systems.some(s => s.SYSTEM_NAME === systemFromUrl)) {
              setSelectedSystem(systemFromUrl);
            } else {
              setSelectedSystem(systems[0].SYSTEM_NAME);
            }
          }
        } else {
          console.error("Systems is not an array:", systems);
          setError("Invalid systems data received");
        }
      } catch (error: any) {
        console.error("Error fetching systems:", error);
        setError(`Failed to load systems: ${error.message}`);
      }
    };

    loadSystems();
  }, []);

  useEffect(() => {
    const highlight = searchParams?.highlight as string | undefined;
    if (highlight) {
      setHighlightedSimulation(highlight);
      setTimeout(() => setHighlightedSimulation(null), 5000);
    }
  }, [searchParams]);

  const handleSystemChange = (system: string) => {
    setSelectedSystem(system);
    navigate({ 
      to: '/simulation-run', 
      search: { system }, 
      replace: true 
    });
    setSimulations([]);
    setActualFue(null);
  };

  
const fetchActualFue = async () => {
  if (!selectedSystem) return null;

  setActualFueLoading(true);

  try {
    console.log("📊 Fetching ACTUAL FUE from /data/fue/dashboard for system:", selectedSystem);
    
    const data = await fetchDashboard(selectedSystem);
    
    const totalFue = data.user_license_distribution.total_fue|| 0;
    
    console.log("📦 Dashboard response:", data);
    console.log("✅ ACTUAL FUE (baseline):", totalFue);
    
    setActualFue(totalFue);
    return totalFue;
  } catch (err) {
    console.error("❌ Error fetching actual FUE:", err);
    toast({
      title: "Error",
      description: "Failed to fetch baseline FUE. Using 0 as fallback.",
      variant: "destructive",
      duration: 1500,
    });
    return null;
  } finally {
    setActualFueLoading(false);
  }
};

const fetchSimulationResults = async (actualFueValue: number | null = null, showLoading = true) => {
  if (!selectedSystem) {
    setError("Please select a system");
    return;
  }

  if (showLoading) setLoading(true);
  setError("");

  try {
    const apiResponse = await getSimulationResults(selectedSystem);
    const resultsData = apiResponse.results;
    const resultsArray = Array.isArray(resultsData) ? resultsData : (resultsData ? [resultsData] : []);

    const currentActualFue = actualFueValue !== null ? actualFueValue : (actualFue !== null ? actualFue : 0);

    console.log("💡 Using Actual FUE:", currentActualFue);

    const transformedSimulations = resultsArray.map((result: any) => {
      let date;
      if (result.timestamp && typeof result.timestamp === 'string') {
        try {
          date = new Date(result.timestamp.replace(' ', 'T'));
        } catch (error) {
          console.warn(`Invalid timestamp for ${result.simulation_run_id}:`, error);
          date = new Date();
        }
      } else {
        date = new Date();
      }

      const simulationFue = typeof result.total_fue === 'string' 
        ? parseFloat(result.total_fue) 
        : result.total_fue || 0;

      let status = result.status || "Completed";
      let roleDescription = "";
      
      if (status === "In Progress" || status === "Processing Changes") {
        roleDescription = "Processing simulation changes...";
      } else if (status === "Failed") {
        roleDescription = "Simulation failed - please try again";
      }

      const savings = currentActualFue - simulationFue;

      console.log(`Simulation ${result.simulation_run_id}:`, {
        actualFue: currentActualFue,
        simulationFue: simulationFue,
        savings: savings,
        status: status  // ✅ Now defined
      });

      return {
        id: `${selectedSystem}-${result.simulation_run_id}`,
        name: result.simulation_run_id,
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().split(' ')[0].substring(0, 5),
        simulationFue: simulationFue,
        actualFue: currentActualFue,
        savings: savings,
        status: status,  // ✅ Now defined
        timestamp: result.timestamp,
        changes: result.changes,
        simulation_run_id: result.simulation_run_id,
        roleDescription: roleDescription  // ✅ Now defined
      };
    });

    transformedSimulations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setSimulations(transformedSimulations);

    if (!showLoading && highlightedSimulation) {
      const highlightedSim = transformedSimulations.find(sim => 
        sim.simulation_run_id === highlightedSimulation
      );
      
      if (highlightedSim && highlightedSim.status === "Completed") {
        toast({
          title: "Simulation Completed",
          description: `Simulation ${highlightedSimulation} has finished processing successfully.`,
          variant: "default",
          duration: 1500,
        });
      } else if (highlightedSim && highlightedSim.status === "Failed") {
        toast({
          title: "Simulation Failed",
          description: `Simulation ${highlightedSimulation} encountered an error during processing.`,
          variant: "destructive",
          duration: 2000,
        });
      }
    }

  } catch (err: any) {
    console.error("Error fetching simulation results:", err);
    if (showLoading) {
      setError(`Error fetching simulation results: ${err.message}`);
    }
  } finally {
    if (showLoading) setLoading(false);
  }
};

useEffect(() => {
  const loadData = async () => {
    if (selectedSystem) {
      // ✅ Get the actual FUE value
      const fetchedActualFue = await fetchActualFue();
      // ✅ Pass it directly to fetchSimulationResults
      await fetchSimulationResults(fetchedActualFue, true);
    } else {
      setSimulations([]);
      setActualFue(null);
      setError("");
    }
  };

  loadData();
}, [selectedSystem]);

  const handleSearch = async () => {
  const fetchedActualFue = await fetchActualFue();
  await fetchSimulationResults(fetchedActualFue, true);
};

useEffect(() => {
  let retryCount = 0;
  const maxRetries = 3;
  
  if (autoRefresh && selectedSystem) {
    const refreshWithRetry = async () => {
      try {
        // ✅ Just pass the current state value on auto-refresh
        await fetchSimulationResults(actualFue, false);
        retryCount = 0;
      } catch (error) {
        console.error("Auto-refresh failed:", error);
        retryCount++;
        
        if (retryCount >= maxRetries) {
          console.warn("Auto-refresh disabled after multiple failures");
          setAutoRefresh(false);
          toast({
            title: "Auto-refresh Disabled",
            description: "Multiple refresh attempts failed.",
            variant: "destructive",
            duration: 2000,
          });
        }
      }
    };

    const initialTimeout = setTimeout(refreshWithRetry, 1000);
    refreshIntervalRef.current = setInterval(refreshWithRetry, 5000);

    return () => {
      clearTimeout(initialTimeout);
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }
}, [autoRefresh, selectedSystem, actualFue]);


  const handleViewDetails = (simulation: any) => {
    if (simulation.status === "In Progress" || simulation.status === "Processing Changes") {
      toast({
        title: "Simulation In Progress",
        description: `Simulation ${simulation.simulation_run_id} is still being processed.`,
        variant: "default",
        duration: 1200,
      });
      return;
    }
    
    if (simulation.status === "Failed") {
      toast({
        title: "Simulation Failed",
        description: "This simulation encountered an error.",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    navigate({
      to: '/simulation-details/$systemName/$simulationRunId',
      params: {
        systemName: encodeURIComponent(selectedSystem),
        simulationRunId: encodeURIComponent(simulation.simulation_run_id),
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
      case "Processing Changes":
        return "bg-blue-100 text-blue-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress":
      case "Processing Changes":
        return <Loader2 className="h-3 w-3 animate-spin mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Layout title="Simulation Run">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-4">
                <CardTitle>System Configuration</CardTitle>
                {autoRefresh && (
                  <div className="flex items-center text-sm text-blue-600">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Auto-refreshing...
                  </div>
                )}
              </div>
              <Link to="/create-simulation" className="flex items-center text-blue-600 hover:text-blue-800">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Simulation
                </Button>
              </Link>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="system-select">System Name</Label>
                <Select
                  value={selectedSystem}
                  onValueChange={handleSystemChange}
                  disabled={systemsList.length === 0}
                >
                  <SelectTrigger id="system-select">
                    <SelectValue placeholder="Select a System" />
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
            </div>
            <div className="mt-4 flex gap-2 items-center">
              <Button onClick={handleSearch} disabled={loading || !selectedSystem}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Load Simulation Results
              </Button>
              {actualFueLoading && (
                <div className="flex items-center text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading baseline FUE...
                </div>
              )}
            </div>
            {error && (
              <div className="mt-2 flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ FUE Summary Card */}
        {actualFue !== null && simulations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Current System FUE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Actual FUE (Baseline)</div>
                  <div className="text-3xl font-bold text-blue-600">{actualFue}</div>
                  <div className="text-xs text-gray-500 mt-1">Current production state</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Simulations Run</div>
                  <div className="text-3xl font-bold text-gray-700">{simulations.length}</div>
                  <div className="text-xs text-gray-500 mt-1">Total scenarios analyzed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(simulations) && simulations.map((simulation) => (
            <Card 
              key={simulation.id}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                highlightedSimulation === simulation.simulation_run_id ? 'ring-2 ring-blue-500 shadow-lg' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{simulation.name}</CardTitle>
                  <span className={`px-2 py-1 rounded-full text-xs flex items-center ${getStatusColor(simulation.status)}`}>
                    {getStatusIcon(simulation.status)}
                    {simulation.status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  {simulation.date} at {simulation.time}
                </div>
                {(simulation.status === "In Progress" || simulation.status === "Processing Changes") && (
                  <div className="text-xs text-blue-600 mt-1">
                    {simulation.roleDescription}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Simulated FUE:</span>
                    <span className="font-medium">
                      {simulation.status === "In Progress" || simulation.status === "Processing Changes" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        simulation.simulationFue
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Actual FUE:</span>
                    <span className="font-medium">
                      {actualFueLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        simulation.actualFue
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Potential Savings:</span>
                    <div className="flex items-center gap-1">
                      {simulation.status === "In Progress" || simulation.status === "Processing Changes" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : simulation.savings > 0 ? (
                        <>
                          <TrendingDown className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            {simulation.savings.toFixed(1)} FUE
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-red-600">
                            +{Math.abs(simulation.savings).toFixed(1)} FUE
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleViewDetails(simulation)}
                    disabled={simulation.status === "In Progress" || simulation.status === "Processing Changes"}
                  >
                    {simulation.status === "In Progress" || simulation.status === "Processing Changes" ? 
                      "Processing..." : "View Details"
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default SimulationRun;