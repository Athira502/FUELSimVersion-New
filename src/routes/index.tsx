import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — FUE Optimizer Pro" },
      { name: "description", content: "FUE license overview dashboard with KPIs, user license status, and 12-month trends." },
    ],
  }),
  component: Overview,
});

const SYSTEMS = ["All Systems", "PRD-100", "QAS-200", "DEV-300"] as const;
type System = (typeof SYSTEMS)[number];

// Stable mock data per system
const MOCK = {
  "All Systems": {
    fueCount: 1842,
    overallFue: 2150,
    advancedFue: 980,
    coreFue: 720,
    selfServiceFue: 450,
    users: {
      "GB Advanced Use": { Active: 540, Dormant: 120, "Expired but not Locked": 45, "Locked but not Expired": 32 },
      "GC Core Use":     { Active: 410, Dormant: 95,  "Expired but not Locked": 38, "Locked but not Expired": 22 },
      "GD Self-Service Use": { Active: 320, Dormant: 70, "Expired but not Locked": 24, "Locked but not Expired": 14 },
    },
  },
  "PRD-100": {
    fueCount: 920,
    overallFue: 1080,
    advancedFue: 510,
    coreFue: 360,
    selfServiceFue: 210,
    users: {
      "GB Advanced Use": { Active: 280, Dormant: 60, "Expired but not Locked": 22, "Locked but not Expired": 18 },
      "GC Core Use":     { Active: 210, Dormant: 48, "Expired but not Locked": 19, "Locked but not Expired": 12 },
      "GD Self-Service Use": { Active: 160, Dormant: 35, "Expired but not Locked": 12, "Locked but not Expired": 8 },
    },
  },
  "QAS-200": {
    fueCount: 540,
    overallFue: 640,
    advancedFue: 280,
    coreFue: 220,
    selfServiceFue: 140,
    users: {
      "GB Advanced Use": { Active: 160, Dormant: 35, "Expired but not Locked": 14, "Locked but not Expired": 9 },
      "GC Core Use":     { Active: 130, Dormant: 28, "Expired but not Locked": 11, "Locked but not Expired": 6 },
      "GD Self-Service Use": { Active: 100, Dormant: 22, "Expired but not Locked": 7, "Locked but not Expired": 4 },
    },
  },
  "DEV-300": {
    fueCount: 382,
    overallFue: 430,
    advancedFue: 190,
    coreFue: 140,
    selfServiceFue: 100,
    users: {
      "GB Advanced Use": { Active: 100, Dormant: 25, "Expired but not Locked": 9, "Locked but not Expired": 5 },
      "GC Core Use":     { Active: 70,  Dormant: 19, "Expired but not Locked": 8, "Locked but not Expired": 4 },
      "GD Self-Service Use": { Active: 60, Dormant: 13, "Expired but not Locked": 5, "Locked but not Expired": 2 },
    },
  },
} as const;

function buildTrend() {
  // Last 12 months ending current month
  const now = new Date();
  const data: { label: string; Overall: number; Advanced: number; Core: number; SelfService: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en-US", { month: "short" }) +
      " " + String(d.getFullYear()).slice(-2);
    const base = 1800 + Math.round(Math.sin(i / 2) * 80) + (11 - i) * 14;
    data.push({
      label,
      Overall: base + 200,
      Advanced: Math.round(base * 0.45),
      Core: Math.round(base * 0.34),
      SelfService: Math.round(base * 0.21),
    });
  }
  return data;
}

const KPI_CARDS = [
  { key: "fueCount", label: "Current FUE Count" },
  { key: "overallFue", label: "Overall FUE" },
  { key: "advancedFue", label: "GB Advanced Use" },
  { key: "coreFue", label: "GC Core Use" },
  { key: "selfServiceFue", label: "GD Self-Service Use" },
] as const;

function Overview() {
  const [system, setSystem] = useState<System>("All Systems");
  const data = MOCK[system];

  const userBars = useMemo(
    () =>
      (Object.keys(data.users) as Array<keyof typeof data.users>).map((k) => ({
        type: k,
        ...data.users[k],
      })),
    [data]
  );

  const trend = useMemo(() => buildTrend(), []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header row: title + system filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">System</span>
          <Select value={system} onValueChange={(v) => setSystem(v as System)}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SYSTEMS.map((s) => (
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
                {(data[k.key as keyof typeof data] as number).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Users by License Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userBars} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Active" fill="var(--color-belize-700)" />
                  <Bar dataKey="Dormant" fill="var(--color-belize-400)" />
                  <Bar dataKey="Expired but not Locked" fill="#e0a800" />
                  <Bar dataKey="Locked but not Expired" fill="#c0392b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">FUE Trend — Last 12 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="Overall" name="Overall FUE" stroke="var(--color-belize-800)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Advanced" name="Advanced Use" stroke="var(--color-belize-500)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Core" name="Core Use" stroke="#e0a800" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="SelfService" name="Self-Service Use" stroke="#16a085" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
