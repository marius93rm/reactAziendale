/**
 * Le fixture locali rendono lo starter indipendente da API e credenziali.
 * Le date usano ISO 8601 per consentire ordinamento e formattazione affidabili.
 */
import type { Ticket } from './ticket.types';

export const tickets: Ticket[] = [
  {
    id: 'OPS-1847',
    title: 'Ordini bloccati nel controllo disponibilità',
    customer: 'Nordline Retail',
    description:
      'Il controllo disponibilità non conclude la verifica per il magazzino di Verona.',
    status: 'in-lavorazione',
    priority: 'critica',
    assignee: 'Marta Rinaldi',
    updatedAt: '2026-07-22T08:35:00+03:00',
  },
  {
    id: 'OPS-1842',
    title: 'Esportazione CSV priva del codice cliente',
    customer: 'Altura Logistica',
    description:
      'Il report settimanale esporta le righe corrette ma omette il codice cliente.',
    status: 'nuovo',
    priority: 'alta',
    assignee: 'Luca Ferri',
    updatedAt: '2026-07-22T07:48:00+03:00',
  },
  {
    id: 'OPS-1839',
    title: 'Doppia notifica per le richieste approvate',
    customer: 'Officine Serra',
    description:
      'Gli approvatori ricevono due email quando il responsabile chiude una richiesta.',
    status: 'in-attesa',
    priority: 'media',
    assignee: 'Giada Moretti',
    updatedAt: '2026-07-21T17:20:00+03:00',
  },
  {
    id: 'OPS-1835',
    title: 'Anagrafica fornitore non salvata',
    customer: 'Cantieri Velar',
    description:
      'Il salvataggio si interrompe quando la partita IVA contiene spazi copiati da un PDF.',
    status: 'in-lavorazione',
    priority: 'alta',
    assignee: 'Marta Rinaldi',
    updatedAt: '2026-07-21T15:42:00+03:00',
  },
  {
    id: 'OPS-1828',
    title: 'Filtro sedi non mantiene la selezione',
    customer: 'Riva Energia',
    description:
      'La sede selezionata torna al valore iniziale dopo l’apertura del dettaglio impianto.',
    status: 'nuovo',
    priority: 'media',
    assignee: 'Elia Romano',
    updatedAt: '2026-07-21T12:16:00+03:00',
  },
  {
    id: 'OPS-1821',
    title: 'Tempi di risposta elevati nella ricerca mezzi',
    customer: 'Trasporti Belluno',
    description:
      'La ricerca supera cinque secondi quando l’utente seleziona due o più depositi.',
    status: 'in-attesa',
    priority: 'alta',
    assignee: 'Luca Ferri',
    updatedAt: '2026-07-21T09:05:00+03:00',
  },
  {
    id: 'OPS-1814',
    title: 'Ruolo supervisore senza accesso ai riepiloghi',
    customer: 'Forma Salute',
    description:
      'Il menu riepiloghi resta nascosto agli utenti con ruolo supervisore regionale.',
    status: 'risolto',
    priority: 'media',
    assignee: 'Giada Moretti',
    updatedAt: '2026-07-20T16:30:00+03:00',
  },
  {
    id: 'OPS-1809',
    title: 'Valuta errata nel riepilogo mensile',
    customer: 'Koral Hospitality',
    description:
      'Il riepilogo usa euro per una struttura configurata con valuta in franchi svizzeri.',
    status: 'risolto',
    priority: 'bassa',
    assignee: 'Elia Romano',
    updatedAt: '2026-07-20T11:54:00+03:00',
  },
  {
    id: 'OPS-1803',
    title: 'Allegati duplicati dopo il ripristino bozza',
    customer: 'Studio Varenna',
    description:
      'Il ripristino di una bozza mostra due volte gli allegati caricati nella sessione precedente.',
    status: 'in-lavorazione',
    priority: 'media',
    assignee: 'Marta Rinaldi',
    updatedAt: '2026-07-19T18:08:00+03:00',
  },
  {
    id: 'OPS-1796',
    title: 'Data consegna spostata di un giorno',
    customer: 'Fonderie Lario',
    description:
      'La data cambia dopo il salvataggio per gli utenti che lavorano nel fuso orario UTC.',
    status: 'nuovo',
    priority: 'alta',
    assignee: 'Luca Ferri',
    updatedAt: '2026-07-19T14:27:00+03:00',
  },
  {
    id: 'OPS-1788',
    title: 'Campo note tagliato nella stampa ordine',
    customer: 'Ceramiche Piana',
    description:
      'La stampa mostra una sola riga quando la nota contiene più di centoventi caratteri.',
    status: 'in-attesa',
    priority: 'bassa',
    assignee: 'Elia Romano',
    updatedAt: '2026-07-18T10:12:00+03:00',
  },
  {
    id: 'OPS-1779',
    title: 'Pulsante conferma disabilitato dopo un errore',
    customer: 'Asteria Facility',
    description:
      'Dopo un errore temporaneo il pulsante resta disabilitato anche se l’utente corregge i dati.',
    status: 'risolto',
    priority: 'critica',
    assignee: 'Giada Moretti',
    updatedAt: '2026-07-17T16:44:00+03:00',
  },
];

