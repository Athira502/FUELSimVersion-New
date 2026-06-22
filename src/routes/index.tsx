

// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import { fetchAllSystems, fetchDashboard, fetchFueHistory } from "@/api/overview";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — FUE Optimizer Pro" },
      { name: "description", content: "FUE license overview dashboard." },
    ],
  }),
  component: Overview,
});

const KPI_CARDS = [
  { key: "totalFue",    label: "Total FUE" },
  { key: "advancedFue", label: "GB Advanced Use FUE" },
  { key: "coreFue",     label: "GC Core Use FUE" },
  { key: "selfSvcFue",  label: "GD Self-Service FUE" },
] as const;

const LICENSE_COLORS: Record<string, string> = {
  "GB Advanced Use":     "#1a56a0",
  "GC Core Use":         "#2980b9",
  "GD Self-Service Use": "#5dade2",
  "Not Classified":      "#bdc3c7",
};

const EMPTY_KPI = {
  totalFue: 0, advancedFue: 0, coreFue: 0, selfSvcFue: 0, totalUsers: 0,
};

function Overview() {
  const [systemsList, setSystemsList]       = useState<string[]>([]);
  const [selectedSystem, setSelectedSystem] = useState("");
  const [kpi, setKpi]                       = useState(EMPTY_KPI);
  const [userBars, setUserBars]             = useState<any[]>([]);
  const [roleBars, setRoleBars]             = useState<any[]>([]);
  const [trendData, setTrendData]           = useState<any[]>([]);   // ← NEW
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => {
    fetchAllSystems()
      .then((systems) => {
        const names = systems.map((s) => s.SYSTEM_NAME);
        setSystemsList(names);
        if (names.length > 0) setSelectedSystem(names[0]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSystem) return;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch dashboard + history in parallel
        const [data, historyRes] = await Promise.all([
          fetchDashboard(selectedSystem),
          fetchFueHistory(selectedSystem).catch(() => ({ history: [] })), // ← graceful fallback
        ]);

        // ── KPIs ──
        const userDist    = data.user_license_distribution;
        const totalFue    = userDist.total_fue ?? 0;
        const totalUsers  = userDist.total_count ?? 0;
        const advancedFue = userDist.breakdown.find(b => b.category === "GB Advanced Use")?.fue ?? 0;
        const coreFue     = userDist.breakdown.find(b => b.category === "GC Core Use")?.fue ?? 0;
        const selfSvcFue  = userDist.breakdown.find(b => b.category === "GD Self-Service Use")?.fue ?? 0;
        setKpi({ totalFue, advancedFue, coreFue, selfSvcFue, totalUsers });

        // ── Users bar chart ──
        const licenseKeys = ["GB Advanced Use", "GC Core Use", "GD Self-Service Use", "Not Classified"];
        const shortLabels: Record<string, string> = {
          "GB Advanced Use":     "GB Advanced",
          "GC Core Use":         "GC Core",
          "GD Self-Service Use": "GD Self-Service",
          "Not Classified":      "Not Classified",
        };
        const getCount = (section: any, category: string) =>
          section.breakdown.find((b: any) => b.category === category)?.count ?? 0;

        const bars = licenseKeys
          .map((lic) => {
            const active  = getCount(data.user_license_distribution, lic);
            const dormant = getCount(data.dormant_90, lic);
            const expired = getCount(data.expired_not_locked, lic);
            const locked  = getCount(data.locked_not_expired, lic);
            if (active + dormant + expired + locked === 0) return null;
            return { type: shortLabels[lic], Active: active, Dormant: dormant, Expired: expired, Locked: locked };
          })
          .filter(Boolean);
        setUserBars(bars);

        // ── Roles bar chart ──
        const rolesBars = data.role_license_distribution.breakdown.map((item) => ({
          name:  item.category,
          value: item.count,
          color: LICENSE_COLORS[item.category] ?? "#7f8c8d",
        }));
        setRoleBars(rolesBars);

        // ── FUE Trend ──
        setTrendData(historyRes.history ?? []);

      } catch {
        setError("Failed to load dashboard data.");
        setKpi(EMPTY_KPI);
        setUserBars([]);
        setRoleBars([]);
        setTrendData([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [selectedSystem]);

  return (
    <div className="p-4 md:p-6 space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
          {error && !isLoading && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
              {error}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">System</span>
          <Select value={selectedSystem} onValueChange={setSelectedSystem}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Select system" />
            </SelectTrigger>
            <SelectContent>
              {systemsList.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {KPI_CARDS.map((k) => (
          <Card key={k.key} className="py-3">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-xl font-bold mt-1">
                {isLoading
                  ? <span className="text-muted-foreground text-base">—</span>
                  : (kpi[k.key as keyof typeof kpi] as number).toLocaleString()
                }
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Users by License Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {userBars.length === 0 && !isLoading ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No user data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userBars} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Active"  fill="#1a56a0" />
                    <Bar dataKey="Dormant" fill="#5dade2" name="Dormant 90+" />
                    <Bar dataKey="Expired" fill="#e0a800" name="Expired but not Locked" />
                    <Bar dataKey="Locked"  fill="#c0392b" name="Locked but not Expired" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Roles by License Type</CardTitle>
              <span className="text-xs text-muted-foreground">
                {roleBars.reduce((s, d) => s + d.value, 0).toLocaleString()} total roles
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {roleBars.length === 0 && !isLoading ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No role data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleBars} margin={{ top: 8, right: 8, left: -10, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value: number) => [value.toLocaleString(), "Roles"]} />
                    <Bar dataKey="value" name="No. of Roles" radius={[4, 4, 0, 0]}>
                      {roleBars.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FUE Trend — Last 12 Months */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">FUE Trend — Last 12 Months</CardTitle>
            {trendData.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {trendData.length} snapshot{trendData.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No trend data yet — run FUE computation to start tracking history
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="total_fue" stroke="#1a56a0" strokeWidth={2} name="Total FUE"    dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="gb_fue"    stroke="#e74c3c" strokeWidth={1.5} name="GB FUE"   dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="gc_fue"    stroke="#2980b9" strokeWidth={1.5} name="GC FUE"   dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="gd_fue"    stroke="#5dade2" strokeWidth={1.5} name="GD FUE"   dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}