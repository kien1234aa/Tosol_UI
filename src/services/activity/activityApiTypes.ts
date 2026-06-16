export type ActivityCauserApi = {
  id: number;
  name: string;
  email?: string | null;
};

export type ActivityLogApi = {
  id: number;
  log_name: string;
  description: string;
  event: string | null;
  subject_type: string;
  subject_id: number;
  causer_type: string | null;
  causer_id: number | null;
  causer?: ActivityCauserApi | null;
  properties?: Record<string, unknown> | null;
  batch_uuid: string | null;
  is_ai: boolean;
  created_at: string;
  updated_at: string;
};

export type ActivitiesMeta = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

export type ActivitiesApiResponse = {
  success: boolean;
  message?: string;
  data?: ActivityLogApi[];
  meta?: ActivitiesMeta;
};
