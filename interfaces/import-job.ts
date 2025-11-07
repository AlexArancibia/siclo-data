export interface ProcessingResult {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  skipped: number;
  errors: string[];
}

export interface ImportJob {
  jobId: number;
  fileName: string;
  fileType: 'RESERVATION' | 'PAYMENT';
  status: 'SUCCESS' | 'ERROR' | 'PENDING' | 'PROCESSING';
  errorMessage: string | null;
  createdAt: string;
  finishedAt: string | null;
  processingResult: ProcessingResult | null;
}

export interface ImportJobTable {
  data: ImportJob[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

