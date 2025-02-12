import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Box } from '@mui/material';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface IncomeSourcesPieChartProps {
  salary: number;
  bonus: number;
  rsus: number;
  esops: number;
  pension: number;
  businessIncome: number;
  rentIncome: number;
  royalties: number;
}

const IncomeSourcesPieChart: React.FC<IncomeSourcesPieChartProps> = ({
  salary,
  bonus,
  rsus,
  esops,
  pension,
  businessIncome,
  rentIncome,
  royalties,
}) => {
  // Filter out zero values and prepare data
  const incomeData = [
    { label: 'Salary', value: salary, color: '#219121' },         // Emerald green
    { label: 'Bonus', value: bonus, color: '#001F3F' },          // Navy blue
    { label: 'RSUs', value: rsus, color: '#9B59B6' },            // Amethyst purple
    { label: 'ESOPs', value: esops, color: '#E67E22' },          // Carrot orange
    { label: 'Pension', value: pension, color: '#00BFFF' },      // Cyan
    { label: 'Business Income', value: businessIncome, color: '#8B4513' }, // Saddle brown
    { label: 'Rent Income', value: rentIncome, color: '#E74C3C' },        // Alizarin red
    { label: 'Royalties/Estate/Trust', value: royalties, color: '#F1C40F' } // Sunflower yellow
  ].filter(item => item.value > 0);

  const data = {
    labels: incomeData.map(item => item.label),
    datasets: [
      {
        data: incomeData.map(item => item.value),
        backgroundColor: incomeData.map(item => item.color),
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
            return `${label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
    cutout: '55%',
    radius: '70%',
    layout: {
      padding: {
        right: window.innerWidth >= 600 ? 100 : 0
      }
    }
  };

  // Calculate dynamic height based on number of items
  const baseHeight = 210; // Base height for few items
  const heightPerItem = 20; // Additional height per item
  const dynamicHeight = baseHeight + (incomeData.length > 4 ? (incomeData.length - 4) * heightPerItem : 0);

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

export default IncomeSourcesPieChart; 