/** DashboardPage compone Context, server state e stato locale dei Dialog. */
import { useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import type { DashboardWidget, TimeRange } from '../dashboard.types';
import { useOperationsData } from '../hooks/useOperationsData';
import {
  useDashboardActions,
  useDashboardState,
  useOperationsApi,
} from '../state/DashboardContext';
import { WidgetCard } from './WidgetCard';
import { WidgetEditorDialog } from './WidgetEditorDialog';

type EditorState =
  | { mode: 'create' }
  | { mode: 'edit'; widget: DashboardWidget }
  | null;

const kindLabels = {
  alerts: 'Criticità',
  sites: 'Stato sedi',
  energy: 'Consumi',
  occupancy: 'Occupazione',
};

export function DashboardPage() {
  const { widgets, range, pendingWidgetIds, notice } = useDashboardState();
  const {
    setRange,
    saveWidget,
    removeWidget,
    moveWidget,
    resetLayout,
    clearNotice,
  } = useDashboardActions();
  const api = useOperationsApi();
  const operations = useOperationsData(api, range);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState<EditorState>(null);
  const [widgetToDelete, setWidgetToDelete] =
    useState<DashboardWidget | null>(null);
  const createWidgetButtonRef = useRef<HTMLButtonElement>(null);
  const focusCreateAfterDelete = useRef(false);

  // Ricerca e conteggio derivano da stato globale e input locale.
  const normalizedQuery = query.trim().toLocaleLowerCase('it-IT');
  const visibleWidgets = widgets.filter((widget) =>
    [widget.title, kindLabels[widget.kind]]
      .join(' ')
      .toLocaleLowerCase('it-IT')
      .includes(normalizedQuery),
  );

  function handleSave(widget: DashboardWidget) {
    setEditor(null);
    void saveWidget(widget);
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="secondary" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, gap: 2 }}>
          <DashboardCustomizeIcon aria-hidden="true" />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }}>Centrale Operativa</Typography>
            <Typography variant="caption" sx={{ color: 'grey.300' }}>
              Monitoraggio sedi aziendali
            </Typography>
          </Box>
          <Chip
            label="Ambiente didattico"
            size="small"
            sx={{
              color: 'grey.100',
              borderColor: 'grey.600',
              display: { xs: 'none', sm: 'flex' },
            }}
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      {operations.isRefreshing ? (
        <LinearProgress aria-label="Aggiornamento dati" />
      ) : null}

      <Container component="main" maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'flex-end' },
            mb: 4,
          }}
        >
          <Box>
            <Typography component="h1" variant="h1">
              Dashboard a widget
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
              Componi la vista operativa, controlla le sedi e intervieni sulle
              criticità senza perdere il contesto.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="range-label">Intervallo</InputLabel>
              <Select
                labelId="range-label"
                label="Intervallo"
                value={range}
                onChange={(event) => setRange(event.target.value as TimeRange)}
              >
                <MenuItem value="oggi">Oggi</MenuItem>
                <MenuItem value="7-giorni">Ultimi 7 giorni</MenuItem>
                <MenuItem value="30-giorni">Ultimi 30 giorni</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={operations.refresh}
            >
              Aggiorna dati
            </Button>
            <Button
              ref={createWidgetButtonRef}
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setEditor({ mode: 'create' })}
            >
              Crea widget
            </Button>
          </Stack>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <TextField
              label="Cerca widget"
              size="small"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              sx={{ flexGrow: 1, maxWidth: { sm: 420 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon aria-hidden="true" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Typography color="text.secondary" aria-live="polite">
              {`${visibleWidgets.length} ${
                visibleWidgets.length === 1 ? 'widget visibile' : 'widget visibili'
              }`}
            </Typography>
            <Button
              startIcon={<RestartAltIcon />}
              onClick={resetLayout}
              disabled={pendingWidgetIds.length > 0}
            >
              Ripristina layout
            </Button>
          </Stack>
        </Paper>

        {operations.status === 'loading' && !operations.data ? (
          <Box
            role="status"
            aria-label="Caricamento dashboard"
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} variant="rounded" height={220} />
            ))}
          </Box>
        ) : null}

        {operations.status === 'error' ? (
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon />}
            sx={{ mb: operations.data ? 2 : 0 }}
            action={
              <Button color="inherit" onClick={operations.retry}>
                Riprova
              </Button>
            }
          >
            <Typography sx={{ fontWeight: 700 }}>Dati non disponibili</Typography>
            {operations.error}
          </Alert>
        ) : null}

        {operations.status === 'empty' ? (
          <Paper role="status" variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
            <BusinessIcon color="primary" sx={{ fontSize: 40 }} aria-hidden="true" />
            <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
              Nessuna sede disponibile
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Aggiorna i dati oppure verifica la sorgente API.
            </Typography>
          </Paper>
        ) : null}

        {operations.data && operations.data.sites.length > 0 ? (
          widgets.length === 0 ? (
            <Paper role="status" variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
              <DashboardCustomizeIcon
                color="primary"
                sx={{ fontSize: 40 }}
                aria-hidden="true"
              />
              <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
                Nessun widget configurato
              </Typography>
              <Button sx={{ mt: 2 }} onClick={() => setEditor({ mode: 'create' })}>
                Crea il primo widget
              </Button>
            </Paper>
          ) : visibleWidgets.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: 'repeat(2, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              {visibleWidgets.map((widget) => {
                const position = widgets.findIndex((item) => item.id === widget.id);
                return (
                  <WidgetCard
                    key={widget.id}
                    widget={widget}
                    snapshot={operations.data!}
                    pending={pendingWidgetIds.includes(widget.id)}
                    canMoveBefore={position > 0}
                    canMoveAfter={position < widgets.length - 1}
                    onMove={(direction) => moveWidget(widget.id, direction)}
                    onEdit={() => setEditor({ mode: 'edit', widget })}
                    onDelete={() => setWidgetToDelete(widget)}
                  />
                );
              })}
            </Box>
          ) : (
            <Paper role="status" variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
              <SearchIcon color="primary" sx={{ fontSize: 40 }} aria-hidden="true" />
              <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
                Nessun widget corrisponde alla ricerca
              </Typography>
              <Button sx={{ mt: 2 }} onClick={() => setQuery('')}>
                Reimposta ricerca
              </Button>
            </Paper>
          )
        ) : null}

        {operations.data ? (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 3 }}
          >
            Dati aggiornati il{' '}
            {new Intl.DateTimeFormat('it-IT', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(operations.data.updatedAt))}
          </Typography>
        ) : null}
      </Container>

      {editor ? (
        <WidgetEditorDialog
          widget={editor.mode === 'edit' ? editor.widget : undefined}
          onClose={() => setEditor(null)}
          onSave={handleSave}
        />
      ) : null}

      <Dialog
        open={Boolean(widgetToDelete)}
        onClose={() => setWidgetToDelete(null)}
        slotProps={{
          transition: {
            onExited: () => {
              if (!focusCreateAfterDelete.current) return;
              focusCreateAfterDelete.current = false;
              createWidgetButtonRef.current?.focus();
            },
          },
        }}
      >
        <DialogTitle>Eliminare il widget?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {widgetToDelete
              ? `Il widget "${widgetToDelete.title}" verrà rimosso dalla dashboard.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWidgetToDelete(null)}>Annulla</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (widgetToDelete) {
                focusCreateAfterDelete.current = true;
                removeWidget(widgetToDelete.id);
              }
              setWidgetToDelete(null);
            }}
          >
            Elimina widget
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={clearNotice}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {notice ? (
          <Alert severity={notice.severity} onClose={clearNotice} variant="filled">
            {notice.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
