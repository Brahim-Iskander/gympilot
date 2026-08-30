import { Avatar, Card, Typography } from '@mui/material';

export default function FeatureCard({ icon, title, description }) {
  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 3, md: 3.5 },
        height: '100%',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform .3s ease, border-color .3s ease, box-shadow .3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor: 'rgba(198,255,62,0.4)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        },
      }}
    >
      <Avatar
        variant="rounded"
        sx={{ width: 52, height: 52, borderRadius: 3, bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main', mb: 2.5 }}
      >
        {icon}
      </Avatar>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
        {description}
      </Typography>
    </Card>
  );
}
