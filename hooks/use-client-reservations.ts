import { ClientReservationsResponse } from "@/interfaces/client-reservations";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Filters {
  dateStart: string;
  dateEnd: string;
}

export function useClientReservations(clientId: string) {
  const [reservationsResponse, setReservationsResponse] = useState<ClientReservationsResponse>();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    dateStart: '2025-07-07',
    dateEnd: '2025-07-20',
  });
  const itemsPerPage = 10;

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const getClientReservations = async (
    dateStart: string,
    dateEnd: string,
    page: number = 0,
    size: number = 10
  ) => {
    try {
      if (!clientId) return;
      if (!token) throw new Error("No hay token, inicia sesión");
      
      const url = new URL(`${API_BASE_URL}/reports/clients/${clientId}/reservations`);
      url.searchParams.set('from', dateStart);
      url.searchParams.set('to', dateEnd);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('size', size.toString());
      url.searchParams.set('sortBy', 'RESERVATION_DATE');
      url.searchParams.set('sortDir', 'DESC');
      
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener reservaciones del cliente");
      const data: ClientReservationsResponse = await res.json();
      setReservationsResponse(data);
      setCurrentPage(page + 1);
      setCurrentFilters({ dateStart, dateEnd });
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const visibleReservations = reservationsResponse?.data ?? [];
  const startIndex = ((reservationsResponse?.page ?? 0) * (reservationsResponse?.size ?? itemsPerPage)) + 1;
  const totalDisplay = reservationsResponse?.totalElements ?? 0;

  const goFirst = async () => {
    const page = 0;
    await getClientReservations(
      currentFilters.dateStart,
      currentFilters.dateEnd,
      page,
      itemsPerPage
    );
  };

  const goPrev = async () => {
    const curr = reservationsResponse?.page ?? 0;
    if (curr > 0) {
      const nextPage = curr - 1;
      await getClientReservations(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        nextPage,
        itemsPerPage
      );
    }
  };

  const goNext = async () => {
    const curr = reservationsResponse?.page ?? 0;
    const lastIdx = (reservationsResponse?.totalPages ?? 1) - 1;
    if (curr < lastIdx) {
      const nextPage = curr + 1;
      await getClientReservations(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        nextPage,
        itemsPerPage
      );
    }
  };

  const goLast = async () => {
    const lastIdx = (reservationsResponse?.totalPages ?? 1) - 1;
    if (lastIdx >= 0 && (reservationsResponse?.page ?? 0) !== lastIdx) {
      await getClientReservations(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        lastIdx,
        itemsPerPage
      );
    }
  };

  return {
    reservationsResponse,
    visibleReservations,
    startIndex,
    totalDisplay,
    currentPage,
    itemsPerPage,
    getClientReservations,
    goFirst,
    goPrev,
    goNext,
    goLast,
  };
}

