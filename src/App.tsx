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
      <div style={{ 
        backgroundColor: '#FAF9F6', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        width: '100%', // Ensure the background covers the entire width
        position: 'absolute', // Positioning to cover the entire viewport
        top: 0,
        left: 0,
      }}>
        <SingaporeTaxCalculator />
      </div>
    </ThemeProvider>
  );
}

export default App;
