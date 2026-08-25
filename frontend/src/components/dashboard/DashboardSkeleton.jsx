import React from 'react';

export const DashboardSkeleton = () => {
  return (
    <div data-testid="dashboard-skeleton" className="space-y-6 animate-pulse">

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded-md" />
          <div className="h-4 w-64 bg-slate-100 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-slate-200 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-32 bg-slate-200 rounded-md" />
              <div className="h-3.5 w-44 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="h-4 w-full bg-slate-100 rounded-md" />
            <div className="h-4 w-3/4 bg-slate-100 rounded-md" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 bg-slate-200 rounded-md" />
            <div className="h-5 w-8 bg-slate-200 rounded-full" />
          </div>
          <div className="space-y-3 pt-2">
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 bg-slate-200 rounded-md" />
            <div className="h-5 w-16 bg-slate-200 rounded-full" />
          </div>
          <div className="space-y-3 pt-2">
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 bg-slate-200 rounded-md" />
            <div className="h-4 w-20 bg-slate-100 rounded-md" />
          </div>
          <div className="space-y-2.5 pt-2">
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 bg-slate-200 rounded-md" />
            <div className="h-4 w-16 bg-slate-100 rounded-md" />
          </div>
          <div className="space-y-2.5 pt-2">
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
