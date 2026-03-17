import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import AnimatedRoutes from './components/AnimatedRoutes';
import AITutor from './components/AITutor';
import SecurityWrapper from './components/SecurityWrapper';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <Router>
            <SecurityWrapper>
              <Layout>
                <AnimatedRoutes />
                <AITutor />
              </Layout>
            </SecurityWrapper>
          </Router>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
