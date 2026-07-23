/** Il draft del form resta locale e scompare quando il Dialog viene smontato. */
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type {
  DashboardWidget,
  WidgetKind,
  WidgetSize,
} from '../dashboard.types';

const kindLabels: Record<WidgetKind, string> = {
  alerts: 'Criticità',
  sites: 'Stato sedi',
  energy: 'Consumi',
  occupancy: 'Occupazione',
};

type WidgetEditorDialogProps = {
  widget?: DashboardWidget;
  onClose: () => void;
  onSave: (widget: DashboardWidget) => void;
};

export function WidgetEditorDialog({
  widget,
  onClose,
  onSave,
}: WidgetEditorDialogProps) {
  const [draft, setDraft] = useState<DashboardWidget>(() =>
    widget
      ? { ...widget }
      : { id: '', title: '', kind: 'alerts', size: 'compact' },
  );

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <Box
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          if (draft.title.trim()) {
            onSave({ ...draft, title: draft.title.trim() });
          }
        }}
      >
        <DialogTitle>{widget ? 'Modifica widget' : 'Crea widget'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              required
              label="Titolo"
              slotProps={{ htmlInput: { 'aria-label': 'Titolo' } }}
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
              helperText="Per provare il rollback, inserisci la parola rollback."
            />
            <FormControl>
              <InputLabel id="widget-kind-label">Tipo di widget</InputLabel>
              <Select
                labelId="widget-kind-label"
                label="Tipo di widget"
                value={draft.kind}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    kind: event.target.value as WidgetKind,
                  }))
                }
              >
                {Object.entries(kindLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel id="widget-size-label">Dimensione</InputLabel>
              <Select
                labelId="widget-size-label"
                label="Dimensione"
                value={draft.size}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    size: event.target.value as WidgetSize,
                  }))
                }
              >
                <MenuItem value="compact">Compatto</MenuItem>
                <MenuItem value="wide">Esteso</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Annulla</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!draft.title.trim()}
          >
            Salva widget
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
