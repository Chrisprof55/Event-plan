import { usePlanData } from '../context/PlanDataProvider';

export function useAllPlanItems() {
  const {
    chronologicalItems: items,
    eventsLoading,
    inboxLoading,
    detailsLoading,
    eventsError,
    inboxError,
    detailsError,
    ready,
  } = usePlanData();

  const loading =
    !ready && eventsLoading && inboxLoading && detailsLoading;
  const error = eventsError || inboxError || detailsError;

  return { items, loading, error, eventsLoading, inboxLoading, detailsLoading };
}
