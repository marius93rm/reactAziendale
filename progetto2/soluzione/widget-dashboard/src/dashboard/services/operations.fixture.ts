/** Le fixture sono deterministiche per demo, test e primo avvio offline. */
import type { OperationsAlert, Site } from '../dashboard.types';

export const siteFixtures: Site[] = [
  {
    id: 'site-torino',
    name: 'Sede Torino',
    city: 'Torino',
    health: 'regolare',
    energyKwh: 684,
    occupancy: 72,
  },
  {
    id: 'site-bologna',
    name: 'Hub Bologna',
    city: 'Bologna',
    health: 'attenzione',
    energyKwh: 518,
    occupancy: 61,
  },
  {
    id: 'site-padova',
    name: 'Centro Padova',
    city: 'Padova',
    health: 'critica',
    energyKwh: 742,
    occupancy: 84,
  },
  {
    id: 'site-bari',
    name: 'Sede Bari',
    city: 'Bari',
    health: 'regolare',
    energyKwh: 431,
    occupancy: 48,
  },
];

export const alertFixtures: OperationsAlert[] = [
  {
    id: 'alert-ventilation',
    siteId: 'site-padova',
    title: 'Ventilazione sala server oltre soglia',
    severity: 'alta',
  },
  {
    id: 'alert-access',
    siteId: 'site-bologna',
    title: 'Lettore accessi piano 2 intermittente',
    severity: 'media',
  },
  {
    id: 'alert-energy',
    siteId: 'site-padova',
    title: 'Consumo fuori fascia nella notte',
    severity: 'media',
  },
];
