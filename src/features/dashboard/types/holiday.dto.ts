export type HolidayType =
  | "National Holiday"
  | "Joint Holiday";

export interface HolidayDTO {
  date: string;                  // "YYYY-MM-DD"
  name: string;                  // "Hari Kemerdekaan Republik Indonesia"
  type: HolidayType | string;
}
