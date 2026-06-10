import React from 'react';

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const skeletons = Array(count).fill(0);

  if (type === 'card') {
    return (
      <>
        {skeletons.map((_, i) => (
          <div key={i} className="bg-cardbg rounded-2xl border border-white/5 overflow-hidden animate-pulse">
            <div className="h-44 bg-white/5 w-full"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
              <div className="h-3 bg-white/5 rounded w-1/2"></div>
              <div className="flex space-x-2 pt-1">
                <div className="h-5 bg-white/5 rounded-full w-12"></div>
                <div className="h-5 bg-white/5 rounded-full w-12"></div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-5 bg-white/10 rounded w-1/4"></div>
                <div className="h-9 bg-white/10 rounded-xl w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {skeletons.map((_, i) => (
          <div key={i} className="flex space-x-4 p-4 rounded-2xl bg-cardbg border border-white/5 animate-pulse">
            <div className="w-12 h-12 bg-white/5 rounded-xl"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3.5 bg-white/10 rounded w-1/3"></div>
              <div className="h-3 bg-white/5 rounded w-1/4"></div>
            </div>
            <div className="w-20 h-8 bg-white/10 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="p-6 bg-cardbg rounded-2xl border border-white/5 h-64 flex flex-col justify-between animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/4"></div>
        <div className="flex items-end justify-between space-x-2 h-40">
          <div className="bg-white/5 w-full h-[60%] rounded-t-lg"></div>
          <div className="bg-white/5 w-full h-[40%] rounded-t-lg"></div>
          <div className="bg-white/5 w-full h-[85%] rounded-t-lg"></div>
          <div className="bg-white/5 w-full h-[50%] rounded-t-lg"></div>
          <div className="bg-white/5 w-full h-[70%] rounded-t-lg"></div>
        </div>
      </div>
    );
  }

  return null;
}
