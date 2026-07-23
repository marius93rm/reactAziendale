/**
 * I Context separano lettura, azioni e servizio.
 * Un consumer che invia azioni non dipende dalla forma dello stato globale.
 */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from 'react';
import type {
  DashboardState,
  DashboardWidget,
  TimeRange,
} from '../dashboard.types';
import { createSimulatedOperationsApi } from '../services/createSimulatedOperationsApi';
import type { OperationsApi } from '../services/OperationsApi';
import { dashboardReducer } from './dashboardReducer';
import {
  createInitialDashboardState,
  persistDashboardState,
} from './dashboardStorage';

type DashboardActions = {
  setRange: (range: TimeRange) => void;
  saveWidget: (widget: DashboardWidget) => Promise<boolean>;
  removeWidget: (widgetId: string) => void;
  moveWidget: (widgetId: string, direction: -1 | 1) => void;
  resetLayout: () => void;
  clearNotice: () => void;
};

const defaultApi = createSimulatedOperationsApi();
const DashboardStateContext = createContext<DashboardState | null>(null);
const DashboardActionsContext = createContext<DashboardActions | null>(null);
const OperationsApiContext = createContext<OperationsApi | null>(null);

type DashboardProviderProps = PropsWithChildren<{ api?: OperationsApi }>;

export function DashboardProvider({ children, api = defaultApi }: DashboardProviderProps) {
  const [state, dispatch] = useReducer(
    dashboardReducer,
    undefined,
    createInitialDashboardState,
  );
  const widgetsRef = useRef(state.widgets);
  const pendingWidgetCount = state.pendingWidgetIds.length;

  useLayoutEffect(() => {
    widgetsRef.current = state.widgets;
  }, [state.widgets]);

  // Persistiamo soltanto configurazione e intervallo, mai server state o pending.
  useEffect(() => {
    if (pendingWidgetCount > 0) return;
    persistDashboardState({ range: state.range, widgets: state.widgets });
  }, [pendingWidgetCount, state.range, state.widgets]);

  const setRange = useCallback((range: TimeRange) => {
    dispatch({ type: 'rangeChanged', range });
  }, []);

  const saveWidget = useCallback(
    async (draft: DashboardWidget) => {
      const previous =
        widgetsRef.current.find((widget) => widget.id === draft.id) ?? null;
      const next = {
        ...draft,
        id: draft.id || `widget-${crypto.randomUUID()}`,
        title: draft.title.trim(),
      };

      dispatch({ type: 'widgetChangeStarted', next, previous });

      try {
        const savedWidget = await api.saveWidget(next);
        dispatch({
          type: 'widgetChangeCommitted',
          optimisticId: next.id,
          widget: savedWidget,
        });
        return true;
      } catch (reason: unknown) {
        dispatch({
          type: 'widgetChangeRolledBack',
          widgetId: next.id,
          previous,
          message:
            reason instanceof Error
              ? reason.message
              : 'Il salvataggio del widget non è riuscito.',
        });
        return false;
      }
    },
    [api],
  );

  const actions = useMemo<DashboardActions>(
    () => ({
      setRange,
      saveWidget,
      removeWidget(widgetId) {
        dispatch({ type: 'widgetRemoved', widgetId });
      },
      moveWidget(widgetId, direction) {
        dispatch({ type: 'widgetMoved', widgetId, direction });
      },
      resetLayout() {
        dispatch({ type: 'layoutReset' });
      },
      clearNotice() {
        dispatch({ type: 'noticeCleared' });
      },
    }),
    [saveWidget, setRange],
  );

  return (
    <OperationsApiContext.Provider value={api}>
      <DashboardActionsContext.Provider value={actions}>
        <DashboardStateContext.Provider value={state}>
          {children}
        </DashboardStateContext.Provider>
      </DashboardActionsContext.Provider>
    </OperationsApiContext.Provider>
  );
}

export function useDashboardState() {
  const context = useContext(DashboardStateContext);
  if (!context) {
    throw new Error('useDashboardState richiede DashboardProvider.');
  }
  return context;
}

export function useDashboardActions() {
  const context = useContext(DashboardActionsContext);
  if (!context) {
    throw new Error('useDashboardActions richiede DashboardProvider.');
  }
  return context;
}

export function useOperationsApi() {
  const context = useContext(OperationsApiContext);
  if (!context) {
    throw new Error('useOperationsApi richiede DashboardProvider.');
  }
  return context;
}
