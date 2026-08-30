import { useState } from 'react';
import { Box, Card, Chip, Grid, Stack, Typography, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

const StyledCard = styled(Card)(({ }) => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const history = [
  { id: '1', date: '2026-01-15', name: 'Push Day', focus: 'Chest • Shoulders • Triceps', duration: 58, exercises: 6, volume: 12450, completed: true },
  { id: '2', date: '2026-01-14', name: 'Pull Day', focus: 'Back • Biceps', duration: 62, exercises: 7, volume: 14200, completed: true },
  { id: '3', date: '2026-01-13', name: 'Leg Day', focus: 'Legs', duration: 65, exercises: 5, volume: 18750, completed: true },
  { id: '4', date: '2026-01-11', name: 'Upper Body', focus: 'Chest • Back', duration: 55, exercises: 8, volume: 15600, completed: true },
  { id: '5', date: '2026-01-10', name: 'Push Day', focus: 'Chest • Shoulders • Triceps', duration: 52, exercises: 6, volume: 11800, completed: true },
  { id: '6', date: '2026-01-08', name: 'Pull Day', focus: 'Back • Biceps', duration: 58, exercises: 7, volume: 13400, completed: true },
  { id: '7', date: '2026-01-07', name: 'Leg Day', focus: 'Legs', duration: 68, exercises: 5, volume: 19200, completed: true },
  { id: '8', date: '2026-01-05', name: 'Full Body', focus: 'Full Body', duration: 45, exercises: 9, volume: 16800, completed: true },
  { id: '9', date: '2026-01-03', name: 'Push Day', focus: 'Chest • Shoulders • Triceps', duration: 55, exercises: 6, volume: 12100, completed: true },
  { id: '10', date: '2026-01-01', name: 'Pull Day', focus: 'Back • Biceps', duration: 60, exercises: 7, volume: 13800, completed: true },
];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function WorkoutHistory() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box>
      <StyledCard sx={{ p: 0, overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.5 } }}>
                <TableCell>Workout</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Duration</TableCell>
                <TableCell align="center">Exercises</TableCell>
                <TableCell align="center">Volume</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((workout) => (
                <TableRow key={workout.id} hover sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          bgcolor: 'rgba(198,255,62,0.12)',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FitnessCenterRoundedIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{workout.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{workout.focus}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{formatDate(workout.date)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      <AccessTimeRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{workout.duration} min</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      <FitnessCenterRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{workout.exercises}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                      <TrendingUpRoundedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{workout.volume.toLocaleString()} kg</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={workout.completed ? 'Completed' : 'Incomplete'}
                      icon={workout.completed ? <FitnessCenterRoundedIcon fontSize="small" /> : null}
                      sx={{
                        bgcolor: workout.completed ? 'rgba(198,255,62,0.15)' : 'rgba(255,107,107,0.15)',
                        color: workout.completed ? '#C6FF3E' : '#FF6B6B',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={history.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ px: 3, pb: 2 }}
        />
      </StyledCard>
    </Box>
  );
}