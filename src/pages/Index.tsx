
import React from "react";
import Layout from "@/components/Layout";
import FeatureCard from "@/components/FeatureCard";
import { 
  Upload, 
  Database, 
  TrendingUp, 
  Users, 
  Calculator, 
  Play, 
  FileText,
  Settings,
  Brain,
  HardDrive,
  Eye
} from "lucide-react";

const Index = () => {
  return (
    <Layout title="" showBackButton={false}>
      <div className="space-y-12">
        {/* Data Management Section */}
        <section>
          <h2 className="section-title">Data Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Upload File"
              description="Upload your SAP data files for analysis and optimization"
              icon={Upload}
              href="/upload-file"
            />
            <FeatureCard
              title="Manage Data"
              description="View, edit, and organize your uploaded data"
              icon={Database}
              href="/manage-data"
            />
            <FeatureCard
              title="Log Management"
              description="Monitor system logs and audit trails"
              icon={FileText}
              href="/log-management"
            />
            <FeatureCard
              title="View Logs"
              description="View detailed system logs and activities"
              icon={Eye}
              href="/view-logs"
            />
          </div>
        </section>

        {/* Optimization Section */}
        <section>
          <h2 className="section-title">License Optimization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="Role Level Optimization"
              description="Optimize licenses at the role level for maximum efficiency"
              icon={TrendingUp}
              href="/role-optimization"
            />
            <FeatureCard
              title="User Level Optimization"
              description="Analyze and optimize licenses for individual users"
              icon={Users}
              href="/user-optimization"
            />
            <FeatureCard
              title="FUE Calculation"
              description="Calculate Full Use Equivalent values for your licenses"
              icon={Calculator}
              href="/fue-calculation"
            />
          </div>
        </section>

        {/* Simulation Section */}
        <section>
          <h2 className="section-title">Simulation & Testing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              title="Simulation Run"
              description="Run simulations to test optimization scenarios"
              icon={Play}
              href="/simulation-run"
            />
            <FeatureCard
              title="Create New Simulation"
              description="Set up new simulation scenarios for testing"
              icon={Settings}
              href="/create-simulation"
            />
          </div>
        </section>

        {/* Configuration Section */}
        <section>
          <h2 className="section-title">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              title="AI Config"
              description="Configure AI models and API keys for optimization analysis"
              icon={Brain}
              href="/ai-config"
            />
            <FeatureCard
              title="DB Config"
              description="Set up database connections and configuration settings"
              icon={HardDrive}
              href="/db-config"
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
