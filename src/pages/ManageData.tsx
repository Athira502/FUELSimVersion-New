

// @ts-nocheck
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Download, Trash, Search, AlertTriangle, Loader2 } from "lucide-react";
import {
  fetchAllSystems,
  fetchTablesForClientSystem,
  downloadTableData,
  truncateTableData,
  deleteSystem,
} from "../api/overview";

const ManageData = () => {
  const { toast } = useToast();
  const [systemsList, setSystemsList] = useState<Array<{ SYSTEM_NAME: string; SYSTEM_RELEASE_INFO?: string }>>([]);
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [availableTables, setAvailableTables] = useState<string[] | null>(null);

  // Delete System modal
  const [isDeleteSysOpen, setIsDeleteSysOpen] = useState(false);
  const [systemToDelete, setSystemToDelete] = useState<string>("");
  const [isDeletingSystem, setIsDeletingSystem] = useState(false);

  const loadSystems = async () => {
    try {
      const systems = await fetchAllSystems();
      setSystemsList(systems);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive", duration: 900 });
    }
  };

  useEffect(() => {
    loadSystems();
  }, []);

  const handleSearch = async () => {
    if (!selectedSystem) {
      toast({
        title: "Selection Required",
        description: "Please select a System",
        variant: "destructive",
        duration: 900,
      });
      return;
    }

    try {
      // fetchTablesForClientSystem now takes only systemName (no DEFAULT_CLIENT)
      const tables = await fetchTablesForClientSystem(selectedSystem);
      if (tables && tables.length > 0) {
        setAvailableTables(tables);
        toast({
          title: "Search Complete",
          description: `Found ${tables.length} data sources for ${selectedSystem}`,
          duration: 900,
        });
      } else {
        setAvailableTables([]);
        toast({
          title: "Search Complete",
          description: `No data sources found for ${selectedSystem}`,
          duration: 900,
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive", duration: 900 });
      setAvailableTables(null);
    }
  };

  const handleDownload = async (tableName: string) => {
    if (!selectedSystem) return;
    try {
      toast({ title: "Download Started", description: `Downloading ${tableName} for ${selectedSystem}`, duration: 900 });
      // downloadTableData now takes only (systemName, tableName) — no DEFAULT_CLIENT
      await downloadTableData(selectedSystem, tableName);
      toast({ title: "Download Complete", description: `Download of ${tableName} finished.`, duration: 900 });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive", duration: 900 });
    }
  };

  const handleDelete = async (tableName: string) => {
    if (!selectedSystem) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete all data from ${tableName} for system ${selectedSystem}? This action cannot be undone.`
    );
    if (!confirmed) return;
    try {
      // truncateTableData now takes only (systemName, tableName) — no DEFAULT_CLIENT
      const response = await truncateTableData(selectedSystem, tableName);
      toast({
        title: "Delete Successful",
        description: response.message || `Data in ${tableName} for ${selectedSystem} has been deleted.`,
        duration: 900,
      });
      handleSearch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive", duration: 900 });
    }
  };

  const handleDeleteSystem = async () => {
    if (!systemToDelete) {
      toast({ title: "Select a system", description: "Please choose a system to delete.", variant: "destructive", duration: 1000 });
      return;
    }
    setIsDeletingSystem(true);
    try {
      await deleteSystem(systemToDelete);
      toast({
        title: "System deleted",
        description: `${systemToDelete} and all related data have been removed.`,
        duration: 1500,
      });
      if (selectedSystem === systemToDelete) {
        setSelectedSystem("");
        setAvailableTables(null);
      }
      setSystemToDelete("");
      setIsDeleteSysOpen(false);
      await loadSystems();
    } catch (err: any) {
      toast({ title: "Failed to delete system", description: err.message, variant: "destructive", duration: 1500 });
    } finally {
      setIsDeletingSystem(false);
    }
  };

  return (
    <Layout title="Manage Data">
      <div className="space-y-6 bg-white shadow-md rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-gray-600">
            Download or delete data based on system selection. Select a system before performing any actions.
          </p>
          <Button
            variant="outline"
            onClick={() => setIsDeleteSysOpen(true)}
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 flex-shrink-0"
          >
            <Trash className="h-4 w-4" /> Delete System
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select System
            </label>
            <Select
              value={selectedSystem}
              onValueChange={(value) => setSelectedSystem(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select System" />
              </SelectTrigger>
              <SelectContent>
                {systemsList.map((s) => (
                  <SelectItem key={s.SYSTEM_NAME} value={s.SYSTEM_NAME}>
                    {s.SYSTEM_NAME}{s.SYSTEM_RELEASE_INFO ? ` — ${s.SYSTEM_RELEASE_INFO}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-1/3">
            <Button
              onClick={handleSearch}
              className="w-full bg-belize-300 hover:bg-belize-400 text-white"
              disabled={!selectedSystem}
            >
              <Search className="h-4 w-4 mr-2" /> Search
            </Button>
          </div>
        </div>

        {availableTables !== null && (
          availableTables && availableTables.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Table Name</th>
                    <th>System</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availableTables.map((tableName) => (
                    <tr key={tableName}>
                      <td className="font-medium">{tableName}</td>
                      <td>{selectedSystem}</td>
                      <td>
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(tableName)}
                            className="text-belize-600 hover:text-belize-700 hover:bg-belize-50"
                          >
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(tableName)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No tables found for system {selectedSystem}.
            </div>
          )
        )}

        {availableTables === null && selectedSystem && (
          <div className="text-center py-8 text-gray-500">
            Click Search to view available data
          </div>
        )}

        {!selectedSystem && (
          <div className="text-center py-8 text-gray-500">
            Please select a System to search for data
          </div>
        )}
      </div>

      {/* ── Delete System modal ──────────────────────────────────────────── */}
      <Dialog open={isDeleteSysOpen} onOpenChange={setIsDeleteSysOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Delete System
            </DialogTitle>
            <DialogDescription>
              This action is <strong>irreversible</strong>. The selected system and{" "}
              <strong>all data associated with it</strong> will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Select system to delete</label>
              <Select value={systemToDelete} onValueChange={setSystemToDelete}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select System" />
                </SelectTrigger>
                <SelectContent>
                  {systemsList.map((s) => (
                    <SelectItem key={s.SYSTEM_NAME} value={s.SYSTEM_NAME}>
                      {s.SYSTEM_NAME}{s.SYSTEM_RELEASE_INFO ? ` — ${s.SYSTEM_RELEASE_INFO}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="font-semibold mb-1">Warning</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>This action cannot be undone.</li>
                <li>All tables, uploads, simulations and results for this system will be deleted.</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteSysOpen(false)} disabled={isDeletingSystem}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteSystem}
              disabled={isDeletingSystem || !systemToDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingSystem ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting…</> : "Delete System"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ManageData;