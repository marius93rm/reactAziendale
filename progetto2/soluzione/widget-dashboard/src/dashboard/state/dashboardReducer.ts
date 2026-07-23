/** Il reducer descrive transizioni pure e mantiene il rollback esplicito. */
import type {
  DashboardState,
  DashboardWidget,
  TimeRange,
} from '../dashboard.types';
import { initialWidgets } from './dashboardStorage';

export type DashboardAction =
  | { type: 'rangeChanged'; range: TimeRange }
  | {
      type: 'widgetChangeStarted';
      next: DashboardWidget;
      previous: DashboardWidget | null;
    }
  | {
      type: 'widgetChangeCommitted';
      optimisticId: string;
      widget: DashboardWidget;
    }
  | {
      type: 'widgetChangeRolledBack';
      widgetId: string;
      previous: DashboardWidget | null;
      message: string;
    }
  | { type: 'widgetRemoved'; widgetId: string }
  | { type: 'widgetMoved'; widgetId: string; direction: -1 | 1 }
  | { type: 'layoutReset' }
  | { type: 'noticeCleared' };

function withoutPending(state: DashboardState, widgetId: string) {
  return state.pendingWidgetIds.filter((id) => id !== widgetId);
}

export function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case 'rangeChanged':
      return { ...state, range: action.range };

    case 'widgetChangeStarted': {
      const exists = state.widgets.some((widget) => widget.id === action.next.id);
      return {
        ...state,
        widgets: exists
          ? state.widgets.map((widget) =>
              widget.id === action.next.id ? action.next : widget,
            )
          : [...state.widgets, action.next],
        pendingWidgetIds: state.pendingWidgetIds.includes(action.next.id)
          ? state.pendingWidgetIds
          : [...state.pendingWidgetIds, action.next.id],
        notice: null,
      };
    }

    case 'widgetChangeCommitted':
      if (!state.pendingWidgetIds.includes(action.optimisticId)) return state;
      return {
        ...state,
        widgets: state.widgets.map((widget) =>
          widget.id === action.optimisticId ? action.widget : widget,
        ),
        pendingWidgetIds: withoutPending(state, action.optimisticId),
        notice: { severity: 'success', message: 'Widget salvato.' },
      };

    case 'widgetChangeRolledBack':
      if (!state.pendingWidgetIds.includes(action.widgetId)) return state;
      return {
        ...state,
        widgets: action.previous
          ? state.widgets.map((widget) =>
              widget.id === action.widgetId ? action.previous! : widget,
            )
          : state.widgets.filter((widget) => widget.id !== action.widgetId),
        pendingWidgetIds: withoutPending(state, action.widgetId),
        notice: { severity: 'error', message: action.message },
      };

    case 'widgetRemoved':
      return {
        ...state,
        widgets: state.widgets.filter((widget) => widget.id !== action.widgetId),
      };

    case 'widgetMoved': {
      const from = state.widgets.findIndex((widget) => widget.id === action.widgetId);
      const to = from + action.direction;
      if (from < 0 || to < 0 || to >= state.widgets.length) return state;
      const widgets = [...state.widgets];
      const [moved] = widgets.splice(from, 1);
      widgets.splice(to, 0, moved);
      return { ...state, widgets };
    }

    case 'layoutReset':
      return {
        ...state,
        widgets: initialWidgets.map((widget) => ({ ...widget })),
        range: 'oggi',
        pendingWidgetIds: [],
        notice: { severity: 'success', message: 'Layout ripristinato.' },
      };

    case 'noticeCleared':
      return { ...state, notice: null };

    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
