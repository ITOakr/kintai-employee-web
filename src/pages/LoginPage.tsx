// src/pages/LoginPage.tsx
import { useState } from "react";
import { login } from "../lib/api";
import { Link } from "react-router-dom";
import {
  Box, Card, CardContent, CardActions,
  TextField, Button, Typography,
  Stack
} from "@mui/material";

type Props = {
  onLoginSuccess: (token: string) => void;
  initialError: string | null;
};

export default function LoginPage({ onLoginSuccess, initialError }: Props) {
  const [email, setEmail] = useState("employee1@example.com"); //employee1@example.com
  const [password, setPassword] = useState("employeepass"); //employeepass
  const [loginBusy, setLoginBusy] = useState(false);
  const [authErr, setAuthErr] = useState<string | null>(initialError);

  // ログイン処理
  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoginBusy(true);
      setAuthErr(null);
      const res = await login(email, password);
      onLoginSuccess(res.token);
    } catch (e: any) {
      setAuthErr(e?.message ?? "ログインに失敗しました");
    } finally {
      setLoginBusy(false);
    }
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: 'primary.main'
      }}
    >
      <Stack spacing={4} alignItems="center">
        <img src="/FLan_logo.png" alt="logo" style={{ width: '250px', maxWidth: '80%' }} />
        <Card sx={{
          width: 420,
          maxWidth: "100%",
          mt: 4
        }} component="form" onSubmit={doLogin}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
              従業員用ログイン
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="メール"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                fullWidth
                variant="outlined"
              />
              <TextField
                label="パスワード"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                fullWidth
                variant="outlined"
              />
            </Stack>
            {authErr && (
              <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                {authErr}
              </Typography>
            )}
          </CardContent>
          <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch', px: 4, pb: 4, gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loginBusy}
              fullWidth
              size="large"
              sx={{ py: 1.5 }}
            >
              {loginBusy ? "ログイン中…" : "ログイン"}
            </Button>
            <Button
              component={Link}
              to="/signup"
              fullWidth
            >
              新規ユーザー登録はこちら
            </Button>
          </CardActions>
        </Card>
      </Stack>
    </Box>
  );
}
