import React, { useEffect, useState } from "react";
import loaderGif from "../assets/loader.gif"; // Ensure this path is correct

const LoaderPage = ({ loading }) => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (loading) {
      setShowLoader(true); // Show loader when `loading` is true
    } else {
      // Ensure at least 2 seconds of loader display
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 3000); // 2 seconds

      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (!showLoader) return null; // Hide loader when done

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        position: "fixed",
        width: "100%",
        height: "100%",
        zIndex: 9999,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <div className="text-center">
        <img
          src={loaderGif}
          alt="Loading..."
          style={{ width: "150px", height: "150px" }}
        />
        <p className="mt-3 fw-bold" style={{ fontSize: "18px" }}>
          Please wait, loading...
        </p>
      </div>
    </div>
  );
};

export default LoaderPage;