import { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../api/authAPI';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const { user } = await authAPI.getMe(token);
          setUser(user);
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    };
    loadUser();
  }, [token]);

  const register = async (formData ) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(formData, navigate);
      if (response) {
        const { token, user } = response;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
      }
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const login = async (formData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(formData, navigate);
      if (response) {
        const { token, user } = response;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logout successful!');
    navigate('/auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);