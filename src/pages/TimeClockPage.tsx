import { useEffect, useState } from "react";
import { getMyDailyMe, postMyTimeEntry, nowTokyoISO, tokyoDateString, me } from "../lib/api";
import CurrentTimeDisplay from "../components/CurrentTimeDisplay";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Coffee as CoffeeIcon,
  PlayArrow as PlayArrowIcon,
} from "@mui/icons-material";

type Daily = Awaited<ReturnType<typeof getMyDailyMe>>;

export default function TimeClockPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [daily, setDaily] = useState<Daily | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      const [dailyRes, userRes] = await Promise.all([
        getMyDailyMe(tokyoDateString()),
        me()
      ]);
      setUserName(userRes.name);
      setDaily(dailyRes);
    } catch (e: any) {
      setError(e.message ?? "データの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function clock(kind: "clock_in" | "clock_out" | "break_start" | "break_end") {
    if (kind === "clock_out") {
      setOpenDialog(true);
      return;
    }
    await executeClock(kind);
  }
  
  async function executeClock(kind: "clock_in" | "clock_out" | "break_start" | "break_end") {
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

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmClockOut = async () => {
    setOpenDialog(false);
    await executeClock("clock_out");
  };

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
      case "on_break":
        return "休憩中";
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
            {userName ? `${userName} さん、ようこそ` : 'ようこそ'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 現在時刻表示 */}
        <CurrentTimeDisplay />

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
                disabled={loading || daily?.status !== "not_started"}
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
                disabled={loading || daily?.status !== "open" }
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
                disabled={loading || daily?.status !== "open"}
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
                disabled={loading || daily?.status !== "on_break"}
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
            </Typography>
          </CardContent>
        </Card>
        <Dialog
          open={openDialog}
          onClose={handleDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"退勤の確認"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              本当に退勤しますか？
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>キャンセル</Button>
            <Button onClick={handleConfirmClockOut} autoFocus>
              はい
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
