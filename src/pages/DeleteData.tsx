
import React from "react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const DeleteData = () => {
  const navigate = useNavigate();
  
  return (
    <Layout title="Delete Data">
      <div className="space-y-6 bg-white shadow-md rounded-lg p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-medium mb-4 text-gray-700">
            Delete Data Management
          </h2>
          <p className="text-gray-600 mb-6">
            For data deletion functionality, please use the Manage Data section,
            which provides comprehensive tools for downloading and deleting data
            based on client and system selection.
          </p>
          <Button 
            onClick={() => navigate("/manage-data")}
            className="bg-belize-500 hover:bg-belize-600"
          >
            Go to Manage Data <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default DeleteData;
