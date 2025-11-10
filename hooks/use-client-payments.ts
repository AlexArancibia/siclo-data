import { ClientPaymentsResponse } from "@/interfaces/client-payments";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Filters {
  dateStart: string;
  dateEnd: string;
}

export function useClientPayments(clientId: string) {
  const [paymentsResponse, setPaymentsResponse] = useState<ClientPaymentsResponse>();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    dateStart: '2025-01-01',
    dateEnd: '2025-09-20',
  });
  const itemsPerPage = 10;

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const getClientPayments = async (
    dateStart: string,
    dateEnd: string,
    page: number = 0,
    size: number = 10
  ) => {
    try {
      if (!clientId) return;
      if (!token) throw new Error("No hay token, inicia sesión");
      
      const url = new URL(`${API_BASE_URL}/reports/clients/${clientId}/payments`);
      url.searchParams.set('from', dateStart);
      url.searchParams.set('to', dateEnd);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('size', size.toString());
      url.searchParams.set('sortBy', 'ACCREDITATION_DATE');
      url.searchParams.set('sortDir', 'DESC');
      
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener pagos del cliente");
      const data: ClientPaymentsResponse = await res.json();
      setPaymentsResponse(data);
      setCurrentPage(page + 1);
      setCurrentFilters({ dateStart, dateEnd });
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const visiblePayments = paymentsResponse?.data ?? [];
  const startIndex = ((paymentsResponse?.page ?? 0) * (paymentsResponse?.size ?? itemsPerPage)) + 1;
  const totalDisplay = paymentsResponse?.totalElements ?? 0;

  const goFirst = async () => {
    const page = 0;
    await getClientPayments(
      currentFilters.dateStart,
      currentFilters.dateEnd,
      page,
      itemsPerPage
    );
  };

  const goPrev = async () => {
    const curr = paymentsResponse?.page ?? 0;
    if (curr > 0) {
      const nextPage = curr - 1;
      await getClientPayments(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        nextPage,
        itemsPerPage
      );
    }
  };

  const goNext = async () => {
    const curr = paymentsResponse?.page ?? 0;
    const lastIdx = (paymentsResponse?.totalPages ?? 1) - 1;
    if (curr < lastIdx) {
      const nextPage = curr + 1;
      await getClientPayments(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        nextPage,
        itemsPerPage
      );
    }
  };

  const goLast = async () => {
    const lastIdx = (paymentsResponse?.totalPages ?? 1) - 1;
    if (lastIdx >= 0 && (paymentsResponse?.page ?? 0) !== lastIdx) {
      await getClientPayments(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        lastIdx,
        itemsPerPage
      );
    }
  };

  return {
    paymentsResponse,
    visiblePayments,
    startIndex,
    totalDisplay,
    currentPage,
    itemsPerPage,
    getClientPayments,
    goFirst,
    goPrev,
    goNext,
    goLast,
  };
}

