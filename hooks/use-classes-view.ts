import { ReservationTable } from "@/interfaces/reservation-table";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Filters {
  dateStart: string;
  dateEnd: string;
  instructor?: string;
  client?: string;
  discipline?: string;
}

export function useClassesView() {
  const [reservationsTable, setReservationsTable] = useState<ReservationTable>();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    dateStart: '2025-07-07',
    dateEnd: '2025-07-15',
  });
  const itemsPerPage = 10;

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const getReservationsTable = async (
    dateStart: string,
    dateEnd: string,
    page: number = 0,
    size: number = 10,
    instructor?: string,
    client?: string,
    discipline?: string
  ) => {
    try {
      if (!token) throw new Error("No hay token, inicia sesión");
      
      // Build URL with base parameters
      const url = new URL(`${API_BASE_URL}/reports/reservations/table`);
      url.searchParams.set('from', dateStart);
      url.searchParams.set('to', dateEnd);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('size', size.toString());
      url.searchParams.set('sortBy', 'RESERVATION_DATE');
      url.searchParams.set('sortDir', 'ASC');
      
      // Add optional filters only if they are provided
      if (instructor && instructor.trim() !== '') {
        url.searchParams.set('instructor', instructor.trim());
      }
      if (client && client.trim() !== '') {
        url.searchParams.set('client', client.trim());
      }
      if (discipline && discipline.trim() !== '') {
        url.searchParams.set('discipline', discipline.trim());
      }
      
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener reservaciones");
      const data: ReservationTable = await res.json();
      setReservationsTable(data);
      setCurrentPage(page + 1);
      
      // Save current filters for navigation
      setCurrentFilters({ dateStart, dateEnd, instructor, client, discipline });
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const visibleReservations = reservationsTable?.data ?? [];
  const startIndex = ((reservationsTable?.page ?? 0) * (reservationsTable?.size ?? itemsPerPage)) + 1;
  const totalDisplay = reservationsTable?.totalElements ?? 0;

  const goFirst = async () => {
    const page = 0;
    await getReservationsTable(
      currentFilters.dateStart,
      currentFilters.dateEnd,
      page,
      itemsPerPage,
      currentFilters.instructor,
      currentFilters.client,
      currentFilters.discipline
    );
  };

  const goPrev = async () => {
    const curr = reservationsTable?.page ?? 0;
    if (curr > 0) {
      const nextPage = curr - 1;
      await getReservationsTable(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        nextPage,
        itemsPerPage,
        currentFilters.instructor,
        currentFilters.client,
        currentFilters.discipline
      );
    }
  };

  const goNext = async () => {
    const curr = reservationsTable?.page ?? 0;
    const lastIdx = (reservationsTable?.totalPages ?? 1) - 1;
    if (curr < lastIdx) {
      const nextPage = curr + 1;
      await getReservationsTable(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        nextPage,
        itemsPerPage,
        currentFilters.instructor,
        currentFilters.client,
        currentFilters.discipline
      );
    }
  };

  const goLast = async () => {
    const lastIdx = (reservationsTable?.totalPages ?? 1) - 1;
    if (lastIdx >= 0 && (reservationsTable?.page ?? 0) !== lastIdx) {
      await getReservationsTable(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        lastIdx,
        itemsPerPage,
        currentFilters.instructor,
        currentFilters.client,
        currentFilters.discipline
      );
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
