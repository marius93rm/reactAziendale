/** La card riceve dati e callback. Non conosce Context, reducer o API. */
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { DashboardWidget, OperationsSnapshot } from '../dashboard.types';
import { WidgetContent } from './WidgetContent';

const kindLabels = {
  alerts: 'Criticità',
  sites: 'Stato sedi',
  energy: 'Consumi',
  occupancy: 'Occupazione',
};

type WidgetCardProps = {
  widget: DashboardWidget;
  snapshot: OperationsSnapshot;
  pending: boolean;
  canMoveBefore: boolean;
  canMoveAfter: boolean;
  onMove: (direction: -1 | 1) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function WidgetCard({
  widget,
  snapshot,
  pending,
  canMoveBefore,
  canMoveAfter,
  onMove,
  onEdit,
  onDelete,
}: WidgetCardProps) {
  return (
    <Card
      component="article"
      variant="outlined"
      aria-busy={pending}
      sx={{
        gridColumn: { lg: widget.size === 'wide' ? 'span 2' : 'span 1' },
        minWidth: 0,
        position: 'relative',
      }}
    >
      {pending ? <LinearProgress aria-label={`Salvataggio ${widget.title}`} /> : null}
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: 'flex-start', mb: 2.5 }}
        >
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography component="h2" variant="h2">
              {widget.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {kindLabels[widget.kind]}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={0.25}
            sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' } }}
          >
            <Tooltip title="Sposta prima">
              <span>
                <IconButton
                  size="small"
                  aria-label={`Sposta prima ${widget.title}`}
                  disabled={!canMoveBefore || pending}
                  onClick={() => onMove(-1)}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Sposta dopo">
              <span>
                <IconButton
                  size="small"
                  aria-label={`Sposta dopo ${widget.title}`}
                  disabled={!canMoveAfter || pending}
                  onClick={() => onMove(1)}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Modifica">
              <span>
                <IconButton
                  size="small"
                  aria-label={`Modifica ${widget.title}`}
                  disabled={pending}
                  onClick={onEdit}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Elimina">
              <span>
                <IconButton
                  size="small"
                  aria-label={`Elimina ${widget.title}`}
                  disabled={pending}
                  onClick={onDelete}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
        <WidgetContent widget={widget} snapshot={snapshot} />
      </CardContent>
    </Card>
  );
}
