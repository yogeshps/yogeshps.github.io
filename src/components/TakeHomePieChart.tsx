import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Box } from '@mui/material';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface TakeHomePieChartProps {
  takeHome: number;
  tax: number;
  cpf: number;
}

const TakeHomePieChart: React.FC<TakeHomePieChartProps> = ({ takeHome, tax, cpf }) => {
  // Filter out zero values and prepare data
  const breakdownData = [
    { label: 'Take Home', value: takeHome, color: '#00B301' },
    { label: 'Tax', value: tax, color: '#E7A90E' },
    { label: 'CPF', value: cpf, color: '#348FE8' }
  ].filter(item => item.value > 0);

  // Calculate dynamic height based on number of items
  const baseHeight = 210; // Base height for few items
  const heightPerItem = 20; // Additional height per item
  const dynamicHeight = baseHeight + (breakdownData.length > 4 ? (breakdownData.length - 4) * heightPerItem : 0);

  const data = {
    labels: breakdownData.map(item => item.label),
    datasets: [
      {
        data: breakdownData.map(item => item.value),
        backgroundColor: breakdownData.map(item => item.color),
        borderColor: 'white',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: window.innerWidth >= 600 ? 'right' as const : 'bottom' as const,
        align: 'center' as const,
        labels: {
          boxWidth: 15,
          padding: 15,
          color: 'rgb(51, 51, 51)',
          font: {
            size: 11,
          },
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: (chart: any) => {
            const datasets = chart.data.datasets;
            const labels = chart.data.labels;
            const total = datasets[0].data.reduce((a: number, b: number) => a + b, 0);
            
            return labels.map((label: string, i: number) => ({
              text: ` ${label}:\n${((datasets[0].data[i] / total) * 100).toFixed(1)}% `,
              fillStyle: datasets[0].backgroundColor[i],
              hidden: false,
              index: i,
              strokeStyle: 'transparent',
              borderWidth: 0
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return ` ${label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
    cutout: '55%',
    radius: '70%',
    layout: {
      padding: {
        right: window.innerWidth >= 600 ? 100 : 0  // Increased padding for desktop
      }
    }
  };

  return (
    <Box 
      sx={{ 
        height: { 
          xs: `${dynamicHeight + 90}px`, // More height on mobile
          sm: `${dynamicHeight}px`
        },
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
        mb: 2,
        '& canvas': {
          maxWidth: '100%'
        }
      }}
    >
      <Doughnut data={data} options={options} />
    </Box>
  );
};

export default TakeHomePieChart; 