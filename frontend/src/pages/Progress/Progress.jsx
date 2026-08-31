import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  Alert,
} from '@mui/material';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import WeightProgress from './components/WeightProgress';
import MeasurementsProgress from './components/MeasurementsProgress';
import PhotosProgress from './components/PhotosProgress';
import StrengthProgress from './components/StrengthProgress';
import TimelineProgress from './components/TimelineProgress';
import AddEntryModal from './components/AddEntryModal';
import PhotoCompareModal from './components/PhotoCompareModal';
import { TabNavigation, LoadingSpinner } from '../../components/ui';
import { progressService } from '../../services/progressService';
import { getApiErrorMessage } from '../../utils/errors';
import SEO from '../../components/SEO';

const tabs = [
  { id: 'timeline', label: 'Timeline & Logs', icon: <HistoryRoundedIcon /> },
  { id: 'weight', label: 'Weight', icon: <MonitorWeightRoundedIcon /> },
  { id: 'measurements', label: 'Measurements', icon: <StraightenRoundedIcon /> },
  { id: 'photos', label: 'Photos', icon: <PhotoCameraRoundedIcon /> },
  { id: 'strength', label: 'Strength & PRs', icon: <FitnessCenterRoundedIcon /> },
];

export default function Progress() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'timeline';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const navigate = useNavigate();

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await progressService.getAll();
      setEntries(data || []);
    } catch (err) {
      console.error('Failed to load progress entries:', err);
      setError(getApiErrorMessage(err) || 'Failed to fetch progress entries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleTabChange = (e, val) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setAddModalOpen(true);
  };

  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setAddModalOpen(true);
  };

  const handleSaveEntry = async (payload, existingId) => {
    if (existingId) {
      await progressService.update(existingId, payload);
    } else {
      await progressService.create(payload);
    }
    await loadEntries();
  };

  const handleDeleteEntry = async (id) => {
    await progressService.delete(id);
    await loadEntries();
  };

  // Compute summary stats from real data
  const totalEntries = entries.length;
  const weightEntries = entries.filter((e) => e.weight != null && e.weight > 0);
  const latestWeight = weightEntries.length > 0 ? weightEntries[0].weight : null;
  const latestWeightUnit = weightEntries.length > 0 ? weightEntries[0].weightUnit || 'kg' : 'kg';

  let totalPhotos = 0;
  let totalPrs = 0;
  entries.forEach((e) => {
    if (e.photos) totalPhotos += e.photos.length;
    if (e.strengthLogs) {
      e.strengthLogs.forEach((l) => {
        if (l.isPR) totalPrs += 1;
      });
    }
  });

  return (
    <Box>
      <SEO
        title="Body & Strength Progress Tracking"
        description="Monitor weight trajectory, body circumference measurements, lift personal records, and progress photos on GymPilot."
        path="/progress"
        noIndex
      />
      {/* Page Header & Navigation to Analytics */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
            Progress & Body Tracking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Log body weights, circumferences, PR strength milestones, and progress photos with complete timeline history.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: 2.5, fontWeight: 800, px: 2.5, py: 1 }}
          >
            Log Progress Entry
          </Button>

          <Button
            variant="outlined"
            color="primary"
            startIcon={<InsightsRoundedIcon />}
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => navigate('/analytics')}
            sx={{ borderRadius: 2.5, fontWeight: 700, px: 2.5, py: 1 }}
          >
            AI Analytics
          </Button>
        </Stack>
      </Stack>

      {/* AI Smart Progress Alert Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, rgba(198,255,62,0.1) 0%, rgba(138,124,255,0.08) 100%)',
          border: '1px solid rgba(198, 255, 62, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ p: 1.25, borderRadius: 2.5, bgcolor: '#C6FF3E', color: '#0A0C0F', display: 'flex' }}>
            <AutoAwesomeRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                AI Trajectory Engine Ready
              </Typography>
              <Chip
                label={`${totalEntries} Entries Logged`}
                size="small"
                color="success"
                sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }}
              />
              {latestWeight && (
                <Chip
                  label={`Latest: ${latestWeight} ${latestWeightUnit}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.06)', fontWeight: 700, height: 20, fontSize: '0.65rem' }}
                />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Your logged weights, measurements, strength overload, and photos are automatically analyzed by Claude Opus in Deep Analytics.
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="contained"
          onClick={() => navigate('/analytics')}
          sx={{ bgcolor: '#C6FF3E', color: '#0A0C0F', fontWeight: 800, '&:hover': { bgcolor: '#b5ed32' } }}
        >
          View Deep AI Analytics
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        value={activeTab}
        onChange={handleTabChange}
        variant="pill"
        sx={{ mb: 4 }}
      />

      {/* Loading state or Tab Content */}
      {loading ? (
        <LoadingSpinner sx={{ py: 10 }} />
      ) : (
        <>
          {activeTab === 'timeline' && (
            <TimelineProgress
              entries={entries}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteEntry}
              onAddNew={handleOpenAdd}
              onPhotoClick={() => setCompareModalOpen(true)}
            />
          )}

          {activeTab === 'weight' && (
            <WeightProgress entries={entries} onAddNew={handleOpenAdd} />
          )}

          {activeTab === 'measurements' && (
            <MeasurementsProgress entries={entries} onAddNew={handleOpenAdd} />
          )}

          {activeTab === 'photos' && (
            <PhotosProgress
              entries={entries}
              onAddNew={handleOpenAdd}
              onOpenCompare={() => setCompareModalOpen(true)}
            />
          )}

          {activeTab === 'strength' && (
            <StrengthProgress entries={entries} onAddNew={handleOpenAdd} />
          )}
        </>
      )}

      {/* Unified Add/Edit Entry Modal */}
      <AddEntryModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveEntry}
        initialData={editingEntry}
      />

      {/* Side-by-Side Photo Comparison Modal */}
      <PhotoCompareModal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        entries={entries}
      />

      {/* Bottom CTA to Analytics */}
      <Paper
        elevation={0}
        sx={{
          mt: 6,
          p: 3.5,
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          textAlign: 'center',
          backgroundImage: 'radial-gradient(ellipse at top, rgba(138,124,255,0.06), transparent 70%)',
        }}
      >
        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>
          Ready for personalized AI progressive overload insights?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 540, mx: 'auto', mb: 2.5 }}>
          Our AI model analyzes your profile limitations, weight trajectory, body circumference changes, and PR overload velocity to deliver actionable coaching directives.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AutoAwesomeRoundedIcon />}
          onClick={() => navigate('/analytics')}
          sx={{ fontWeight: 800, borderRadius: 2.5, px: 3.5, py: 1 }}
        >
          Open AI Performance Analytics
        </Button>
      </Paper>
    </Box>
  );
}