import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/use-store";
import { getDashboardSummary } from "../../../stores/dashboard/async";

export function useDashboardSummary() {
  const dispatch = useAppDispatch();

  const summary = useAppSelector((state) => state.dashboard.summary);
  const loading = useAppSelector((state) => state.dashboard.loading);
  const error = useAppSelector((state) => state.dashboard.error);

  const isLoading = loading === "pending" || loading === "idle";

  useEffect(() => {
    dispatch(getDashboardSummary());
  }, [dispatch]);

  return { summary, isLoading, error };
}
