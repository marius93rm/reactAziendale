/** WidgetContent trasforma lo snapshot in quattro viste presentazionali. */
import GroupsIcon from '@mui/icons-material/Groups';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type {
  DashboardWidget,
  OperationsSnapshot,
} from '../dashboard.types';

const healthLabels = {
  regolare: 'Regolare',
  attenzione: 'Attenzione',
  critica: 'Critica',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('it-IT').format(value);
}

export function WidgetContent({
  widget,
  snapshot,
}: {
  widget: DashboardWidget;
  snapshot: OperationsSnapshot;
}) {
  if (widget.kind === 'alerts') {
    return (
      <Stack spacing={1.5}>
        <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 700 }}>
          {snapshot.alerts.length}
        </Typography>
        <Typography color="text.secondary">segnalazioni da gestire</Typography>
        <List dense disablePadding aria-label="Ultime criticità">
          {snapshot.alerts.slice(0, 2).map((alert) => (
            <ListItem key={alert.id} disableGutters>
              <ListItemText
                primary={alert.title}
                secondary={alert.severity === 'alta' ? 'Priorità alta' : 'Priorità media'}
              />
            </ListItem>
          ))}
        </List>
      </Stack>
    );
  }

  if (widget.kind === 'sites') {
    return (
      <List disablePadding aria-label="Stato delle sedi">
        {snapshot.sites.map((site) => (
          <ListItem
            key={site.id}
            disableGutters
            secondaryAction={
              <Chip
                size="small"
                label={healthLabels[site.health]}
                color={
                  site.health === 'critica'
                    ? 'error'
                    : site.health === 'attenzione'
                      ? 'warning'
                      : 'default'
                }
              />
            }
          >
            <ListItemText primary={site.name} secondary={site.city} />
          </ListItem>
        ))}
      </List>
    );
  }

  if (widget.kind === 'energy') {
    const total = snapshot.sites.reduce((sum, site) => sum + site.energyKwh, 0);
    const max = Math.max(...snapshot.sites.map((site) => site.energyKwh), 1);
    return (
      <Stack spacing={2}>
        <Box>
          <Typography variant="h3" sx={{ fontSize: '2rem', fontWeight: 700 }}>
            {formatNumber(total)} kWh
          </Typography>
          <Typography color="text.secondary">totale delle sedi</Typography>
        </Box>
        {snapshot.sites.map((site) => (
          <Box key={site.id}>
            <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
              <Typography variant="body2">{site.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {formatNumber(site.energyKwh)} kWh
              </Typography>
            </Stack>
            <LinearProgress
              aria-label={`Consumo ${site.name}`}
              variant="determinate"
              value={(site.energyKwh / max) * 100}
              sx={{ mt: 0.75, height: 7, borderRadius: 1 }}
            />
          </Box>
        ))}
      </Stack>
    );
  }

  const average = Math.round(
    snapshot.sites.reduce((sum, site) => sum + site.occupancy, 0) /
      Math.max(snapshot.sites.length, 1),
  );
  return (
    <Stack spacing={2}>
      <GroupsIcon color="primary" sx={{ fontSize: 32 }} aria-hidden="true" />
      <Typography variant="h3" sx={{ fontSize: '2.5rem', fontWeight: 700 }}>
        {average}%
      </Typography>
      <Typography color="text.secondary">media sulle sedi attive</Typography>
      <LinearProgress
        aria-label="Occupazione media"
        variant="determinate"
        value={average}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Stack>
  );
}
