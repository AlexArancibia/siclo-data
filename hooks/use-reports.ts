import { ReportResponse } from "@/interfaces/report-response";
import { UseReportsResult } from "@/interfaces/use-reports-result";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useReports(): UseReportsResult {
  const [dataStudio, setDataStudio] = useState<ReportResponse | null>(null);
  const [dataInstructor, setDataInstructor] = useState<ReportResponse | null>(null);
  const [dataDiscipline, setDataDiscipline] = useState<ReportResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async (from: string, to: string) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token, inicia sesión");

      const [resStudio, resInstructor, resDiscipline] = await Promise.all([
        fetch(`${API_BASE_URL}/reports/reservations/series?groupBy=studio&from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/reports/reservations/series?groupBy=instructor&from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/reports/reservations/series?groupBy=discipline&from=${from}&to=${to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!resStudio.ok || !resInstructor.ok || !resDiscipline.ok) {
        throw new Error("Error en alguna petición");
      }

      const [studio, instructor, discipline] = await Promise.all([
        resStudio.json(),
        resInstructor.json(),
        resDiscipline.json(),
      ]);

      setDataStudio(studio);
      setDataInstructor(instructor);
      setDataDiscipline(discipline);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { dataStudio, dataInstructor, dataDiscipline, loading, error, fetchReports };
}