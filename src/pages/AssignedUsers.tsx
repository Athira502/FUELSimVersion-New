
// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useParams, Link, useSearch } from "@tanstack/react-router";
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
import { ArrowLeft, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Import from the new FUE calculation API
import { 
  fetchUsersByRole, 
  UsersByRoleResponse,
  UserWithLicense 
} from "@/api/fue_count_api";

const PAGE_SIZE = 20;

const AssignedUsers = () => {
  const { roleId } = useParams({
    from: "/role-assigned-users/$roleId",
  });

  // systemName passed as search param from FueCalculation
  const search = useSearch({ from: "/role-assigned-users/$roleId" });
  const systemName: string = search?.systemName || "";

  const { toast } = useToast();
  const decodedRoleId = decodeURIComponent(roleId);

  const [usersData, setUsersData] = useState<UsersByRoleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!decodedRoleId) {
        setError("Missing role ID.");
        setLoading(false);
        return;
      }
      
      if (!systemName) {
        setError("Missing system name. Please navigate from the FUE Calculation page.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`🚀 Fetching users for role: ${decodedRoleId} in system: ${systemName}`);
        
        const data = await fetchUsersByRole(decodedRoleId, systemName);
        setUsersData(data);
        
        toast({
          title: "Success",
          description: `Loaded ${data.userCount} users for role '${decodedRoleId}'.`,
          variant: "default",
          duration: 900,
        });
      } catch (err: any) {
        const errorMessage = err.message || "Failed to load assigned users.";
        setError(errorMessage);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          duration: 900,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [decodedRoleId, systemName, toast]);

  // Pagination
  const users = usersData?.users || [];
  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const getClassificationColor = (license: string) => {
    if (license?.toLowerCase().includes("gb") || license?.toLowerCase().includes("advanced")) {
      return "bg-red-100 text-red-800 border-red-300";
    }
    if (license?.toLowerCase().includes("gc") || license?.toLowerCase().includes("core")) {
      return "bg-blue-100 text-blue-800 border-blue-300";
    }
    if (license?.toLowerCase().includes("gd") || license?.toLowerCase().includes("self")) {
      return "bg-green-100 text-green-800 border-green-300";
    }
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <Layout title="Assigned Users">
      <div className="space-y-6">

        {/* Back navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {/* <Link
            to="/fue-calculation"
            className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to FUE Calculation
          </Link> */}
          <Link
  to="/fue-calculation"
  search={{ system: systemName }}
  className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
>
  <ArrowLeft className="mr-1 h-4 w-4" />
  Back to FUE Calculation
</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">Assigned Users</span>
        </div>

        {/* Role info header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Assigned Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Role Name: </span>
                <span className="font-semibold text-gray-900">{decodedRoleId}</span>
              </div>
              {systemName && (
                <div>
                  <span className="font-medium text-gray-600">System: </span>
                  <span className="text-gray-900">{systemName}</span>
                </div>
              )}
              {usersData && (
                <div>
                  <span className="font-medium text-gray-600">Total Users: </span>
                  <span className="text-gray-900 font-semibold">{usersData.userCount}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

         {/* License Distribution Summary */}
        {usersData && users.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">License Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4 bg-red-50">
                  <div className="text-sm text-gray-600">GB Advanced Use</div>
                  <div className="text-2xl font-bold text-red-700">
                    {users.filter(u => 
                      u.licenseFromRole.toLowerCase().includes('gb') || 
                      u.licenseFromRole.toLowerCase().includes('advanced')
                    ).length}
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="text-sm text-gray-600">GC Core Use</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {users.filter(u => 
                      u.licenseFromRole.toLowerCase().includes('gc') || 
                      u.licenseFromRole.toLowerCase().includes('core')
                    ).length}
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="text-sm text-gray-600">GD Self-Service Use</div>
                  <div className="text-2xl font-bold text-green-700">
                    {users.filter(u => 
                      u.licenseFromRole.toLowerCase().includes('gd') || 
                      u.licenseFromRole.toLowerCase().includes('self')
                    ).length}
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-sm text-gray-600">Not Classified</div>
                  <div className="text-2xl font-bold text-gray-700">
                    {users.filter(u => 
                      !u.licenseFromRole || 
                      u.licenseFromRole.toLowerCase().includes('not classified')
                    ).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Users Assigned to Role
                {!loading && !error && usersData && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    {users.length} total
                    {totalPages > 1 && ` · page ${currentPage} of ${totalPages}`}
                  </span>
                )}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-3 text-gray-600">Loading assigned users...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-10 w-10 mb-3 text-red-500" />
                <p className="font-medium text-red-600">{error}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please ensure you navigated from the FUE Calculation page.
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <AlertCircle className="h-10 w-10 mb-3 text-gray-400" />
                <p className="font-medium">No users assigned to this role.</p>
                <p className="text-sm text-gray-400 mt-1">
                  This role exists but currently has no user assignments.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>License from Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((user, index) => (
                        <TableRow key={user.username} className="hover:bg-gray-50">
                          <TableCell className="text-center text-gray-400 text-sm">
                            {(currentPage - 1) * PAGE_SIZE + index + 1}
                          </TableCell>
                          <TableCell className="font-medium font-mono text-gray-900">
                            {user.username}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                getClassificationColor(user.licenseFromRole)
                              }`}
                            >
                              {user.licenseFromRole || "Not Classified"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                      {Math.min(currentPage * PAGE_SIZE, users.length)} of {users.length} users
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      {/* Page number pills */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let page: number;
                          if (totalPages <= 5) {
                            page = i + 1;
                          } else if (currentPage <= 3) {
                            page = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i;
                          } else {
                            page = currentPage - 2 + i;
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 text-sm rounded-md border transition-colors ${
                                page === currentPage
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

       
      </div>
    </Layout>
  );
};

export default AssignedUsers;