import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAtom } from 'jotai';
import { plantsAtom } from "@/store/atoms/plantsAtom";
import { clientsAtom } from "@/store/atoms/clientsAtom";
import { regionsAtom } from "@/store/atoms/regionsAtom";
import { Tab } from '@headlessui/react';
import {
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  GlobeAmericasIcon,
  ArrowPathIcon,
  CodeBracketIcon,
  TableCellsIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { PhChart, TdsChart, PressureFlowChart } from './PlantCharts';

// Mock data for the table
const mockPlantData = [
  { timestamp: '2024-03-15 10:00:00', ph: 7.2, tds: 450, pressure: 65, flow: 12.5 },
  { timestamp: '2024-03-15 10:15:00', ph: 7.1, tds: 455, pressure: 64, flow: 12.3 },
  { timestamp: '2024-03-15 10:30:00', ph: 7.3, tds: 448, pressure: 66, flow: 12.6 },
  { timestamp: '2024-03-15 10:45:00', ph: 7.0, tds: 460, pressure: 63, flow: 12.4 },
  { timestamp: '2024-03-15 11:00:00', ph: 7.2, tds: 452, pressure: 65, flow: 12.5 },
];

const tabs = [
  { name: 'Overview', icon: BuildingStorefrontIcon },
  { name: 'Monitoring', icon: ChartBarIcon },
  { name: 'API & Data', icon: CodeBracketIcon },
];

export function Plant() {
  const { plantId } = useParams();
  const [plants] = useAtom(plantsAtom);
  const [clients] = useAtom(clientsAtom);
  const [regions] = useAtom(regionsAtom);
  const [loading, setLoading] = useState(true);
  const [plant, setPlant] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const findPlant = () => {
      const foundPlant = plants.find(p => p.id === plantId);
      setPlant(foundPlant);
      setLoading(false);
    };

    findPlant();
  }, [plantId, plants]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-900">Plant Not Found</h2>
        <p className="mt-2 text-gray-600">The plant you're looking for doesn't exist.</p>
      </div>
    );
  }

  const client = clients.find(c => c.id === plant.clientId);
  const region = regions.find(r => r.id === plant.regionId);

  const renderOverviewTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Plant Details */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Plant ID</label>
                <div className="mt-1 text-sm text-gray-900">{plant.id}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Name</label>
                <div className="mt-1 text-sm text-gray-900">{plant.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <div className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  {plant.email || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <div className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4 text-gray-400" />
                  {plant.phone || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connections */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Connections</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Client</label>
                <div className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                  {client?.name || 'N/A'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Region</label>
                <div className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                  <GlobeAmericasIcon className="h-4 w-4 text-gray-400" />
                  {region?.name || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {plant.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <div className="text-sm text-gray-600">{plant.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMonitoringTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <PhChart />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <TdsChart />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <PressureFlowChart />
      </div>
    </div>
  );

  const renderApiTab = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {/* API Documentation Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">API Endpoints</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Save Plant Data</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <code className="text-sm text-gray-600">
                  POST {`{server_url}/save_plant_data/${plantId}`}
                </code>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Example Request</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-600">
{`{
  "timestamp": "2024-03-15T10:00:00Z",
  "ph": 7.2,
  "tds": 450,
  "pressure": 65,
  "flow": 12.5
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TDS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pressure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flow</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockPlantData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.ph}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.tds}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.pressure}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.flow}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto mt-12 px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-gray-800 flex items-center gap-2">
          <BuildingStorefrontIcon className="h-8 w-8 text-blue-500" />
          {plant.name}
        </h2>
        <p className="text-gray-500 mt-1 ml-10">Plant Management Dashboard</p>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-8">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 
                transition-all duration-200 ease-in-out
                focus:outline-none flex items-center justify-center gap-2
                ${selected
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/[0.50]'
                }`
              }
            >
              {({ selected }) => (
                <>
                  {React.createElement(tab.icon, { 
                    className: `h-5 w-5 ${selected ? 'text-blue-600' : 'text-gray-400'}` 
                  })}
                  {tab.name}
                </>
              )}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>{renderOverviewTab()}</Tab.Panel>
          <Tab.Panel>{renderMonitoringTab()}</Tab.Panel>
          <Tab.Panel>{renderApiTab()}</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default Plant; 