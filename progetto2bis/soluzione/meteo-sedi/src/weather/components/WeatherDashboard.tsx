import AirIcon from '@mui/icons-material/Air';
import BusinessIcon from '@mui/icons-material/Business';
import RefreshIcon from '@mui/icons-material/Refresh';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useForecast } from '../hooks/useForecast';
import type { WeatherApi } from '../services/WeatherApi';
import { officeSites } from '../sites';
import { useWeatherWorkspace } from '../state/WeatherWorkspaceContext';
import type { Forecast, ForecastViewState, TemperatureUnit } from '../weather.types';

function formatTemperature(value: number, unit: TemperatureUnit) {
  return `${Math.round(value)} °${unit === 'celsius' ? 'C' : 'F'}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${value}T12:00:00Z`));
}

function describeWeatherCode(code: number) {
  if (code === 0) return 'Sereno';
  if (code <= 3) return 'Nuvoloso';
  if (code <= 48) return 'Nebbia';
  if (code <= 67) return 'Pioggia';
  if (code <= 77) return 'Neve';
  if (code <= 82) return 'Rovesci';
  if (code === 85 || code === 86) return 'Rovesci di neve';
  if (code === 95 || code === 96 || code === 99) return 'Temporale';
  return 'Condizioni variabili';
}

function ForecastLoading() {
  return (
    <Stack role="status" aria-label="Caricamento dati meteo" spacing={3}>
      <Skeleton variant="rounded" height={230} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
          gap: 1.5,
        }}
      >
        {Array.from({ length: 5 }, (_value, index) => (
          <Skeleton key={index} variant="rounded" height={130} />
        ))}
      </Box>
    </Stack>
  );
}

function ForecastSummary({
  forecast,
  unit,
  onRefresh,
}: {
  forecast: Forecast;
  unit: TemperatureUnit;
  onRefresh: () => void;
}) {
  return (
    <Stack spacing={3}>
      <Paper component="section" variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h2">Condizioni attuali</Typography>
            <Typography component="p" variant="h3" sx={{ mt: 1, fontSize: '3rem' }}>
              {formatTemperature(forecast.current.temperature, unit)}
            </Typography>
            <Typography color="text.secondary">
              Percepita {formatTemperature(forecast.current.apparentTemperature, unit)}
            </Typography>
          </Box>
          <Stack spacing={1} sx={{ minWidth: 190 }}>
            <Typography sx={{ fontWeight: 700 }}>
              {describeWeatherCode(forecast.current.weatherCode)}
            </Typography>
            <Typography color="text.secondary">
              Codice WMO {forecast.current.weatherCode}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <AirIcon aria-hidden="true" color="primary" />
              <Typography>{forecast.current.windSpeed} km/h</Typography>
            </Stack>
          </Stack>
        </Stack>
        <Button startIcon={<RefreshIcon />} onClick={onRefresh} sx={{ mt: 2 }}>
          Aggiorna dati
        </Button>
      </Paper>

      <Box component="section" aria-labelledby="five-days-title">
        <Typography id="five-days-title" variant="h2" sx={{ mb: 1.5 }}>
          Previsione a cinque giorni
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' },
            gap: 1.5,
          }}
        >
          {forecast.daily.map((day) => (
            <Paper key={day.date} variant="outlined" sx={{ p: 2 }}>
              <Typography component="h3" sx={{ fontWeight: 700 }}>
                {formatDate(day.date)}
              </Typography>
              <Typography sx={{ mt: 1 }}>{describeWeatherCode(day.weatherCode)}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Min {formatTemperature(day.minimumTemperature, unit)}
              </Typography>
              <Typography color="text.secondary">
                Max {formatTemperature(day.maximumTemperature, unit)}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}

function ForecastContent({
  state,
  unit,
  retry,
  refresh,
}: {
  state: ForecastViewState;
  unit: TemperatureUnit;
  retry: () => void;
  refresh: () => void;
}) {
  if (state.status === 'idle' || state.status === 'loading') {
    return <ForecastLoading />;
  }

  if (state.status === 'error') {
    return (
      <Alert severity="error" action={<Button color="inherit" onClick={retry}>Riprova</Button>}>
        <AlertTitle component="h2">Impossibile caricare il meteo</AlertTitle>
        {state.error}
      </Alert>
    );
  }

  if (state.status === 'empty') {
    return (
      <Alert severity="info" action={<Button color="inherit" onClick={refresh}>Aggiorna</Button>}>
        <AlertTitle component="h2">Nessuna previsione disponibile</AlertTitle>
        Open-Meteo non ha restituito giorni per questa sede.
      </Alert>
    );
  }

  return <ForecastSummary forecast={state.data} unit={unit} onRefresh={refresh} />;
}

export function WeatherDashboard({ api }: { api: WeatherApi }) {
  const {
    selectedSiteId,
    selectedSite,
    temperatureUnit,
    selectSite,
    setTemperatureUnit,
  } = useWeatherWorkspace();
  const { retry, refresh, ...state } = useForecast(api, selectedSite, temperatureUnit);

  return (
    <Box sx={{ minHeight: '100dvh', pb: 4 }}>
      <Box component="header" sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2 }}>
            <BusinessIcon aria-hidden="true" />
            <Typography sx={{ fontWeight: 700 }}>Operations Italia</Typography>
          </Stack>
          <Typography component="h1" variant="h1">Meteo sedi</Typography>
          <Typography sx={{ mt: 1, color: '#CBD5E1', maxWidth: 620 }}>
            Consulta condizioni attuali e previsioni per le sedi aziendali.
          </Typography>
        </Container>
      </Box>

      <Container component="main" maxWidth="lg" sx={{ mt: { xs: 3, md: 4 } }}>
        <Paper component="section" variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, mb: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography component="h2" variant="h2" sx={{ mb: 1.5 }}>
                Sede
              </Typography>
              <Stack
                role="group"
                aria-label="Scegli sede"
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ flexWrap: 'wrap' }}
              >
                {officeSites.map((site) => (
                  <Button
                    key={site.id}
                    variant={selectedSiteId === site.id ? 'contained' : 'outlined'}
                    aria-pressed={selectedSiteId === site.id}
                    onClick={() => selectSite(site.id)}
                  >
                    {site.city}
                  </Button>
                ))}
              </Stack>
            </Box>
            <Box>
              <Typography id="unit-label" component="h2" variant="h2" sx={{ mb: 1.5 }}>
                Unità di temperatura
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={temperatureUnit}
                aria-labelledby="unit-label"
                onChange={(_event, value: TemperatureUnit | null) => {
                  if (value) setTemperatureUnit(value);
                }}
              >
                <ToggleButton value="celsius">Celsius</ToggleButton>
                <ToggleButton value="fahrenheit">Fahrenheit</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </Paper>

        <Box aria-live="polite">
          <ForecastContent
            state={state}
            unit={temperatureUnit}
            retry={retry}
            refresh={refresh}
          />
        </Box>
      </Container>

      <Container component="footer" maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Dati meteo:{' '}
          <Link href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
