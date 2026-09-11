import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import AllInclusiveRoundedIcon from '@mui/icons-material/AllInclusiveRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { getPackDurationStatus } from '../../utils/durationHelper';

export default function PackDurationBadge({ pack, size = 'small' }) {
  const status = getPackDurationStatus(pack);

  const renderIcon = () => {
    switch (status.statusType) {
      case 'EXPIRED':
        return <CancelRoundedIcon sx={{ fontSize: '15px !important' }} />;
      case 'LIFETIME':
        return <AllInclusiveRoundedIcon sx={{ fontSize: '15px !important' }} />;
      case 'URGENT':
        return <BoltRoundedIcon sx={{ fontSize: '15px !important' }} />;
      case 'ACTIVE':
      default:
        return <AccessTimeRoundedIcon sx={{ fontSize: '15px !important' }} />;
    }
  };

  return (
    <Tooltip title={status.tooltip} arrow>
      <Chip
        icon={renderIcon()}
        label={status.label}
        size={size}
        color={status.color}
        variant={status.isExpired ? 'filled' : status.isLifetime ? 'outlined' : 'filled'}
        sx={{
          fontWeight: 700,
          fontSize: size === 'small' ? '0.72rem' : '0.8rem',
          borderRadius: 2,
          letterSpacing: 0.2,
          boxShadow: status.isExpired ? '0 0 8px rgba(255, 77, 77, 0.4)' : 'none',
        }}
      />
    </Tooltip>
  );
}
