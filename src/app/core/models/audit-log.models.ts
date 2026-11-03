export interface AuditLogDto {
  id: number;
  userId: number | null;
  userEmail: string;
  commandId: string;
  commandName: string;
  executedAt: string;
  success: boolean;
  errorMessage: string | null;
}

export interface AuditLogSearchDto {
  userEmail?: string;
  commandName?: string;
  success?: boolean;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
