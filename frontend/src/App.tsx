import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './components/Login';
import Chat from './components/Chat';
import { useStore } from './store';

function App() {
  const { user, setUser } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, [setUser]);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh" bg="gray.50">
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/chat" /> : <Login />}
            />
            <Route
              path="/chat"
              element={user ? <Chat /> : <Navigate to="/" />}
            />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App; 