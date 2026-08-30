import { useState, useMemo } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Popover,
  Stack,
  Typography,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { SectionHeader, Card } from '../../components/ui';
import { useAiPlan } from '../../hooks/useAiPlan';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const eventTypes = {
  workout: { color: '#C6FF3E', bg: 'rgba(198,255,62,0.15)', label: 'Workout' },
  rest: { color: '#8A7CFF', bg: 'rgba(138,124,255,0.15)', label: 'Rest Day' },
  measurement: { color: '#FF9800', bg: 'rgba(255,152,0,0.15)', label: 'Measurement' },
  photo: { color: '#2196F3', bg: 'rgba(33,150,243,0.15)', label: 'Progress Photo' },
  goal: { color: '#FF6B6B', bg: 'rgba(255,107,107,0.15)', label: 'Goal Deadline' },
  meal: { color: '#4CAF50', bg: 'rgba(76,175,80,0.15)', label: 'Meal Planning' },
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function Calendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const { aiPlan, loading } = useAiPlan();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const eventsByDate = useMemo(() => {
    const map = {};
    if (loading || !aiPlan) return map; // Don't generate static fallback while loading!
    
    const dayNameToIndex = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
    };
    
    const preferredDays = (aiPlan?.preferredDays?.length ? aiPlan.preferredDays : ['monday', 'wednesday', 'friday'])
      .map(d => dayNameToIndex[d.toLowerCase()]);
      
    const workoutPlan = aiPlan?.workoutPlan || [];
    if (workoutPlan.length === 0) return map;
    let workoutIndex = 0;

    // Generate events for the entire current year and month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateKey = formatDateKey(currentYear, currentMonth, day);
      const dayOfWeek = date.getDay();

      map[dateKey] = [];

      if (preferredDays.includes(dayOfWeek)) {
        const workout = workoutPlan[workoutIndex % workoutPlan.length];
        map[dateKey].push({ type: 'workout', title: workout.dayName || `Workout Day ${workoutIndex + 1}` });
        workoutIndex++;
      } else {
        if (dayOfWeek === 0) {
          map[dateKey].push({ type: 'meal', title: 'Meal Prep Sunday' });
        } else {
          map[dateKey].push({ type: 'rest', title: 'Rest Day' });
        }
      }
      
      if (day === 1) {
        map[dateKey].push({ type: 'measurement', title: 'Monthly Measurements' });
      }
    }

    return map;
  }, [aiPlan, loading, currentYear, currentMonth, daysInMonth]);

  const handlePrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const handleDayClick = (day, e) => {
    const key = formatDateKey(currentYear, currentMonth, day);
    setSelectedDate(key);
    setAnchorEl(e.currentTarget);
  };

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  return (
    <Box>
      <SectionHeader
        title="Calendar"
        subtitle={aiPlan ? "Your dynamic AI-generated schedule" : "Track your workouts, measurements, and goals"}
      />

      <Card sx={{ p: 0, overflow: 'hidden' }}>
        {/* Calendar Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handlePrev} size="small" sx={{ color: 'text.secondary' }}>
              <ChevronLeftRoundedIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 700, minWidth: 180, textAlign: 'center' }}>
              {MONTHS[currentMonth]} {currentYear}
            </Typography>
            <IconButton onClick={handleNext} size="small" sx={{ color: 'text.secondary' }}>
              <ChevronRightRoundedIcon />
            </IconButton>
          </Stack>
          <Chip
            label="Today"
            size="small"
            onClick={handleToday}
            sx={{
              fontWeight: 600,
              cursor: 'pointer',
              bgcolor: 'rgba(198,255,62,0.12)',
              color: 'primary.main',
              '&:hover': { bgcolor: 'rgba(198,255,62,0.2)' },
            }}
          />
        </Stack>

        {/* Day Headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {DAYS.map((day) => (
            <Box
              key={day}
              sx={{
                p: 1.5,
                textAlign: 'center',
                borderRight: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderRight: 'none' },
              }}
            >
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar Grid or Loading Skeleton */}
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">Loading your personalized schedule...</Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
            }}
          >
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <Box key={`empty-${idx}`} sx={{ minHeight: 90, borderRight: '1px solid', borderBottom: '1px solid', borderColor: 'divider', '&:nth-child(7n)': { borderRight: 'none' } }} />;
              }

              const dateKey = formatDateKey(currentYear, currentMonth, day);
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;
              const events = eventsByDate[dateKey] || [];

              return (
                <Box
                  key={day}
                  onClick={(e) => handleDayClick(day, e)}
                  sx={{
                    minHeight: 90,
                    p: 1,
                    borderRight: '1px solid',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:nth-child(7n)': { borderRight: 'none' },
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'rgba(198,255,62,0.06)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isToday ? 800 : 400,
                      color: isToday ? 'primary.main' : 'text.primary',
                      mb: 0.5,
                      ...(isToday && {
                        bgcolor: 'rgba(198,255,62,0.15)',
                        borderRadius: 1.5,
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }),
                    }}
                  >
                    {day}
                  </Typography>
                  <Stack spacing={0.3}>
                    {events.slice(0, 2).map((ev, i) => (
                      <Box
                        key={i}
                        sx={{
                          bgcolor: eventTypes[ev.type]?.bg || 'rgba(255,255,255,0.06)',
                          borderRadius: 0.5,
                          px: 0.5,
                          py: 0.15,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.3,
                        }}
                      >
                        <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: eventTypes[ev.type]?.color || '#fff', flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', lineHeight: 1.2, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ev.title}
                        </Typography>
                      </Box>
                    ))}
                    {events.length > 2 && (
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', pl: 0.5 }}>
                        +{events.length - 2} more
                      </Typography>
                    )}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        )}
      </Card>

      {/* Event Detail Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => { setAnchorEl(null); setSelectedDate(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
            minWidth: 240,
            maxWidth: 320,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {selectedDate && (
            <>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, fontFamily: "'Sora','Inter',sans-serif" }}>
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </Typography>
              {selectedEvents.length === 0 ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <EventRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">No events</Typography>
                </Stack>
              ) : (
                <Stack spacing={1}>
                  {selectedEvents.map((ev, i) => (
                    <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: eventTypes[ev.type]?.color }} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{ev.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{eventTypes[ev.type]?.label}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}
            </>
          )}
        </Box>
      </Popover>

      {/* Legend */}
      <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ mt: 3 }}>
        {Object.entries(eventTypes).map(([key, val]) => (
          <Stack key={key} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: val.color }} />
            <Typography variant="caption" color="text.secondary">{val.label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
