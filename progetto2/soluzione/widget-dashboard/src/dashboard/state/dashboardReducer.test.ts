/** I test osservano transizioni di dominio e rollback senza renderizzare React. */
import type { DashboardState, DashboardWidget } from '../dashboard.types';
import { dashboardReducer } from './dashboardReducer';

const widget: DashboardWidget = {
  id: 'widget-test',
  title: 'Widget test',
  kind: 'alerts',
  size: 'compact',
};

const state: DashboardState = {
  widgets: [widget],
  range: 'oggi',
  pendingWidgetIds: [],
  notice: null,
};

describe('dashboardReducer', () => {
  it('aggiorna un widget in modo ottimistico e conferma il salvataggio', () => {
    const next = { ...widget, title: 'Titolo aggiornato' };
    const pending = dashboardReducer(state, {
      type: 'widgetChangeStarted',
      next,
      previous: widget,
    });

    expect(pending.widgets[0].title).toBe('Titolo aggiornato');
    expect(pending.pendingWidgetIds).toEqual(['widget-test']);

    const committed = dashboardReducer(pending, {
      type: 'widgetChangeCommitted',
      optimisticId: widget.id,
      widget: next,
    });
    expect(committed.pendingWidgetIds).toEqual([]);
    expect(committed.notice?.severity).toBe('success');
  });

  it('ripristina la versione precedente quando il salvataggio fallisce', () => {
    const pending = dashboardReducer(state, {
      type: 'widgetChangeStarted',
      next: { ...widget, title: 'Rollback richiesto' },
      previous: widget,
    });
    const rolledBack = dashboardReducer(pending, {
      type: 'widgetChangeRolledBack',
      widgetId: widget.id,
      previous: widget,
      message: 'Salvataggio rifiutato.',
    });

    expect(rolledBack.widgets[0]).toEqual(widget);
    expect(rolledBack.pendingWidgetIds).toEqual([]);
    expect(rolledBack.notice).toEqual({
      severity: 'error',
      message: 'Salvataggio rifiutato.',
    });
  });

  it('riordina senza mutare lo stato sorgente', () => {
    const second = { ...widget, id: 'widget-second', title: 'Secondo' };
    const source = { ...state, widgets: [widget, second] };
    const moved = dashboardReducer(source, {
      type: 'widgetMoved',
      widgetId: second.id,
      direction: -1,
    });

    expect(moved.widgets.map((item) => item.id)).toEqual([
      'widget-second',
      'widget-test',
    ]);
    expect(source.widgets.map((item) => item.id)).toEqual([
      'widget-test',
      'widget-second',
    ]);
  });

  it('ignora un rollback arrivato dopo il reset del layout', () => {
    const pending = dashboardReducer(state, {
      type: 'widgetChangeStarted',
      next: { ...widget, title: 'Titolo temporaneo' },
      previous: widget,
    });
    const reset = dashboardReducer(pending, { type: 'layoutReset' });
    const lateRollback = dashboardReducer(reset, {
      type: 'widgetChangeRolledBack',
      widgetId: widget.id,
      previous: { ...widget, title: 'Titolo precedente al reset' },
      message: 'Errore tardivo',
    });

    expect(lateRollback).toBe(reset);
    expect(lateRollback.widgets[0].title).toBe('Criticità aperte');
  });

  it('applica un id canonico restituito dalla API', () => {
    const optimistic = { ...widget, id: 'widget-temporaneo' };
    const pending = dashboardReducer(state, {
      type: 'widgetChangeStarted',
      next: optimistic,
      previous: null,
    });
    const canonical = { ...optimistic, id: 'widget-canonico' };
    const committed = dashboardReducer(pending, {
      type: 'widgetChangeCommitted',
      optimisticId: optimistic.id,
      widget: canonical,
    });

    expect(committed.widgets).toContainEqual(canonical);
    expect(committed.widgets).not.toContainEqual(optimistic);
    expect(committed.pendingWidgetIds).toEqual([]);
  });
});
