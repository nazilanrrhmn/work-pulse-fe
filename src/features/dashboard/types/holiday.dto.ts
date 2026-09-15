// Response shape dari GET https://use.api.co.id/holidays/indonesia/?year=YYYY
// Auth: header x-api-co-id

export type HolidayType =
  | "Public Holiday"
  | "Joint Holiday"
  | "National Holiday"
  | "Observance";

export interface HolidayDTO {
  id: string;                    // "holiday_2026_08_17"
  date: string;                  // "YYYY-MM-DD"
  name: string;                  // "Hari Kemerdekaan Republik Indonesia"
  type: HolidayType;
  is_national_holiday: boolean;
}

export interface HolidayPagingDTO {
  page: number;
  size: number;
  total_item: number;
  total_page: number;
}

export interface HolidaysResponseDTO {
  is_success: boolean;
  message: string;
  data: HolidayDTO[];
  paging: HolidayPagingDTO;
}
