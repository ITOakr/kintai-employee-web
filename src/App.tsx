import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ThemeWrapper from "./components/ThemeWrapper";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import TimeClockPage from "./pages/TimeClockPage";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [authErr, setAuthErr] = useState<string | null>(null);

  function handleLoginSuccess(newToken: string) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setAuthErr(null);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <ThemeWrapper>
      <BrowserRouter>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh'
        }}>
          {/* ログイン済み時のヘッダー */}
          {token && (
            <AppBar position="static" elevation={1}>
              <Toolbar>
                <AccessTimeIcon sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                  打刻システム
                </Typography>
                <Button
                  color="inherit"
                  onClick={logout}
                  startIcon={<LogoutIcon />}
                >
                  ログアウト
                </Button>
              </Toolbar>
            </AppBar>
          )}

          <Box component="main" sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column'
          }}>
            <Routes>

              <Route path="/signup" element={<SignupPage />} />
              {/* ログインページ */}
              <Route path="/login" element={
                token ? <Navigate to="/" replace /> : 
                <LoginPage onLoginSuccess={handleLoginSuccess} initialError={authErr} />
              } />
              
              {/* 打刻ページ */}
              <Route path="/" element={
                token ? <TimeClockPage /> : <Navigate to="/login" replace />
              } />

              {/* 未ログイン時は/loginへ、ログイン済みで見つからないページは/へ */}
              <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeWrapper>
  );
}
