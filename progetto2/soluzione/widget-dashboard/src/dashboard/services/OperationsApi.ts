/** Il contratto nasconde latenza, cache e scenari della sorgente dati. */
import type {
  DashboardWidget,
  OperationsSnapshot,
  TimeRange,
} from '../dashboard.types';

export type SnapshotRequest = {
  signal: AbortSignal;
  force?: boolean;
};

export type OperationsApi = {
  getSnapshot: (
    range: TimeRange,
    request: SnapshotRequest,
  ) => Promise<OperationsSnapshot>;
  saveWidget: (
    widget: DashboardWidget,
    signal?: AbortSignal,
  ) => Promise<DashboardWidget>;
  invalidate: (range?: TimeRange) => void;
};
