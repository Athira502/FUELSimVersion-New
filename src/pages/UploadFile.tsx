// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Upload, Download, CheckCircle2, XCircle, Loader2,
  BarChart3, FileSpreadsheet, Zap, AlertCircle, Plus,
} from "lucide-react";
import * as XLSX from "xlsx";

import {
  fetchAllSystems,
  createSystem,
 
} from '../api/overview';

import {dispatchUpload,
} from '../api/data_post';

// ─── Template map ─────────────────────────────────────────────────────────────
const TEMPLATE_COLUMNS = {
  "Role Authorization Data(AGR_1251)": {
    headers: ["AGR_NAME", "OBJECT", "FIELD", "LOW", "HIGH","OBJ_STATUS"],
    sample:  ["ZD_OTC_M_PRGM_MGR_2100", "V_VBRK_FKA", "ACTVT", "48", "46","S"],
  },
  "User Role Mapping Data(AGR_USERS)": {
    headers: ["AGR_NAME", "UNAME"],
    sample:  ["ZD_OTC_M_PRGM_MGR_2100", "ADSUSER"],
  },
  "Master Derived Role Data(AGR_DEFINE)": {
    headers: ["AGR_NAME", "PARENT_AGR", "TEXT"],
    sample:  ["ZD_DTS_M_PLAN_MTRL_PLNR_2110", "ZM_DTS_M_PLAN_MTRL_PLNR", "DTS: Material Planner for 2110"],
  },
  "Composite role Data(AGR_AGRS)": {
    headers: ["COMPOSITE_ROLE", "ROLE", "ACTIVE"],
    sample:  ["ZC_FTM_M_CMRCL_ACCT_ADDON_1300", "ZD_FTM_M_CMRCL_ACCT_ADDON_1300", "X"],
  },
  "User Details Data(USR02)": {
    headers: ["BNAME", "GLTGB", "GLTGV", "UFLAG", "ERDAT", "TRDAT", "USTYP"],
    sample:  ["A221697", "03-03-2023", "31-12-9999", "0", "31-03-2023", "24-04-2026", "A"],
  },
  "Transaction Usage Data": {
    headers: ["TRANSACTION", "PROGRAM", "USER"],
    sample:  ["QE01", "SAPMQEEA", "JBUCKWALTER"],
  },
  "Role Fiori Data": {
    headers: [
      "Single_Role_Name", "Single_Role_Description", "Catalog_ID", "Semantic_Object",
      "Action", "Title_Subtitle_Information", "Application_Type", "SAP_Fiori_ID",
      "Transaction", "Tile_Title", "Target_Mapping_Title",
      "OData_v2_Service_Name", "OData_v2_Service_Status",
      "OData_v4_Service_Name", "OData_v4_Service_Status",
    ],
    sample: [
      "Z_BR_AA_ACCOUNTANT", "Asset Accountant", "SAP_SFIN_BC_AA_CONSTR", "Shell",
      "plugin", "User Default Parameters", "UI5", "F1765", "User Default Parameters",
    ],
  },
  "Transaction Code Data": {
    headers: ["TCODE", "TRANSACTION_TEXT"],
    sample:  ["SU01", "User maintenance"],
  },
  "FUE License RuleSet": {
    headers: ["Rule Description", "AuthObject", "AuthField", "AuthValue"],
    sample:  ["GB Advanced Use", "/ECRS/POIA", "ACTVT", "01"],
  },
  "USOBX_C Data": {
    headers: ["NAME", "PROPOSED_VALUE_FOR", "AUTH_OBJ", "OKFLAG"],
    sample:  ["VA01", "TR", "S_TABU_DIS", ""],
  },
  "OBJ TEXT Data": {  	

    headers: ["AUTH_OBJ", "TEXT"],
    sample:  ["/ACCGO/APS", "Application Archiving"],
  },

  "ACTVT TEXT Data": {  	

    headers: ["Activity", "Text"],
    sample:  ["01", "Create"],
  },
};
	

// ─── Table config — titles must match the dispatcher keys in upload.ts ────────
const TABLE_CONFIG = [
  { title: "Role Authorization Data(AGR_1251)",   allowedExtensions: [".csv"] },
  { title: "User Role Mapping Data(AGR_USERS)",   allowedExtensions: [".csv"] },
  { title: "Master Derived Role Data(AGR_DEFINE)", allowedExtensions: [".csv"] },
  { title: "Composite role Data(AGR_AGRS)",        allowedExtensions: [".csv"] },
  { title: "User Details Data(USR02)",             allowedExtensions: [".csv"] },
  { title: "Transaction Usage Data",               allowedExtensions: [".csv"] },
  { title: "Role Fiori Data",                      allowedExtensions: [".csv"] },
  { title: "Transaction Code Data",                allowedExtensions: [".csv"] },
  { title: "FUE License RuleSet",                  allowedExtensions: [".csv"] },
  { title: "USOBX_C Data",                         allowedExtensions: [".csv"] },
  { title: "OBJ TEXT Data",                        allowedExtensions: [".csv"] },
  { title: "ACTVT TEXT Data",                      allowedExtensions: [".csv"] },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, icon, variant = "blue", subtitle }) => {
  const palette = {
    blue:  { card: "border-blue-200 bg-gradient-to-br from-blue-600 to-blue-700 shadow-blue-200",       icon: "bg-white/20 text-white", label: "text-blue-100",  value: "text-white", sub: "text-blue-200"  },
    green: { card: "border-green-200 bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-200", icon: "bg-white/20 text-white", label: "text-green-100", value: "text-white", sub: "text-green-200" },
    amber: { card: "border-amber-200 bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-200",  icon: "bg-white/20 text-white", label: "text-amber-100", value: "text-white", sub: "text-amber-200" },
  }[variant];
  return (
    <Card className={`border shadow-lg ${palette.card}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${palette.label}`}>{label}</p>
            <div className={`text-3xl font-bold leading-none ${palette.value}`}>{value}</div>
            {subtitle && <p className={`text-xs mt-1.5 ${palette.sub}`}>{subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-xl flex-shrink-0 ${palette.icon}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Upload Row ───────────────────────────────────────────────────────────────
const UploadRow = ({ row, selectedSystem, onFileChange }) => {
  const { toast } = useToast();
  const inputId = `file-${row.title.replace(/\s+/g, "-").toLowerCase()}`;

  const handleChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) { onFileChange(row.title, null, ""); return; }
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    if (!row.allowedExtensions.includes(`.${ext}`)) {
      toast({ title: "Invalid file type", description: `Allowed: ${row.allowedExtensions.join(", ")}`, variant: "destructive", duration: 900 });
      e.target.value = "";
      onFileChange(row.title, null, "");
      return;
    }
    onFileChange(row.title, f, f.name);
  };

  const handleDownload = () => {
    const tpl = TEMPLATE_COLUMNS[row.title];
    if (!tpl) return;
    if (!selectedSystem) {
      toast({ title: "Select a system first", variant: "destructive", duration: 1200 });
      return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([tpl.headers, tpl.sample]);
    ws["!cols"] = tpl.headers.map((h) => ({ wch: Math.max(h.length + 4, 18) }));
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `${selectedSystem}_${row.title.replace(/[&\s/()]+/g, "_")}_Template.xlsx`);
  };

  const statusIcon =
    row.status === "uploading" ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> :
    row.status === "success"   ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
    row.status === "error"     ? <XCircle className="h-4 w-4 text-red-500" /> : null;

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-3 px-4 py-3 border-b border-gray-100 items-center transition-colors
      ${row.file ? "bg-blue-50/40" : "bg-white hover:bg-gray-50/60"}
      ${row.status === "success" ? "bg-green-50/40" : ""}
      ${row.status === "error"   ? "bg-red-50/30"   : ""}
    `}>
      <div className="lg:col-span-3 flex items-center gap-2">
        {statusIcon}
        <span className="text-sm font-medium text-gray-700 leading-snug">{row.title}</span>
      </div>
      <div className="lg:col-span-1 hidden lg:flex">
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-mono">
          {row.allowedExtensions.join(" ")}
        </span>
      </div>
      <div className="lg:col-span-4">
        <input type="file" id={inputId} className="sr-only" onChange={handleChange} accept={row.allowedExtensions.join(",")} />
        <Label htmlFor={inputId} className={`cursor-pointer flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md border transition-all
          ${row.file ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-400 hover:border-blue-300 hover:text-blue-500"}`}>
          <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{row.fileName || "Choose file…"}</span>
        </Label>
      </div>
      <div className="lg:col-span-2">
        <Button variant="outline" size="sm" onClick={handleDownload}
          className="w-full text-xs border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 gap-1.5">
          <Download className="h-3.5 w-3.5" /> Template
        </Button>
      </div>
      <div className="lg:col-span-2 hidden lg:block">
        {row.status === "success"   && <span className="text-xs text-green-600 font-medium">Uploaded ✓</span>}
        {row.status === "error"     && <span className="text-xs text-red-500 truncate">{row.message}</span>}
        {row.status === "uploading" && <span className="text-xs text-blue-500">Uploading…</span>}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const UploadFile = () => {
  const { toast } = useToast();

  // Systems state — store full objects so we have SYSTEM_RELEASE_INFO too
  const [systemsList, setSystemsList] = useState<Array<{ SYSTEM_NAME: string; SYSTEM_RELEASE_INFO: string }>>([]);
  const [selectedSystem, setSelectedSystem] = useState("");

  // Add System modal
  const [isAddOpen, setIsAddOpen]           = useState(false);
  const [newSystemName, setNewSystemName]   = useState("");
  const [newSystemRelease, setNewSystemRelease] = useState("");
  const [isSavingSystem, setIsSavingSystem] = useState(false);

  const loadSystems = async () => {
    try {
      const systems = await fetchAllSystems();   // ← from upload.ts
      setSystemsList(systems);
    } catch (err: any) {
      toast({ title: "Error loading systems", description: err.message, variant: "destructive", duration: 1200 });
    }
  };

  useEffect(() => { loadSystems(); }, []);

  // Derive release from selected system
  const selectedSystemRelease =
    systemsList.find((s) => s.SYSTEM_NAME === selectedSystem)?.SYSTEM_RELEASE_INFO ?? "";

  const [rows, setRows] = useState(
    TABLE_CONFIG.map((t) => ({ ...t, file: null, fileName: "", status: "idle", message: "" }))
  );
  const [isUploading, setIsUploading] = useState(false);

  const selectedCount = rows.filter((r) => r.file !== null).length;

  const handleFileChange = (title, file, fileName) => {
    setRows((prev) => prev.map((r) =>
      r.title === title ? { ...r, file, fileName, status: "idle", message: "" } : r
    ));
  };

  const handleUploadAll = async () => {
    if (!selectedSystem) {
      toast({ title: "Select a system first", variant: "destructive", duration: 900 });
      return;
    }
    if (selectedCount === 0) {
      toast({ title: "No files selected", description: "Choose at least one file.", variant: "destructive", duration: 900 });
      return;
    }

    setIsUploading(true);
    const pending = rows.filter((r) => r.file !== null);
    setRows((prev) => prev.map((r) => r.file ? { ...r, status: "uploading", message: "" } : r));

    let successCount = 0;

    await Promise.allSettled(
      pending.map(async (row) => {
        try {
          // systemName and systemRelease flow into query params →
          // backend uses system_name to build the dynamic table name
          await dispatchUpload(row.title, selectedSystem, selectedSystemRelease, row.file);
          setRows((prev) => prev.map((r) =>
            r.title === row.title ? { ...r, status: "success", message: "Uploaded" } : r
          ));
          successCount++;
        } catch (err: any) {
          setRows((prev) => prev.map((r) =>
            r.title === row.title ? { ...r, status: "error", message: err?.message || "Upload failed" } : r
          ));
        }
      })
    );

    setIsUploading(false);
    toast({
      title: successCount === pending.length ? "All uploads complete" : `${successCount}/${pending.length} uploaded`,
      description: successCount < pending.length ? "Some files failed — check the rows for details." : "Data loaded successfully.",
      variant: successCount === pending.length ? "default" : "destructive",
      duration: 1500,
    });
  };

  const handleSaveSystem = async () => {
    if (!newSystemName.trim() || !newSystemRelease.trim()) {
      toast({ title: "Missing fields", description: "Both System Name and System Release are required.", variant: "destructive", duration: 1000 });
      return;
    }
    setIsSavingSystem(true);
    try {
      await createSystem({          // ← from upload.ts, POST /systems
        SYSTEM_NAME:        newSystemName.trim(),
        SYSTEM_RELEASE_INFO: newSystemRelease.trim(),
      });
      toast({ title: "System added", description: `${newSystemName} has been registered.`, duration: 1200 });
      await loadSystems();
      setSelectedSystem(newSystemName.trim());
      setNewSystemName("");
      setNewSystemRelease("");
      setIsAddOpen(false);
    } catch (err: any) {
      toast({ title: "Failed to add system", description: err.message, variant: "destructive", duration: 1500 });
    } finally {
      setIsSavingSystem(false);
    }
  };

  return (
    <Layout title="Upload Data">
      <div className="space-y-6">

        {/* ── Global config card ── */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Select System <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select System" />
                    </SelectTrigger>
                    <SelectContent>
                      {systemsList.map((s) => (
                        <SelectItem key={s.SYSTEM_NAME} value={s.SYSTEM_NAME}>
                          {s.SYSTEM_NAME}
                          {/* {s.SYSTEM_RELEASE_INFO ? ` — ${s.SYSTEM_RELEASE_INFO}` : ""} */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSystemRelease && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      System Release
                    </Label>
                    <div className="px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50 text-gray-700">
                      {selectedSystemRelease}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <div className="flex gap-2">
                  <Button
                    onClick={handleUploadAll}
                    disabled={isUploading || selectedCount === 0 || !selectedSystem}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 h-10 shadow-md shadow-blue-200 disabled:opacity-40"
                  >
                    {isUploading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                      : <><Upload className="h-4 w-4" /> Upload All Files</>}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddOpen(true)}
                    className="gap-2 h-10 border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4" /> Add System
                  </Button>
                </div>
                {selectedCount > 0 && !isUploading && (
                  <span className="text-xs text-gray-400">
                    {selectedCount} file{selectedCount > 1 ? "s" : ""} selected
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              <span className="text-red-400">*</span> Select files below then click <strong>Upload All Files</strong>.
            </p>
          </CardContent>
        </Card>

        {/* ── Upload table ── */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="lg:col-span-3">Data Type</div>
              <div className="lg:col-span-1 hidden lg:block">Format</div>
              <div className="lg:col-span-4">File</div>
              <div className="lg:col-span-2">Template</div>
              <div className="lg:col-span-2 hidden lg:block">Status</div>
            </div>
          </div>

          {rows.map((row) => (
            <UploadRow
              key={row.title}
              row={row}
              selectedSystem={selectedSystem}
              onFileChange={handleFileChange}
            />
          ))}

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Download a template to see the exact column structure. The system name flows through to the correct backend table automatically.
            </p>
          </div>
        </Card>
      </div>

      {/* ── Add System Modal ── */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add System</DialogTitle>
            <DialogDescription>
              Register a new system. It will appear in the dropdown immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="newSystemName">System Name *</Label>
              <Input
                id="newSystemName"
                placeholder="e.g. S4H"
                value={newSystemName}
                onChange={(e) => setNewSystemName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newSystemRelease">System Release *</Label>
              <Input
                id="newSystemRelease"
                placeholder="e.g. S4 HANA OnPremise 1909"
                value={newSystemRelease}
                onChange={(e) => setNewSystemRelease(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSavingSystem}>Cancel</Button>
            <Button onClick={handleSaveSystem} disabled={isSavingSystem} className="bg-blue-600 hover:bg-blue-700">
              {isSavingSystem ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : "Save System"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};
export default UploadFile;