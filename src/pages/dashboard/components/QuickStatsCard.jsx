import React from "react";

const QuickStatsCard = ({ title = "Stat", value = "0", change = "", changeType = "", icon = "", color = "", bgColor = "" }) => (
  <div className={`p-4 border rounded mb-2 ${bgColor}`}>
    <div className="flex items-center justify-between">
      <div>
        <h4 className={`text-sm font-semibold ${color}`}>{title}</h4>
        <p className="text-2xl font-bold">{value}</p>
        {change && <span className={`text-xs ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>{change}</span>}
      </div>
      {icon && <span className="text-3xl">{icon}</span>}
    </div>
  </div>
);

export default QuickStatsCard;
