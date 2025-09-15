import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../lib/api";
import {
  Box, Card, CardContent, CardActions,
  TextField, Button, Typography, Stack, Alert
} from "@mui/material";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  async function doSignup(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await signup(name, email, password);
      setSuccess(res.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (e: any) {
      setError(e?.message ?? "登録に失敗しました");
    } finally {
      setLoading(false);
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
      }}
    >
      <Card sx={{ 
        width: 420, 
        maxWidth: "100%",
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }} component="form" onSubmit={doSignup}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
            新規ユーザー登録
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Stack spacing={3}>
            <TextField
              label="名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              variant="outlined"
              required
            />
            <TextField
              label="メールアドレス"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
              required
            />
            <TextField
              label="パスワード"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
              required
            />
          </Stack>
        </CardContent>
        <CardActions sx={{ flexDirection: 'column', alignItems: 'center', px: 4, pb: 4, gap: 2 }}>
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading || !!success} 
            fullWidth
            size="large"
            sx={{ py: 1.5 }}
          >
            {loading ? "登録中..." : "登録申請する"}
          </Button>
          <Button 
            component={Link} 
            to="/login" 
            fullWidth
          >
            ログイン画面へ戻る
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}