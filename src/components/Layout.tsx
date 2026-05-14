import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBackButton = true }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="page-container">
      {showBackButton && !isHomePage && (
        <Link to="/" className="back-button">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
        </Link>
      )}
      <h1 className="page-title">{title}</h1>
      {children}
    </div>
  );
};

export default Layout;
