import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SingaporeTaxCalculator from './components/SingaporeTaxCalculator';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: '20px', backgroundColor: '#121212', minHeight: '100vh' }}>
        <SingaporeTaxCalculator />
      </div>
    </ThemeProvider>
  );
}

export default App;
