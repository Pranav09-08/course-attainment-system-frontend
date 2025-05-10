import React from "react";
import { useSidebarWidth } from "../hooks/useSidebarWidth";
import "../styles/LoaderPage.css";

const LoaderPage = ({ loading }) => {
  const sidebarWidth = useSidebarWidth();

  if (!loading) return null;

  return (
    <div className="loader-container" style={{ left: `${sidebarWidth}px` }}>
      <div className="loading-wave">
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
        <div className="loading-bar"></div>
      </div>
    </div>
  );
};

export default LoaderPage;