import { ReservationTable } from "@/interfaces/reservation-table";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useClassesView() {
  const [reservationsTable, setReservationsTable] = useState<ReservationTable>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const getReservationsTable = async (dateStart: string, dateEnd: string, page: number = 1, size: number = 10) => {
    try {
      if (!token) throw new Error("No hay token, inicia sesión");
      const res = await fetch(`${API_BASE_URL}/reports/reservations/table?from=${dateStart}&to=${dateEnd}&page=${page}&size=${size}&sortBy=RESERVATION_DATE&sortDir=ASC`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener reservaciones");
      const data: ReservationTable = await res.json();
      setReservationsTable(data);
      setCurrentPage(page);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const visibleReservations = reservationsTable?.data ?? [];
  const startIndex = ((reservationsTable?.page ?? 1) - 1) * (reservationsTable?.size ?? itemsPerPage) + 1;
  const totalDisplay = reservationsTable?.totalElements ?? 0;

  const goFirst = async () => {
    const page = 1;
    const from = '2025-07-07';
    const to = '2025-07-15';
    await getReservationsTable(from, to, page, itemsPerPage);
  };

  const goPrev = async () => {
    const curr = reservationsTable?.page ?? 1;
    if (curr > 1) {
      const nextPage = curr - 1;
      const from = '2025-07-07';
      const to = '2025-07-15';
      await getReservationsTable(from, to, nextPage, itemsPerPage);
    }
  };

  const goNext = async () => {
    const curr = reservationsTable?.page ?? 1;
    const lastIdx = reservationsTable?.totalPages ?? 1;
    if (curr < lastIdx) {
      const nextPage = curr + 1;
      const from = '2025-07-07';
      const to = '2025-07-15';
      await getReservationsTable(from, to, nextPage, itemsPerPage);
    }
  };

  const goLast = async () => {
    const lastIdx = reservationsTable?.totalPages ?? 1;
    const currentPageNum = reservationsTable?.page ?? 1;
    const totalElements = reservationsTable?.totalElements ?? 0;
    if (totalElements > 0 && lastIdx >= 1 && lastIdx !== currentPageNum) {
      const from = '2025-07-07';
      const to = '2025-07-15';
      await getReservationsTable(from, to, lastIdx, itemsPerPage);
    }
  };

  return {
    reservationsTable,
    visibleReservations,
    startIndex,
    totalDisplay,
    currentPage,
    itemsPerPage,
    getReservationsTable,
    goFirst,
    goPrev,
    goNext,
    goLast,
  };
}
