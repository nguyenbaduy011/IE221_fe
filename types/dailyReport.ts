export interface DailyReport {
  id: number;
  user: {
    id: number;
    name: string;
  };
  course: {
    id: number;
    name: string;
  };
  content: string | null;
  status: DailyReportStatus;
  created_at: string;
  updated_at: string;
}

export enum DailyReportStatus {
  Draft = 0,
  Submitted = 1,
}
