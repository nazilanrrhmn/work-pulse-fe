import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/use-store";
import { getHolidays } from "../../../stores/holiday/async";

/**
 * Fetch hari libur nasional untuk tahun tertentu.
 * Data di-cache di Redux — tidak re-fetch jika tahun sudah ada.
 *
 * Mengembalikan Set/Map (bukan fungsi closure) agar bisa dipakai
 * sebagai dependency eksplisit di useMemo komponen pemanggil.
 */
export function useHolidays(year: number) {
  const dispatch = useAppDispatch();

  const holidaysForYear = useAppSelector(
    (state) => state.holiday.byYear[String(year)] ?? null,
  );
  const loading = useAppSelector((state) => state.holiday.loading);

  // Loading = true selama data belum tersedia (idle sebelum fetch, atau pending)
  const isLoading = !holidaysForYear && loading !== "failed";

  useEffect(() => {
    // Hanya fetch jika belum ada di cache
    if (!holidaysForYear) {
      dispatch(getHolidays(year));
    }
  }, [dispatch, year, holidaysForYear]);

  // Set tanggal libur nasional — hanya type "Public Holiday"
  const nationalHolidaySet = useMemo<Set<string>>(() => {
    if (!holidaysForYear) return new Set();
    return new Set(
      holidaysForYear
        .filter((h) => h.type === "Public Holiday")
        .map((h) => h.date),
    );
  }, [holidaysForYear]);

  // Set tanggal cuti bersama (Joint Holiday)
  const jointLeaveSet = useMemo<Set<string>>(() => {
    if (!holidaysForYear) return new Set();
    return new Set(
      holidaysForYear
        .filter((h) => h.type === "Joint Holiday")
        .map((h) => h.date),
    );
  }, [holidaysForYear]);

  // Map dateStr → nama hari libur (untuk tooltip)
  const holidayNames = useMemo<Map<string, string>>(() => {
    if (!holidaysForYear) return new Map();
    return new Map(holidaysForYear.map((h) => [h.date, h.name]));
  }, [holidaysForYear]);

  return { nationalHolidaySet, jointLeaveSet, holidayNames, isLoading };
}
