
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link, useSearch } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, TrendingDown, TrendingUp, Zap, Activity, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getRoleOptimizationResults } from "@/services/optimizationService";
import { getSimResults} from "../api/optimizeApi";
import { ApiSimResult } from "../api/apiTypes";

import { RoleOptimizationResult } from "@/types/optimization";

interface ColumnWidths {
  roleId: number;
  roleDescription: number;
  authObject: number;
  field: number;
  value: number;
  reducible: number;
  insights: number;
  recommendations: number;
  explanation: number;
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: "default" | "success" | "danger" | "highlight";
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, variant = "default" }) => {
  const variantStyles = {
    default: {
      card: "border border-gray-200 bg-white",
      icon: "bg-blue-50 text-blue-600",
      value: "text-gray-900",
      title: "text-gray-500",
    },
    success: {
      card: "border border-green-200 bg-green-50",
      icon: "bg-green-100 text-green-600",
      value: "text-green-700",
      title: "text-green-600",
    },
    danger: {
      card: "border border-red-200 bg-red-50",
      icon: "bg-red-100 text-red-600",
      value: "text-red-700",
      title: "text-red-500",
    },
    highlight: {
      card: "border-2 border-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-200",
      icon: "bg-white/20 text-white",
      value: "text-white",
      title: "text-blue-100",
    },
  };

  const s = variantStyles[variant];

  return (
    <Card className={`${s.card} transition-shadow hover:shadow-md`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${s.title}`}>
              {title}
            </p>
            <p className={`text-3xl font-bold leading-none ${s.value}`}>
              {value}
            </p>
            {subtitle && (
              <p className={`text-xs mt-1.5 ${variant === "highlight" ? "text-blue-200" : "text-gray-400"}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${s.icon}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const RoleOptimizationResults = () => {
  const { requestId } = useParams({ from: "/role-optimization-results/$requestId" });

  // Optional: pass actualFue as a search param from the calling page
  const search = useSearch({ from: "/role-optimization-results/$requestId" });
  const systemId: string = search?.systemId ?? "";
  const {
  data: simResults = [],
  isLoading: isSimLoading,
} = useQuery<ApiSimResult[], Error>({
  queryKey: ["simResults", requestId, systemId],
  queryFn: () => getSimResults(requestId!, systemId),
  enabled: !!requestId && !!systemId,
});
  // const passedActualFue: number | null = search?.actualFue ? Number(search.actualFue) : null;

  const [searchTerm, setSearchTerm] = useState("");
  const [showReducibleOnly, setShowReducibleOnly] = useState(false);

  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    roleId: 150,
    roleDescription: 200,
    authObject: 150,
    field: 96,
    value: 96,
    reducible: 80,
    insights: 192,
    recommendations: 192,
    explanation: 400,
  });
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<keyof ColumnWidths | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleMouseDown = useCallback(
    (columnKey: keyof ColumnWidths, e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      setResizingColumn(columnKey);

      const startX = e.clientX;
      const startWidth = columnWidths[columnKey];

      const minWidths: ColumnWidths = {
        roleId: 70,
        roleDescription: 100,
        authObject: 80,
        field: 50,
        value: 50,
        reducible: 70,
        insights: 100,
        recommendations: 100,
        explanation: 150,
      };

      const handleMouseMove = (e: MouseEvent) => {
        const diff = e.clientX - startX;
        const newWidth = Math.max(minWidths[columnKey], startWidth + diff);
        setColumnWidths((prev) => ({ ...prev, [columnKey]: newWidth }));
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        setResizingColumn(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [columnWidths]
  );

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    }
    return () => {
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };
  }, [isResizing]);

  const {
    data: results = [],
    isLoading,
    error,
  } = useQuery<RoleOptimizationResult[], Error>({
    queryKey: ["roleOptimizationResults", requestId],
    queryFn: () => getRoleOptimizationResults(requestId!),
    enabled: !!requestId,
  });

  // ── Compute KPI metrics from results ────────────────────────────────────────
  const reducibleCount = results.filter(
    (r) => r.license_can_be_reduced === "Yes"
  ).length;

  const mayBeCount = results.filter(
    (r) => r.license_can_be_reduced === "May Be"
  ).length;

  const totalRoles = new Set(results.map((r) => r.role_id)).size;

  const rolesWithSavings = new Set(
    results
      .filter((r) => r.license_can_be_reduced === "Yes")
      .map((r) => r.role_id)
  ).size;

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filteredResults = results.filter((result) => {
    const searchLower = searchTerm.toLowerCase();
    // const matchesSearch =
    //   !searchTerm ||
    //   result.role_id.toLowerCase().includes(searchLower) ||
    //   (result.role_description?.toLowerCase() || "").includes(searchLower) ||
    const matchesSearch =
  !searchTerm ||
  (result.role_id?.toLowerCase() || "").includes(searchLower) ||
  (result.role_description?.toLowerCase() || "").includes(searchLower) ||
      (result.auth_object?.toLowerCase() || "").includes(searchLower) ||
      (result.field?.toLowerCase() || "").includes(searchLower) ||
      (result.value?.toLowerCase() || "").includes(searchLower);

    return (
      matchesSearch &&
      (!showReducibleOnly ||
        result.license_can_be_reduced === "Yes" ||
        result.license_can_be_reduced === "May Be")
    );
  });

  const ResizeHandle = ({ columnKey }: { columnKey: keyof ColumnWidths }) => (
    <div
      className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors ${
        resizingColumn === columnKey ? "bg-blue-500" : "bg-transparent hover:bg-gray-300"
      }`}
      onMouseDown={(e) => handleMouseDown(columnKey, e)}
      style={{ zIndex: 10 }}
    />
  );

  if (error) {
    return (
      <Layout title="Role Optimization Results">
        <div className="space-y-6">
          <Link to="/role-optimization" className="flex items-center text-blue-600">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Role Optimization
          </Link>
          <div className="text-red-500">Error loading results: {error.message}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Role Optimization Results">
      <div className="space-y-6">

        {/* ── Header row ── */}
        <div className="flex items-center justify-between">
          <Link
            to="/role-optimization"
            className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Role Optimization
          </Link>
          <div>
            <span className="text-sm font-medium text-gray-500">Request ID: </span>
            <span className="text-sm font-semibold text-gray-800">{requestId}</span>
          </div>
        </div>

        {/* ── KPI Cards (3 only) ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border border-gray-200 bg-white animate-pulse">
                <CardContent className="p-5">
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (() => {
         

const simRow = simResults[0]; // there's typically one summary row per request
const currentFue    = simRow?.before_total_fue ?? 0;
const simulatedFue  = simRow?.after_total_fue  ?? 0;
const fueSaved      = simRow?.fue_saved        ?? 0;
const usersImpacted = simRow?.users_impacted   ?? 0;

const isIncrease = simulatedFue > currentFue;
const isDecrease = simulatedFue < currentFue;

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard
                title="Total Roles"
                value={totalRoles}
                subtitle={`${results.length} authorization entries`}
                icon={<Activity className="h-5 w-5" />}
                variant="default"
              />
              <KpiCard
                title="Current FUE"
                value={currentFue.toLocaleString()}
                subtitle="Before optimization"
                icon={<Zap className="h-5 w-5" />}
                variant="default"
              />
              <Card
                className={`transition-shadow hover:shadow-md ${
                  isIncrease
                    ? "border border-red-200 bg-red-50"
                    : isDecrease
                    ? "border border-green-200 bg-green-50"
                    : "border border-gray-200 bg-white"
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                          isIncrease ? "text-red-500" : isDecrease ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        Simulated FUE
                      </p>
                      <p
                        className={`text-3xl font-bold leading-none flex items-center gap-2 ${
                          isIncrease ? "text-red-700" : isDecrease ? "text-green-700" : "text-gray-900"
                        }`}
                      >
                        {simulatedFue.toLocaleString()}
                        {isIncrease && <TrendingUp className="h-6 w-6" />}
                        {isDecrease && <TrendingDown className="h-6 w-6" />}
                      </p>
                      <p className="text-xs mt-1.5 text-gray-400">
                        {isIncrease
                          ? `↑ ${(simulatedFue - currentFue).toLocaleString()} above current`
                          : isDecrease
                          ? `↓ ${(currentFue - simulatedFue).toLocaleString()} below current`
                          : "Same as current"}
                      </p>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 ${
                        isIncrease ? "bg-red-100 text-red-600" : isDecrease ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {isIncrease ? <TrendingUp className="h-5 w-5" /> : isDecrease ? <TrendingDown className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()}

        {/* ── Filter panel ── */}
        <div className="bg-white rounded-md border p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Filter Results</h3>
          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by role, description, object..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 md:pt-6">
              <Checkbox
                id="reducibleOnly"
                checked={showReducibleOnly}
                onCheckedChange={(checked) => setShowReducibleOnly(checked === true)}
              />
              <Label htmlFor="reducibleOnly" className="cursor-pointer">
                Show only reducible licenses
              </Label>
            </div>
            {/* Result count badge */}
            {!isLoading && (
              <div className="flex items-center justify-end md:pt-6">
                <span className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-semibold text-gray-800">
                    {filteredResults.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-800">
                    {results.length}
                  </span>{" "}
                  results
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Results table ── */}
        <div className="rounded-md border bg-white">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading results...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table ref={tableRef} className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="relative border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.roleId}px` }}>
                      Role ID <ResizeHandle columnKey="roleId" />
                    </TableHead>
                    <TableHead className="relative border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.roleDescription}px` }}>
                      Role Description <ResizeHandle columnKey="roleDescription" />
                    </TableHead>
                    <TableHead className="relative border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.authObject}px` }}>
                      Auth Object <ResizeHandle columnKey="authObject" />
                    </TableHead>
                    <TableHead className="relative border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.field}px` }}>
                      Field <ResizeHandle columnKey="field" />
                    </TableHead>
                    <TableHead className="relative border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.value}px` }}>
                      Value <ResizeHandle columnKey="value" />
                    </TableHead>
                    <TableHead className="relative border-r text-center whitespace-pre-wrap break-words" style={{ width: `${columnWidths.reducible}px` }}>
                      Reducible <ResizeHandle columnKey="reducible" />
                    </TableHead>
                    <TableHead className="relative border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.insights}px` }}>
                      Insights <ResizeHandle columnKey="insights" />
                    </TableHead>
                    <TableHead className="relative border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.recommendations}px` }}>
                      Recommendations <ResizeHandle columnKey="recommendations" />
                    </TableHead>
                    <TableHead className="relative whitespace-pre-wrap break-words" style={{ width: `${columnWidths.explanation}px` }}>
                      Explanation <ResizeHandle columnKey="explanation" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                        No results found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.roleId}px` }}>
                          {result.role_id}
                        </TableCell>
                        <TableCell className="border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.roleDescription}px` }}>
                          {result.role_description || "-"}
                        </TableCell>
                        <TableCell className="border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.authObject}px` }}>
                          {result.auth_object || "-"}
                        </TableCell>
                        <TableCell className="border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.field}px` }}>
                          {result.field || "-"}
                        </TableCell>
                        <TableCell className="border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.value}px` }}>
                          {result.value || "-"}
                        </TableCell>
                        <TableCell className="border-r text-center whitespace-pre-wrap break-words" style={{ width: `${columnWidths.reducible}px` }}>
                          {result.license_can_be_reduced === "Yes" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Yes</span>
                          ) : result.license_can_be_reduced === "No" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">No</span>
                          ) : result.license_can_be_reduced === "May Be" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">May Be</span>
                          ) : (
                            <span>-</span>
                          )}
                        </TableCell>
                        <TableCell className="border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.insights}px` }}>
                          <div className="whitespace-pre-wrap break-words">{result.insights || "-"}</div>
                        </TableCell>
                        <TableCell className="border-r whitespace-pre-wrap break-words" style={{ width: `${columnWidths.recommendations}px` }}>
                          <div className="whitespace-pre-wrap break-words">{result.recommendations || "-"}</div>
                        </TableCell>
                        <TableCell className="whitespace-pre-wrap break-words" style={{ width: `${columnWidths.explanation}px` }}>
                          <div className="whitespace-pre-wrap break-words">{result.explanations || "-"}</div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RoleOptimizationResults;