// src/pages/RoleDetails.tsx
// @ts-nocheck

import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate, useSearch } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import from the NEW FUE calculation API (not fue_count_api)
import { 
  fetchSpecificRoleDetails, 
  SpecificRoleDetailsResponse 
} from "@/api/fue_count_api";

const RoleDetails = () => {
  // Get params and hooks FIRST, before using them
  const { roleId } = useParams({ from: '/role-details/$roleId' });
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useSearch({ from: '/role-details/$roleId' });
  const { toast } = useToast();

  // NOW use them to get systemName
  const systemName = location.state?.systemName || searchParams?.systemName;

  const [roleDetails, setRoleDetails] = useState<SpecificRoleDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoleData = async () => {
      // Use systemName from location.state, or provide a default
      const currentSystem = systemName || "SYS_2"; // Adjust default as needed

      if (!roleId) {
        setError("Role ID not provided. Please go back to the FUE Calculation page.");
        setIsLoading(false);
        return;
      }

      if (!currentSystem) {
        setError("System name not provided. Please go back to the FUE Calculation page.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setRoleDetails(null);

      try {
        console.log(`🚀 Fetching details for role: ${decodeURIComponent(roleId)} in system: ${currentSystem}`);
        
        const data = await fetchSpecificRoleDetails(
          decodeURIComponent(roleId),
          currentSystem
        );
        
        setRoleDetails(data);
        
        toast({
          title: "Success",
          description: `Details for role '${data.roleName}' loaded successfully.`,
          variant: "default",
          duration: 900,
        });
      } catch (err) {
        console.error("❌ Error fetching role details:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        
        toast({
          title: "Error",
          description: `Failed to load role details: ${errorMessage}`,
          variant: "destructive",
          duration: 900,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoleData();
  }, [roleId, systemName, toast]);

  if (!roleId) {
    return (
      <Layout title="Role Details">
        <div className="flex justify-center items-center h-48">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Role ID not provided. Please go back to the FUE Calculation page.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const getClassificationColor = (classification: string) => {
    if (classification.includes('GB') || classification === 'GB Advanced Use') {
      return 'bg-red-100 text-red-800 border-red-300';
    }
    if (classification.includes('GC') || classification === 'GC Core Use') {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    if (classification.includes('GD') || classification === 'GD Self-Service Use') {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <Layout title={`Role Details: ${decodeURIComponent(roleId || "")}`}>
      <div className="space-y-6">
        
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Link
            to="/fue-calculation"
            search={{ system: systemName }}
            className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> 
            Back to FUE Calculation
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading role details...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Role Details Card */}
        {roleDetails && !isLoading && !error && (
          <>
            {/* Role Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{roleDetails.roleName}</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Description:</strong> {roleDetails.roleDescription}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <strong>System:</strong> {systemName || "Unknown"}
                </p>
              </CardHeader>
            </Card>

            {/* Authorization Objects Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Authorization Objects
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({roleDetails.objectDetails.length} objects)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {roleDetails.objectDetails.length === 0 ? (
                  <div className="flex justify-center items-center py-8 text-gray-500">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No Authorization Objects</p>
                      <p className="text-sm">This role has no authorization objects defined.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">Object</TableHead>
                          <TableHead className="w-[200px]">Classification</TableHead>
                          <TableHead className="w-[150px]">Field Name</TableHead>
                          <TableHead className="w-[200px]">Value Low</TableHead>
                          <TableHead className="w-[200px]">Value High</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roleDetails.objectDetails.map((obj, index) => (
                          <TableRow 
                            key={`${obj.object}-${obj.fieldName}-${index}`}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-medium font-mono text-sm">
                              {obj.object}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={getClassificationColor(obj.classification)}
                              >
                                {obj.classification}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {obj.fieldName}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {obj.valueLow || <span className="text-gray-400">—</span>}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {obj.valueHigh || <span className="text-gray-400">—</span>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Statistics Card */}
            {roleDetails.objectDetails.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Classification Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4 bg-red-50">
                      <div className="text-sm text-gray-600">GB Advanced Use</div>
                      <div className="text-2xl font-bold text-red-700">
                        {roleDetails.objectDetails.filter(obj => 
                          obj.classification === 'GB Advanced Use'
                        ).length}
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <div className="text-sm text-gray-600">GC Core Use</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {roleDetails.objectDetails.filter(obj => 
                          obj.classification === 'GC Core Use'
                        ).length}
                      </div>
                    </div>
                    <div className="border rounded-lg p-4 bg-green-50">
                      <div className="text-sm text-gray-600">GD Self-Service Use</div>
                      <div className="text-2xl font-bold text-green-700">
                        {roleDetails.objectDetails.filter(obj => 
                          obj.classification === 'GD Self-Service Use'
                        ).length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* No Data State */}
        {!roleDetails && !isLoading && !error && (
          <div className="flex justify-center items-center py-12 text-gray-500">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No Role Details Available</p>
              <p className="text-sm">
                Could not retrieve details for this role. Please verify the role ID and system.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RoleDetails;