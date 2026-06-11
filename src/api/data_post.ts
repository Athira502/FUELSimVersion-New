import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";
function buildFormData(file: File): FormData {
  const fd = new FormData();
  fd.append("csv_file", file);
  return fd;
}

function buildFormData2(file: File): FormData {
  const fd = new FormData();
  fd.append("file", file);
  return fd;
}

function endpoint(path: string, systemName: string, systemRelease: string): string {
  return `${API_BASE_URL}${path}?system_name=${encodeURIComponent(systemName)}&system_release_info=${encodeURIComponent(systemRelease)}`;
}

// ─── Upload APIs — one per backend route ──────────────────────────────────────

/**
 * POST /data/load-agr1251
 * Role Authorization Data (AGR_1251) — CSV
 */
export async function uploadAGR1251(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/data/load-agr1251", systemName, systemRelease), {
    method: "POST",
    body: buildFormData(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
}

/**
 * POST /data/load-agrusers
 * User Role Mapping Data (AGR_USERS) — CSV
 */
export async function uploadAGRUSERS(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/data/load-agrusers", systemName, systemRelease), {
    method: "POST",
    body: buildFormData(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
}

/**
 * POST /data/load-agrdefine
 * Master Derived Role Data (AGR_DEFINE) — CSV
 */
export async function uploadAGRDEFINE(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/data/load-agrdefine", systemName, systemRelease), {
    method: "POST",
    body: buildFormData(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
}

/**
 * POST /data/load-agragrs
 * Composite Role Data (AGR_AGRS) — CSV
 */
export async function uploadAGRAGRS(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/data/load-agragrs", systemName, systemRelease), {
    method: "POST",
    body: buildFormData(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
}

/**
 * POST /data/load-usr02
 * User Details Data (USR02) — CSV
 */
export async function uploadUSR02(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/data/load-usr02", systemName, systemRelease), {
    method: "POST",
    body: buildFormData(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
}

/**
 * POST /data/load-transactionusage
 * Transaction Usage Data — CSV
 */
export async function uploadTransactionUsage(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/data/load-transactionusage", systemName, systemRelease), {
    method: "POST",
    body: buildFormData(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
}

/**
 * POST /data/load-tstctData
 * Transaction Code Data (TSTCT) — CSV
 */
export async function uploadTSTCT(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/data/load-tstctData", systemName, systemRelease), {
    method: "POST",
    body: buildFormData(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
}

/**
 * POST /data/load-flpcaData
 * Role Fiori Data (FLPCA) — CSV
 */
export async function uploadFLPCA(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/data/load-flpcaData", systemName, systemRelease), {
    method: "POST",
    body: buildFormData(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
}

/**
 * POST /data/load-ruleset  (FUE License RuleSet)
 * — adjust the path if your backend uses a different route for ruleset
 */
export async function uploadRuleSet(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/data/load-ruleset", systemName, systemRelease), {
    method: "POST",
    body: buildFormData(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
  
}


export async function uploadUSOBX_C(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/data/load-usobxcData", systemName, systemRelease), {
    method: "POST",
    body: buildFormData(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
  
}

export async function uploadTOBJL(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/data/load-objTextData", systemName, systemRelease), {
    method: "POST",
    body: buildFormData(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
  
}

export async function uploadACTVTTEXT(systemName: string, systemRelease: string, file: File) {
  const res = await fetch(endpoint("/manage-data/load-actvt_text", systemName, systemRelease), {
    method: "POST",
    body: buildFormData2(file),
  });
  if (!res.ok) throw new Error((await res.json()).detail ?? "Upload failed");
  return res.json();
  
}


// ─── Dispatcher — maps TABLE_CONFIG title → correct upload function ───────────

export async function dispatchUpload(
  title: string,
  systemName: string,
  systemRelease: string,
  file: File
): Promise<any> {
  if (title.includes("AGR_1251"))           return uploadAGR1251(systemName, systemRelease, file);
  if (title.includes("AGR_USERS"))          return uploadAGRUSERS(systemName, systemRelease, file);
  if (title.includes("AGR_DEFINE"))         return uploadAGRDEFINE(systemName, systemRelease, file);
  if (title.includes("AGR_AGRS"))           return uploadAGRAGRS(systemName, systemRelease, file);
  if (title.includes("USR02"))              return uploadUSR02(systemName, systemRelease, file);
  if (title.includes("Transaction Usage"))  return uploadTransactionUsage(systemName, systemRelease, file);
  if (title.includes("Transaction Code"))   return uploadTSTCT(systemName, systemRelease, file);
  if (title.includes("Fiori"))              return uploadFLPCA(systemName, systemRelease, file);
  if (title.includes("RuleSet"))            return uploadRuleSet(systemName, systemRelease, file);
  if (title.includes("USOBX_C"))            return uploadUSOBX_C(systemName, systemRelease, file);
  if (title.includes("OBJ TEXT"))           return uploadTOBJL(systemName, systemRelease, file);
  if (title.includes("ACTVT TEXT"))         return uploadACTVTTEXT(systemName, systemRelease, file);

  throw new Error(`No upload endpoint mapped for: "${title}"`);
}






export const fetchLogs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/data/latest-log`);

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData?.detail || `Failed to fetch logs: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const logs = await response.json();
    console.log(logs)
    return logs; 
  } catch (error: any) {
    console.error("Error retrieving logs:", error);
    throw new Error(error.message || "Internal server error");
  }
};


export async function fetchLogFilenames(): Promise<string[]> {
    try {
        const response = await axios.get(`${API_BASE_URL}/logs`);
        if (response.data && Array.isArray(response.data.files)) {
            return response.data.files;
        } else if (response.data && response.data.message) {
            return [];
        }
        throw new Error("Invalid response format: 'files' array not found.");
    } catch (error) {
        console.error("Error fetching log filenames:", error);
        throw error;
    }
}


export async function fetchLogContent(filename: string): Promise<string> {
    try {
        const response = await axios.get(`${API_BASE_URL}/logs`, {
            params: { filename: filename } 
        });
        if (response.data && typeof response.data.content === 'string') {
            return response.data.content;
        }
        throw new Error("Invalid response format: 'content' not found or not a string.");
    } catch (error) {
        console.error(`Error fetching content for ${filename}:`, error);
        throw error;
    }
}



export const downloadLogFile = async (filename) => {
    try {
        const response = await fetch(`${API_BASE_URL}/logs/download/${encodeURIComponent(filename)}`, {
            method: 'GET',
           
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }

        // Get the filename from the response headers or use the provided filename
        const contentDisposition = response.headers.get('Content-Disposition');
        let downloadFilename = filename;
                
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                downloadFilename = filenameMatch[1].replace(/['"]/g, '');
            }
        }

        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true, filename: downloadFilename };
    } catch (error) {
        console.error('Download failed:', error);
        throw new Error(`Failed to download log file: ${error.message}`);
    }
};
