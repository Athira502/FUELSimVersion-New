
import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Save, TestTube } from "lucide-react";

const DBConfig = () => {
  const { toast } = useToast();
  const [dbType, setDbType] = useState("");
  const [dbName, setDbName] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const databaseTypes = [
    { value: "postgresql", label: "PostgreSQL" },
    { value: "mysql", label: "MySQL" },
    { value: "mssql", label: "Microsoft SQL Server" },
    { value: "oracle", label: "Oracle Database" },
    { value: "mongodb", label: "MongoDB" }
  ];

  const handleSave = () => {
    // In a real application, this would save to backend/database
    localStorage.setItem('db-config', JSON.stringify({
      dbType,
      dbName,
      host,
      port,
      username,
      password,
      updatedAt: new Date().toISOString()
    }));

    toast({
      title: "Configuration Saved",
      description: "Database configuration has been saved successfully.",
    });
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsTestingConnection(false);
    
    // Mock success/failure
    const isSuccess = Math.random() > 0.3;
    
    toast({
      title: isSuccess ? "Connection Successful" : "Connection Failed",
      description: isSuccess 
        ? "Successfully connected to the database." 
        : "Unable to connect to the database. Please check your configuration.",
      variant: isSuccess ? "default" : "destructive"
    });
  };

  const handleClear = () => {
    setDbType("");
    setDbName("");
    setHost("");
    setPort("");
    setUsername("");
    setPassword("");
    localStorage.removeItem('db-config');
    
    toast({
      title: "Configuration Cleared",
      description: "All database configuration has been cleared.",
    });
  };

  // Load saved config on component mount
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('db-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setDbType(config.dbType || "");
      setDbName(config.dbName || "");
      setHost(config.host || "");
      setPort(config.port || "");
      setUsername(config.username || "");
      setPassword(config.password || "");
    }
  }, []);

  return (
    <Layout title="Database Configuration">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Database Type */}
            <div className="space-y-2">
              <Label htmlFor="db-type">Database Type</Label>
              <Select value={dbType} onValueChange={setDbType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  {databaseTypes.map((db) => (
                    <SelectItem key={db.value} value={db.value}>
                      {db.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Database Name */}
              <div className="space-y-2">
                <Label htmlFor="db-name">Database Name</Label>
                <Input
                  id="db-name"
                  placeholder="Enter database name"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                />
              </div>

              {/* Host */}
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  placeholder="localhost or IP address"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                />
              </div>

              {/* Port */}
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder="Database port"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Database username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Database password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleClear}>
                Clear All
              </Button>
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={isTestingConnection || !dbType || !host}
              >
                <TestTube className="mr-2 h-4 w-4" />
                {isTestingConnection ? "Testing..." : "Test Connection"}
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm text-gray-600">Database Type</div>
                <div className="text-lg font-bold mt-1">
                  {dbType ? databaseTypes.find(db => db.value === dbType)?.label : "Not Selected"}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm text-gray-600">Database</div>
                <div className="text-lg font-bold mt-1">
                  {dbName || "Not Set"}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm text-gray-600">Host</div>
                <div className="text-lg font-bold mt-1">
                  {host || "Not Set"}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm text-gray-600">Port</div>
                <div className="text-lg font-bold mt-1">
                  {port || "Not Set"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DBConfig;
