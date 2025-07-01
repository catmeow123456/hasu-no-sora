import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // 检查认证状态
  const checkAuthStatus = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      const { authenticated } = await apiService.checkAuthStatus();
      setAuthState({
        isAuthenticated: authenticated,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: null, // 不显示检查状态的错误
      });
    }
  }, []);

  // 登录
  const login = useCallback(async (password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await apiService.login(password);
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error; // 重新抛出错误以便组件处理
    }
  }, []);

  // 登出
  const logout = useCallback(async () => {
    try {
      await apiService.logout();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      // 即使登出失败，也清除本地状态
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    login,
    logout,
    clearError,
    checkAuthStatus,
  };
};
