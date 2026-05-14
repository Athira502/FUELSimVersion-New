
// Mock simulation service - in a real app this would connect to your backend
export interface SimulationData {
  affectedUsers: number;
  reducibleRoles: number;
  fueLicenseReduction: number;
  costSavings: number;
  roleBreakdown: {
    roleId: string;
    usersAffected: number;
    currentLicense: string;
    recommendedLicense: string;
    canReduce: boolean;
    savings: number;
  }[];
}

export const getSimulationResults = async (requestId: string): Promise<SimulationData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data - in a real app this would come from your backend
  return {
    affectedUsers: Math.floor(Math.random() * 500) + 100,
    reducibleRoles: Math.floor(Math.random() * 50) + 10,
    fueLicenseReduction: Math.floor(Math.random() * 200) + 50,
    costSavings: Math.floor(Math.random() * 50000) + 10000,
    roleBreakdown: [
      {
        roleId: "SAP_BC_DWB_MONITOR",
        usersAffected: 45,
        currentLicense: "Professional User",
        recommendedLicense: "Limited Professional User",
        canReduce: true,
        savings: 2250
      },
      {
        roleId: "SAP_BC_DWB_DEVELOPER",
        usersAffected: 23,
        currentLicense: "Professional User",
        recommendedLicense: "Professional User",
        canReduce: false,
        savings: 0
      },
      {
        roleId: "SAP_BC_BASIS_ADMIN",
        usersAffected: 12,
        currentLicense: "Professional User",
        recommendedLicense: "Limited Professional User",
        canReduce: true,
        savings: 600
      }
    ]
  };
};

export const generateSimulation = async (requestId: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return the same request ID for simplicity
  return requestId;
};
