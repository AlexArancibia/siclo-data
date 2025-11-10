import { ReportResponse } from "./report-response";
import { TopDiscipline } from "./top-discipline";
import { PaymentMethod } from "./payment-method";

export interface UseReportsResult {
  dataStudio: ReportResponse | null;
  dataInstructor: ReportResponse | null;
  dataDiscipline: ReportResponse | null;
  topDisciplines: TopDiscipline[] | null;
  paymentMethods: PaymentMethod[] | null;
  loading: boolean;
  error: string | null;
  fetchReports: (from: string, to: string) => Promise<void>;
}