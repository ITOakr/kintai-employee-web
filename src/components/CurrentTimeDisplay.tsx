import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';

export default function CurrentTimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
      <CardContent sx={{ textAlign: 'center', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
          <AccessTimeIcon />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            現在時刻
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ 
          fontWeight: 'bold',
          fontFamily: 'monospace',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {currentTime.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
          {currentTime.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </Typography>
      </CardContent>
    </Card>
  );
}
