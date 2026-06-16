export const normalizeError = (error: unknown): never => {
  const err = error as { response?: { data?: unknown }; message?: string };
  throw err?.response?.data || err?.message || error;
};
