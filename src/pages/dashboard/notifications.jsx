import React from "react";
import { useAtom } from 'jotai';
import { plantsAtom } from '../../store/atoms/plantsAtom';

// Add new atom for settings
import { atom } from 'jotai';

export const settingsAtom = atom({
  ph: { min: 6.0, max: 7.5 },
  tds: { min: 400, max: 500 },
  flow: { min: 10, max: 15 }
});

export function Notifications() {
  const [plants] = useAtom(plantsAtom);
  const [settings, setSettings] = useAtom(settingsAtom);

  // Enhanced mock readings with timestamps
  const mockReadings = {
    plant1: { 
      timestamp: new Date().toISOString(),
      ph: 5.8, 
      tds: 520,
      flow: 16
    },
    plant2: { 
      timestamp: new Date().toISOString(),
      ph: 7.8, 
      tds: 380,
      flow: 9
    },
  };

  const handleSettingChange = (type, boundary, value) => {
    setSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], [boundary]: Number(value) }
    }));
  };

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Alert Settings</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">pH Range</h2>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm">Min</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.ph.min}
                  onChange={(e) => handleSettingChange('ph', 'min', e.target.value)}
                  className="border rounded p-1"
                />
              </div>
              <div>
                <label className="block text-sm">Max</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.ph.max}
                  onChange={(e) => handleSettingChange('ph', 'max', e.target.value)}
                  className="border rounded p-1"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">TDS Range (ppm)</h2>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm">Min</label>
                <input
                  type="number"
                  value={settings.tds.min}
                  onChange={(e) => handleSettingChange('tds', 'min', e.target.value)}
                  className="border rounded p-1"
                />
              </div>
              <div>
                <label className="block text-sm">Max</label>
                <input
                  type="number"
                  value={settings.tds.max}
                  onChange={(e) => handleSettingChange('tds', 'max', e.target.value)}
                  className="border rounded p-1"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">Flow Rate Range (GPM)</h2>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm">Min</label>
                <input
                  type="number"
                  value={settings.flow.min}
                  onChange={(e) => handleSettingChange('flow', 'min', e.target.value)}
                  className="border rounded p-1"
                />
              </div>
              <div>
                <label className="block text-sm">Max</label>
                <input
                  type="number"
                  value={settings.flow.max}
                  onChange={(e) => handleSettingChange('flow', 'max', e.target.value)}
                  className="border rounded p-1"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-4">Current Alerts</h1>
        <div className="space-y-4">
          {Object.entries(mockReadings).map(([plantId, readings]) => {
            const alerts = [];
            
            // Add timestamp to display
            const timestamp = new Date(readings.timestamp).toLocaleString();
            
            if (readings.ph < settings.ph.min) {
              alerts.push(`pH too low: ${readings.ph}`);
            } else if (readings.ph > settings.ph.max) {
              alerts.push(`pH too high: ${readings.ph}`);
            }
            
            if (readings.tds < settings.tds.min) {
              alerts.push(`TDS too low: ${readings.tds} ppm`);
            } else if (readings.tds > settings.tds.max) {
              alerts.push(`TDS too high: ${readings.tds} ppm`);
            }

            if (readings.flow < settings.flow.min) {
              alerts.push(`Flow rate too low: ${readings.flow} GPM`);
            } else if (readings.flow > settings.flow.max) {
              alerts.push(`Flow rate too high: ${readings.flow} GPM`);
            }

            if (alerts.length === 0) return null;

            return (
              <div key={plantId} className="p-4 bg-red-50 border border-red-200 rounded">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">Plant {plantId}</h3>
                  <span className="text-sm text-gray-500">{timestamp}</span>
                </div>
                <ul className="list-disc list-inside">
                  {alerts.map((alert, i) => (
                    <li key={i} className="text-red-600">{alert}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
