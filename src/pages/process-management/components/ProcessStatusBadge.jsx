import React from "react";

// Simple placeholder for ProcessStatusBadge
const ProcessStatusBadge = ({ status }) => {
  return (
    <span className="px-2 py-1 rounded bg-gray-200 text-gray-800 text-xs font-semibold">
      {status || "Status"}
    </span>
  );
};

export default ProcessStatusBadge;
