
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSimulationResults } from "@/services/simulationService";

const SimulationResults = () => {
  const { requestId } = useParams<{ requestId: string }>();
  
  const { data: simulationData, isLoading } = useQuery({
    queryKey: ['simulationResults', requestId],
    queryFn: () => getSimulationResults(requestId!),
    enabled: !!requestId,
  });

  if (isLoading) {
    return (
      <Layout title="Simulation Results">
        <div className="flex justify-center items-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-belize-600 mx-auto mb-4"></div>
            <p>Loading simulation results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Simulation Results">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/role-optimization" className="flex items-center text-belize-600">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Role Optimization
          </Link>
          <div>
            <span className="text-sm font-medium">Request ID: </span>
            <span className="text-sm">{requestId}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affected Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulationData?.affectedUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Users impacted by role changes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">FUE License Reduction</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{simulationData?.fueLicenseReduction || 0}</div>
              <p className="text-xs text-muted-foreground">
                Licenses that can be reduced
              </p>
            </CardContent>
          </Card>
        </div>

        {simulationData?.roleBreakdown && (
          <Card>
            <CardHeader>
              <CardTitle>Role Impact Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {simulationData.roleBreakdown.map((role: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{role.roleId}</h4>
                      {role.canReduce && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Reducible
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Users Affected:</span>
                        <div className="font-medium">{role.usersAffected}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current License:</span>
                        <div className="font-medium">{role.currentLicense}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recommended:</span>
                        <div className="font-medium">{role.recommendedLicense}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">FUE License Reduction:</span>
                        <div className="font-medium">{role.savings}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SimulationResults;
