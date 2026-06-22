

// // @ts-nocheck

// import React, { useState } from "react";
// import Layout from "@/components/Layout";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useToast } from "@/components/ui/use-toast";
// import { Eye, EyeOff, Save } from "lucide-react";

// const AIConfig = () => {
//   const { toast } = useToast();
//   const [selectedModel, setSelectedModel] = useState("");
//   const [openaiKey, setOpenaiKey] = useState("");
//   const [claudeKey, setClaudeKey] = useState("");
//   const [showOpenaiKey, setShowOpenaiKey] = useState(false);
//   const [showClaudeKey, setShowClaudeKey] = useState(false);

//   const aiModels = [
//     { value: "gpt-4o-mini", label: "OpenAI GPT-4o Mini" },
//     { value: "claude-4-opus", label: "Claude 4 Opus" }
//   ];

//   const handleSave = () => {
//     // In a real application, this would save to backend/database
//     localStorage.setItem('ai-config', JSON.stringify({
//       selectedModel,
//       openaiKey,
//       claudeKey,
//       updatedAt: new Date().toISOString()
//     }));

//     toast({
//       title: "Configuration Saved",
//       description: "AI configuration has been saved successfully.",
//     });
//   };

//   const handleClear = () => {
//     setSelectedModel("");
//     setOpenaiKey("");
//     setClaudeKey("");
//     localStorage.removeItem('ai-config');
    
//     toast({
//       title: "Configuration Cleared",
//       description: "All AI configuration has been cleared.",
//     });
//   };

//   // Load saved config on component mount
//   React.useEffect(() => {
//     const savedConfig = localStorage.getItem('ai-config');
//     if (savedConfig) {
//       const config = JSON.parse(savedConfig);
//       setSelectedModel(config.selectedModel || "");
//       setOpenaiKey(config.openaiKey || "");
//       setClaudeKey(config.claudeKey || "");
//     }
//   }, []);

//   return (
//     <Layout title="AI Configuration">
//       <div className="max-w-4xl mx-auto space-y-6">
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               AI Model Configuration
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Model Selection */}
//             <div className="space-y-2">
//               <Label htmlFor="model-select">Select AI Model</Label>
//               <Select value={selectedModel} onValueChange={setSelectedModel}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Choose an AI model" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {aiModels.map((model) => (
//                     <SelectItem key={model.value} value={model.value}>
//                       {model.label}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* OpenAI API Key */}
//             <div className="space-y-2">
//               <Label htmlFor="openai-key">OpenAI API Key</Label>
//               <div className="relative">
//                 <Input
//                   id="openai-key"
//                   type={showOpenaiKey ? "text" : "password"}
//                   placeholder="Enter your OpenAI API key"
//                   value={openaiKey}
//                   onChange={(e) => setOpenaiKey(e.target.value)}
//                   className="pr-10"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowOpenaiKey(!showOpenaiKey)}
//                 >
//                   {showOpenaiKey ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//               <p className="text-xs text-gray-500">
//                 Required for OpenAI models (GPT-4o Mini)
//               </p>
//             </div>

//             {/* Claude API Key */}
//             <div className="space-y-2">
//               <Label htmlFor="claude-key">Claude API Key</Label>
//               <div className="relative">
//                 <Input
//                   id="claude-key"
//                   type={showClaudeKey ? "text" : "password"}
//                   placeholder="Enter your Claude API key"
//                   value={claudeKey}
//                   onChange={(e) => setClaudeKey(e.target.value)}
//                   className="pr-10"
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowClaudeKey(!showClaudeKey)}
//                 >
//                   {showClaudeKey ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//               <p className="text-xs text-gray-500">
//                 Required for Claude models (Opus)
//               </p>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex items-center justify-end space-x-3 pt-4">
//               <Button variant="outline" onClick={handleClear}>
//                 Clear All
//               </Button>
//               <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
//                 <Save className="mr-2 h-4 w-4" />
//                 Save Configuration
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Configuration Status */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Current Configuration Status</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <div className="text-center p-4 bg-gray-50 rounded-lg">
//                 <div className="font-medium text-sm text-gray-600">Selected Model</div>
//                 <div className="text-lg font-bold mt-1">
//                   {selectedModel ? aiModels.find(m => m.value === selectedModel)?.label : "Not Selected"}
//                 </div>
//               </div>
//               <div className="text-center p-4 bg-gray-50 rounded-lg">
//                 <div className="font-medium text-sm text-gray-600">OpenAI Key</div>
//                 <div className="text-lg font-bold mt-1">
//                   {openaiKey ? "Configured" : "Not Set"}
//                 </div>
//               </div>
//               <div className="text-center p-4 bg-gray-50 rounded-lg">
//                 <div className="font-medium text-sm text-gray-600">Claude Key</div>
//                 <div className="text-lg font-bold mt-1">
//                   {claudeKey ? "Configured" : "Not Set"}
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </Layout>
//   );
// };

// export default AIConfig;



// @ts-nocheck
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Edit, 
  Trash2,
  Key,
  Bot,
  RefreshCw,
  Circle
} from "lucide-react";
// import {
//   fetchAllModelConfigs,
//   createModelConfig,
//   updateModelConfig,
//   setActiveModel,
//   deleteModelConfig,
//   fetchApiKeyConfigs,
//   verifyApiKey,
//   AIModelConfig,
//   AIApiKeyConfig,
//   CreateModelConfigPayload,
//   UpdateModelConfigPayload,
// } from "@/api/ai_config";

import {
  fetchAllModelConfigs,
  createModelConfig,
  updateModelConfig,
  setActiveModel,
  deleteModelConfig,
  fetchApiKeyConfigs,
  verifyApiKey,
  saveApiKey,
  AIModelConfig,
  AIApiKeyConfig,
  CreateModelConfigPayload,
  UpdateModelConfigPayload,
} from "@/api/ai_config";

const AISettings = () => {
  const { toast } = useToast();
  
  const [modelConfigs, setModelConfigs] = useState<AIModelConfig[]>([]);
  const [apiKeyConfigs, setApiKeyConfigs] = useState<AIApiKeyConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"models" | "apikeys">("models");
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModelConfig | null>(null);
  
  // Form states for create
  const [newModel, setNewModel] = useState<CreateModelConfigPayload>({
    model_provider: "anthropic",
    model_name: "",
    model_version: "",
    max_tokens: 4096,
    temperature: 0.7,
    description: "",
  });
  
  // Form states for edit
  const [editModel, setEditModel] = useState<UpdateModelConfigPayload>({});
  
  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);
  

  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
const [savingProvider, setSavingProvider] = useState<string | null>(null);

const handleSaveApiKey = async (provider: string) => {
  const key = keyInputs[provider]?.trim();
  if (!key) return;
  setSavingProvider(provider);
  try {
    await saveApiKey(provider, key);
    toast({ title: "Saved", description: `${provider} API key stored securely.` });
    setKeyInputs((prev) => ({ ...prev, [provider]: "" }));
    loadAllData();
  } catch (err: any) {
    toast({ title: "Error", description: err.message, variant: "destructive" });
  } finally {
    setSavingProvider(null);
  }
};

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [models, apiKeys] = await Promise.all([
        fetchAllModelConfigs(),
        fetchApiKeyConfigs(),
      ]);
      setModelConfigs(models);
      setApiKeyConfigs(apiKeys);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 900,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateModel = async () => {
    if (!newModel.model_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Model name is required",
        variant: "destructive",
        duration: 900,
      });
      return;
    }
    
    try {
      await createModelConfig(newModel);
      toast({
        title: "Success",
        description: "Model configuration created successfully",
        duration: 900,
      });
      setIsCreateDialogOpen(false);
      setNewModel({
        model_provider: "anthropic",
        model_name: "",
        model_version: "",
        max_tokens: 4096,
        temperature: 0.7,
        description: "",
      });
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 900,
      });
    }
  };
  
  const handleUpdateModel = async () => {
    if (!editingModel) return;
    
    try {
      await updateModelConfig(editingModel.id, editModel);
      toast({
        title: "Success",
        description: "Model configuration updated successfully",
        duration: 900,
      });
      setIsEditDialogOpen(false);
      setEditingModel(null);
      setEditModel({});
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 900,
      });
    }
  };
  
  const handleSetActive = async (modelId: number, modelName: string) => {
    try {
      await setActiveModel(modelId);
      toast({
        title: "Success",
        description: `"${modelName}" is now the active model`,
        duration: 900,
      });
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 900,
      });
    }
  };
  
  const handleDeleteModel = async (modelId: number, modelName: string) => {
    if (!confirm(`Are you sure you want to delete "${modelName}"?`)) return;
    
    try {
      await deleteModelConfig(modelId);
      toast({
        title: "Success",
        description: "Model configuration deleted successfully",
        duration: 900,
      });
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 900,
      });
    }
  };
  
  const handleVerifyApiKey = async (provider: string) => {
    try {
      const result = await verifyApiKey(provider);
      toast({
        title: "Success",
        description: result.message,
        duration: 900,
      });
      loadAllData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 900,
      });
    }
  };
  
  const openEditDialog = (model: AIModelConfig) => {
    setEditingModel(model);
    setEditModel({
      model_name: model.model_name,
      model_version: model.model_version || "",
      max_tokens: model.max_tokens,
      temperature: model.temperature,
      description: model.description || "",
    });
    setIsEditDialogOpen(true);
  };
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      configured: { color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle2 },
      active: { color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle2 },
      invalid: { color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
      missing: { color: "bg-red-100 text-red-800 border-red-300", icon: XCircle },
      pending: { color: "bg-gray-100 text-gray-800 border-gray-300", icon: AlertCircle },
    };
    
    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;
    
    return (
      <Badge className={`${variant.color} flex items-center gap-1 border`} variant="outline">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };
  
  const activeModel = modelConfigs.find(m => m.is_active);
  
  return (
    <Layout title="AI Model Settings">
      <div className="space-y-6">
        
        {/* Header with Active Model Info */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Configuration</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage AI models and API keys for your SAP FUE Optimizer
            </p>
          </div>
          
          {activeModel && (
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Currently Active</div>
              <div className="flex items-center gap-2 mt-1">
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                <span className="font-semibold capitalize">{activeModel.model_provider}</span>
                <span className="text-gray-400">/</span>
                <span className="font-mono text-sm">{activeModel.model_name}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 border-b">
          <button
            onClick={() => setActiveTab("models")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "models"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Bot className="inline h-4 w-4 mr-2" />
            AI Models
          </button>
          <button
            onClick={() => setActiveTab("apikeys")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "apikeys"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <Key className="inline h-4 w-4 mr-2" />
            API Keys
          </button>
        </div>
        
        {/* Models Tab */}
        {activeTab === "models" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Model Configurations</CardTitle>
                  <CardDescription>
                    Click "Set Active" to switch between configured models
                  </CardDescription>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={loadAllData} size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Model
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Create AI Model Configuration</DialogTitle>
                        <DialogDescription>
                          Add a new AI model configuration to your system
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label>Provider *</Label>
                          <Select
                            value={newModel.model_provider}
                            onValueChange={(val) => setNewModel({ ...newModel, model_provider: val })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                              <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                              <SelectItem value="ollama">Ollama</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Model Name *</Label>
                          <Input
                            value={newModel.model_name}
                            onChange={(e) => setNewModel({ ...newModel, model_name: e.target.value })}
                            placeholder="e.g. claude-sonnet-4-20250514"
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Model Version</Label>
                          <Input
                            value={newModel.model_version}
                            onChange={(e) => setNewModel({ ...newModel, model_version: e.target.value })}
                            placeholder="e.g. claude-sonnet-4-20250514"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Max Tokens</Label>
                            <Input
                              type="number"
                              value={newModel.max_tokens}
                              onChange={(e) => setNewModel({ ...newModel, max_tokens: parseInt(e.target.value) })}
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label>Temperature</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="2"
                              value={newModel.temperature}
                              onChange={(e) => setNewModel({ ...newModel, temperature: parseFloat(e.target.value) })}
                            />
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Description</Label>
                          <Textarea
                            value={newModel.description}
                            onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                            placeholder="Brief description of this model configuration"
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateModel}>Create Model</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-600">Loading models...</span>
                </div>
              ) : modelConfigs.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No AI models configured</p>
                  <p className="text-sm text-gray-500 mb-4">Add your first model to get started</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Model
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Status</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead className="text-right">Max Tokens</TableHead>
                        <TableHead className="text-right">Temperature</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modelConfigs.map((model) => (
                        <TableRow 
                          key={model.id}
                          className={model.is_active ? "bg-green-50" : "hover:bg-gray-50"}
                        >
                          <TableCell>
                            {model.is_active ? (
                              <Badge className="bg-green-100 text-green-800 border-green-300" variant="outline">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-600 border-gray-300">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium capitalize">{model.model_provider}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-mono text-sm font-medium">{model.model_name}</div>
                              {model.model_version && model.model_version !== model.model_name && (
                                <div className="text-xs text-gray-500 font-mono mt-0.5">{model.model_version}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">{model.max_tokens.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{model.temperature}</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm text-gray-600">
                              {model.description || "-"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              {!model.is_active && (
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleSetActive(model.id, model.model_name)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Set Active
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(model)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              {!model.is_active && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteModel(model.id, model.model_name)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* API Keys Tab */}
        {activeTab === "apikeys" && (
          <Card>
            <CardHeader>
              <CardTitle>API Key Status</CardTitle>
              <CardDescription>
                API keys are stored securely in your <code className="bg-gray-100 px-1 rounded">.env</code> file. 
                Verify that they are configured correctly.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeyConfigs.map((config) => (
  <div
    key={config.id}
    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
  >
    {/* existing top row, now wrapped */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Key className="h-8 w-8 text-gray-400" />
        <div>
          <div className="font-medium text-lg capitalize">{config.provider}</div>
          <div className="text-sm text-gray-500 mt-0.5">
            Environment Variable: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{config.env_var_name}</code>
          </div>
          {config.last_verified && (
            <div className="text-xs text-gray-400 mt-1">
              Last verified: {new Date(config.last_verified).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {getStatusBadge(config.status)}
        <Button size="sm" variant="outline" onClick={() => handleVerifyApiKey(config.provider)}>
          <RefreshCw className="h-3 w-3 mr-2" />
          Verify
        </Button>
      </div>
    </div>

    {/* new row */}
    <div className="flex gap-2 mt-3">
      <Input
        type="password"
        placeholder={`Paste ${config.provider} API key`}
        value={keyInputs[config.provider] || ""}
        onChange={(e) =>
          setKeyInputs((prev) => ({ ...prev, [config.provider]: e.target.value }))
        }
      />
      <Button
        size="sm"
        onClick={() => handleSaveApiKey(config.provider)}
        disabled={savingProvider === config.provider}
      >
        {savingProvider === config.provider ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Save"
        )}
      </Button>
    </div>
  </div>
))}
                  {/* {apiKeyConfigs.map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Key className="h-8 w-8 text-gray-400" />
                        <div>
                          <div className="font-medium text-lg capitalize">{config.provider}</div>
                          <div className="text-sm text-gray-500 mt-0.5">
                            Environment Variable: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{config.env_var_name}</code>
                          </div>
                          {config.last_verified && (
                            <div className="text-xs text-gray-400 mt-1">
                              Last verified: {new Date(config.last_verified).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {getStatusBadge(config.status)}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerifyApiKey(config.provider)}
                        >
                          <RefreshCw className="h-3 w-3 mr-2" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  ))} */}
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      How to configure API keys
                    </h4>
                    <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                      <li>Add your API key to the <code className="bg-blue-100 px-1 rounded">.env</code> file in your project root</li>
                      <li>Use the exact environment variable name shown above (e.g. <code className="bg-blue-100 px-1 rounded">ANTHROPIC_API_KEY</code>)</li>
                      <li>Restart your backend server to load the new environment variables</li>
                      <li>Click the "Verify" button to test that the API key works</li>
                    </ol>
                    
                    <div className="mt-4 p-3 bg-white border border-blue-200 rounded font-mono text-xs">
                      <div className="text-blue-700 mb-1"># Example .env file</div>
                      <div>ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx</div>
                      <div>OPENAI_API_KEY=sk-xxxxxxxxxxxxx</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Edit Model Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Model Configuration</DialogTitle>
              <DialogDescription>
                Update the configuration for <span className="font-mono">{editingModel?.model_name}</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Model Name</Label>
                <Input
                  value={editModel.model_name || ""}
                  onChange={(e) => setEditModel({ ...editModel, model_name: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Model Version</Label>
                <Input
                  value={editModel.model_version || ""}
                  onChange={(e) => setEditModel({ ...editModel, model_version: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={editModel.max_tokens || 4096}
                    onChange={(e) => setEditModel({ ...editModel, max_tokens: parseInt(e.target.value) })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Temperature</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={editModel.temperature || 0.7}
                    onChange={(e) => setEditModel({ ...editModel, temperature: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={editModel.description || ""}
                  onChange={(e) => setEditModel({ ...editModel, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateModel}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
      </div>
    </Layout>
  );
};

export default AISettings;