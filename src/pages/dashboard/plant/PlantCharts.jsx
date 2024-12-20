import React from 'react';
import Chart from "react-apexcharts";

// Mock data for time series
const generateTimeSeriesData = (count, baseValue, variance) => {
  const data = [];
  let currentDate = new Date();
  for (let i = 0; i < count; i++) {
    currentDate = new Date(currentDate.getTime() - 15 * 60000); // 15 minutes back
    data.unshift({
      x: currentDate.getTime(),
      y: (baseValue + (Math.random() - 0.5) * variance).toFixed(2)
    });
  }
  return data;
};

const mockData = {
  ph: generateTimeSeriesData(20, 7.2, 0.4),
  tds: generateTimeSeriesData(20, 450, 20),
  pressure: generateTimeSeriesData(20, 65, 5),
  flow: generateTimeSeriesData(20, 12.5, 1),
};

export const PhChart = () => {
  const options = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: ['#3B82F6'],
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
      }
    },
    yaxis: {
      title: { text: 'pH Level' },
      min: 6,
      max: 8,
    },
    title: {
      text: 'pH Levels Over Time',
      align: 'left',
      style: { fontSize: '16px', fontWeight: 500 }
    },
  };

  return (
    <Chart 
      options={options}
      series={[{ name: 'pH', data: mockData.ph }]}
      type="line"
      height={350}
    />
  );
};

export const TdsChart = () => {
  const options = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      }
    },
    colors: ['#10B981'],
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
      }
    },
    yaxis: {
      title: { text: 'TDS (ppm)' },
    },
    title: {
      text: 'TDS Readings',
      align: 'left',
      style: { fontSize: '16px', fontWeight: 500 }
    },
  };

  return (
    <Chart 
      options={options}
      series={[{ name: 'TDS', data: mockData.tds }]}
      type="area"
      height={350}
    />
  );
};

export const PressureFlowChart = () => {
  const options = {
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: [3, 3],
    },
    colors: ['#6366F1', '#F59E0B'],
    xaxis: {
      type: 'datetime',
      labels: {
        datetimeUTC: false,
      }
    },
    yaxis: [
      {
        title: { text: 'Pressure (PSI)' },
        min: 50,
        max: 80,
      },
      {
        opposite: true,
        title: { text: 'Flow Rate (GPM)' },
        min: 10,
        max: 15,
      }
    ],
    title: {
      text: 'Pressure & Flow Rate',
      align: 'left',
      style: { fontSize: '16px', fontWeight: 500 }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
    }
  };

  return (
    <Chart 
      options={options}
      series={[
        { name: 'Pressure', data: mockData.pressure },
        { name: 'Flow Rate', data: mockData.flow }
      ]}
      type="line"
      height={350}
    />
  );
}; 