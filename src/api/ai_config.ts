// src/api/ai_config.ts
const API_BASE_URL =  "http://127.0.0.1:8000";

export interface AIModelConfig {
  id: number;
  model_provider: string;
  model_name: string;
  model_version: string | null;
  is_active: boolean;
  max_tokens: number;
  temperature: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  description: string | null;
}

export interface AIApiKeyConfig {
  provider: string;
  env_var_name: string;
  is_configured: boolean;
  status: 'configured' | 'missing' | 'invalid' | 'active' | 'pending';
}

export interface CreateModelConfigPayload {
  model_provider: string;
  model_name: string;
  model_version?: string;
  max_tokens?: number;
  temperature?: number;
  description?: string;
}

export interface UpdateModelConfigPayload {
  model_name?: string;
  model_version?: string;
  max_tokens?: number;
  temperature?: number;
  description?: string;
}

// Get all model configurations
export async function fetchAllModelConfigs(): Promise<AIModelConfig[]> {
  console.log("🌐 Fetching from:", `${API_BASE_URL}/ai-config/models`); // ✅ Add debug
  
  const response = await fetch(`${API_BASE_URL}/ai-config/models`);
  
  console.log("📥 Response status:", response.status); // ✅ Add debug
  console.log("📥 Response ok:", response.ok); // ✅ Add debug
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to fetch AI model configurations" }));
    console.error("❌ Error response:", error); // ✅ Add debug
    throw new Error(error.detail || "Failed to fetch AI model configurations");
  }
  
  const data = await response.json();
  console.log("✅ Models data:", data); // ✅ Add debug
  return data;
}

// Get active model configuration
export async function fetchActiveModelConfig(): Promise<AIModelConfig> {
  const response = await fetch(`${API_BASE_URL}/ai-config/models/active`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to fetch active AI model configuration" }));
    throw new Error(error.detail || "Failed to fetch active AI model configuration");
  }
  return response.json();
}

// Create new model configuration
export async function createModelConfig(payload: CreateModelConfigPayload): Promise<AIModelConfig> {
  const response = await fetch(`${API_BASE_URL}/ai-config/models`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to create model configuration" }));
    throw new Error(error.detail || "Failed to create model configuration");
  }
  return response.json();
}

// Update model configuration
export async function updateModelConfig(
  modelId: number,
  payload: UpdateModelConfigPayload
): Promise<AIModelConfig> {
  const response = await fetch(`${API_BASE_URL}/ai-config/models/${modelId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to update model configuration" }));
    throw new Error(error.detail || "Failed to update model configuration");
  }
  return response.json();
}

// Set active model
export async function setActiveModel(modelId: number): Promise<AIModelConfig> {
  const response = await fetch(`${API_BASE_URL}/ai-config/models/set-active`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_id: modelId }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to set active model" }));
    throw new Error(error.detail || "Failed to set active model");
  }
  return response.json();
}

// Delete model configuration
export async function deleteModelConfig(modelId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/ai-config/models/${modelId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to delete model configuration" }));
    throw new Error(error.detail || "Failed to delete model configuration");
  }
}

// Get API key configurations
export async function fetchApiKeyConfigs(): Promise<AIApiKeyConfig[]> {
  const response = await fetch(`${API_BASE_URL}/ai-config/api-keys`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to fetch API key configurations" }));
    throw new Error(error.detail || "Failed to fetch API key configurations");
  }
  return response.json();
}

// Verify API key
export async function verifyApiKey(provider: string): Promise<{ message: string; provider: string; status: string }> {
  const response = await fetch(`${API_BASE_URL}/ai-config/api-keys/verify/${provider}`, {
    method: "POST",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to verify API key" }));
    throw new Error(error.detail || "Failed to verify API key");
  }
  return response.json();
}


export async function saveApiKey(provider: string, apiKey: string) {
  const res = await fetch(`${API_BASE_URL}/ai-config/api-keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, api_key: apiKey }),
  });
  if (!res.ok) throw new Error((await res.json()).detail);
  return res.json();
}

export async function deleteApiKey(provider: string) {
  const res = await fetch(`${API_BASE_URL}/ai-config/api-keys/${provider}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error((await res.json()).detail);
}