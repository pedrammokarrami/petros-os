import React, { useState } from 'react';
export default function Dashboard() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Active Users: 12,480</div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Conversion: 4.8%</div>
        <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">Revenue: $84,200</div>
      </div>
    </div>
  );
}