export interface ApiFailurePayload {
  message: string;
  fieldErrors: Record<string, string>;
}
