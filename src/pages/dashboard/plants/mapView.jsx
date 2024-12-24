import React from 'react';

export function MapView() {
  return (
    <>
      <div className="mt-12">
        <div className="mb-12 grid gap-y-10 gap-x-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Plants Map View</h1>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-semibold">Map View</h1>
        <p className="text-gray-600 mt-2">This is the Map View page.</p>
      </div>
    </>
  );
}

export default MapView;
