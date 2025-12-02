import { ReportResponse } from "@/interfaces/report-response";
import { UseReportsResult } from "@/interfaces/use-reports-result";
import { TopDiscipline } from "@/interfaces/top-discipline";
import { PaymentMethod } from "@/interfaces/payment-method";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useReports(): UseReportsResult {
  const [dataStudio, setDataStudio] = useState<ReportResponse | null>(null);
  const [dataInstructor, setDataInstructor] = useState<ReportResponse | null>(null);
  const [dataDiscipline, setDataDiscipline] = useState<ReportResponse | null>(null);
  const [dataStudioDiscipline, setDataStudioDiscipline] = useState<ReportResponse | null>(null);
  const [topDisciplines, setTopDisciplines] = useState<TopDiscipline[] | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (from: string, to: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token, inicia sesión");

      const [resStudio, resInstructor, resStudioDiscipline, resDiscipline, resTopDisciplines, resPaymentMethods] = await Promise.all([
        fetch(`${API_BASE_URL}/reports/reservations/series?groupBy=studio&from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/reports/reservations/series?groupBy=instructor&from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/reports/reservations/series?groupBy=studio,discipline&from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/reports/reservations/series?groupBy=discipline&from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/reports/reservations/top-disciplines?from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/reports/payments/payment-methods/summary?from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!resStudio.ok || !resInstructor.ok || !resStudioDiscipline || !resDiscipline.ok || !resTopDisciplines.ok || !resPaymentMethods.ok) {
        throw new Error("Error en alguna petición");
      }

      const [studio, instructor, studioDiscipline, discipline, topDisciplines, paymentMethods] = await Promise.all([
        resStudio.json(),
        resInstructor.json(),
        resStudioDiscipline.json(),
        resDiscipline.json(),
        resTopDisciplines.json(),
        resPaymentMethods.json(),
      ]);

      setDataStudio(studio);
      setDataInstructor(instructor);
      setDataStudioDiscipline(studioDiscipline);
      setDataDiscipline(discipline);
      setTopDisciplines(topDisciplines);
      setPaymentMethods(paymentMethods);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { dataStudio, dataInstructor, dataStudioDiscipline, dataDiscipline, topDisciplines, paymentMethods, loading, error, fetchReports };
}