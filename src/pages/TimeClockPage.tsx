import { useEffect, useState } from "react";
import { getMyDailyMe, postMyTimeEntry, nowTokyoISO, tokyoDateString } from "../lib/api";
import CurrentTimeDisplay from "../components/CurrentTimeDisplay";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Container
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Coffee as CoffeeIcon,
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";

type Daily = Awaited<ReturnType<typeof getMyDailyMe>>;

export default function TimeClockPage() {
  const [daily, setDaily] = useState<Daily | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>(() => tokyoDateString());

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyDailyMe(date);
      setDaily(res);
    } catch (e: any) {
      setError(e.message ?? "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [date]);

  async function clock(kind: "clock_in" | "clock_out" | "break_start" | "break_end") {
    try {
      setLoading(true);
      setError(null);
      const nowISO = nowTokyoISO();
      await postMyTimeEntry(kind, nowISO, "web");
      await refresh();
    } catch (e: any) {
      setError(e.message ?? "打刻に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "success";
      case "closed":
        return "default";
      case "not_started":
        return "warning";
      case "inconsistent_data":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "勤務中";
      case "closed":
        return "勤務終了";
      case "not_started":
        return "未出勤";
      case "inconsistent_data":
        return "データ不整合";
      default:
        return status;
    }
  };

  return (
    <Box sx={{
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      p: 2
    }}>
      <Container maxWidth="sm" >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            color: 'primary.main'
          }}>
            <AccessTimeIcon fontSize="large" />
            勤怠打刻
          </Typography>
          <Typography variant="body2" color="text.secondary">
            今日の日付: {new Date(date).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 現在時刻表示 */}
        <CurrentTimeDisplay />

        {/* 日付選択と更新 */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="対象日"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <Button
                variant="outlined"
                onClick={refresh}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
              >
                更新
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* 今日のサマリ */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              今日のサマリ
            </Typography>
            {loading && !daily ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress />
              </Box>
            ) : daily ? (
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">ステータス:</Typography>
                  <Chip
                    label={getStatusLabel(daily.status)}
                    color={getStatusColor(daily.status) as any}
                    size="small"
                  />
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">出勤時刻</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {daily.actual.start ? new Date(daily.actual.start).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : "-"}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">退勤時刻</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {daily.actual.end ? new Date(daily.actual.end).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : "-"}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">勤務時間</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {Math.floor(daily.totals.work / 60)}時間{daily.totals.work % 60}分
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">休憩時間</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {Math.floor(daily.totals.break / 60)}時間{daily.totals.break % 60}分
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            ) : null}
          </CardContent>
        </Card>

        {/* 打刻ボタン */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              打刻操作
            </Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => clock("clock_in")}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                sx={{
                  py: 2.5,
                  fontSize: '1.1rem',
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#45a049' },
                  '&:disabled': { backgroundColor: '#a5d6a7' }
                }}
              >
                出勤
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => clock("clock_out")}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LogoutIcon />}
                sx={{
                  py: 2.5,
                  fontSize: '1.1rem',
                  backgroundColor: '#f44336',
                  '&:hover': { backgroundColor: '#d32f2f' },
                  '&:disabled': { backgroundColor: '#ef9a9a' }
                }}
              >
                退勤
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => clock("break_start")}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CoffeeIcon />}
                sx={{
                  py: 2.5,
                  fontSize: '1.1rem',
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                休憩開始
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={() => clock("break_end")}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                sx={{
                  py: 2.5,
                  fontSize: '1.1rem',
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                休憩終了
              </Button>
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 2, textAlign: 'center' }}
            >
              ※ ボタンは現在時刻で打刻します
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
