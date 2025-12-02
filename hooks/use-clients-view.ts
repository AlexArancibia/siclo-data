import { ClientTable } from "@/interfaces/client-table";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Filters {
  dateStart: string;
  dateEnd: string;
  client?: string;
}

export function useClientsView() {
  const [clientsTable, setClientsTable] = useState<ClientTable>();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    dateStart: '2025-07-07',
    dateEnd: '2025-07-20',
  });
  const itemsPerPage = 20;

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const getClientsTable = async (
    dateStart: string,
    dateEnd: string,
    page: number = 0,
    size: number = 50,
    client?: string,
    sortByAmountDesc?: boolean,
  ) => {
    try {
      if (!token) throw new Error("No hay token, inicia sesión");
      
      // Build URL with base parameters
      const url = new URL(`${API_BASE_URL}/reports/clients`);
      url.searchParams.set('from', dateStart);
      url.searchParams.set('to', dateEnd);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('size', size.toString());

      if (sortByAmountDesc) {
        url.searchParams.set('sortField', 'total_amount_received');
      }
      
      // Add optional client filter only if provided
      if (client && client.trim() !== '') {
        url.searchParams.set('client', client.trim());
      }
      
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener clientes");
      const data: ClientTable = await res.json();
      setClientsTable(data);
      setCurrentPage(page + 1);
      setCurrentFilters({ dateStart, dateEnd, client });
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const visibleClients = clientsTable?.data ?? [];
  const startIndex = ((clientsTable?.page ?? 0) * (clientsTable?.size ?? itemsPerPage)) + 1;
  const totalDisplay = clientsTable?.totalElements ?? 0;

  const goFirst = async (includesOrder: boolean) => {
    const page = 0;
    await getClientsTable(
      currentFilters.dateStart,
      currentFilters.dateEnd,
      page,
      itemsPerPage,
      currentFilters.client,
      includesOrder
    );
  };

  const goPrev = async (includesOrder: boolean) => {
    const curr = clientsTable?.page ?? 0;
    if (curr > 0) {
      const nextPage = curr - 1;
      await getClientsTable(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        nextPage,
        itemsPerPage,
        currentFilters.client,
        includesOrder
      );
    }
  };

  const goNext = async (includesOrder: boolean) => {
    const curr = clientsTable?.page ?? 0;
    const lastIdx = (clientsTable?.totalPages ?? 1) - 1;
    if (curr < lastIdx) {
      const nextPage = curr + 1;
      await getClientsTable(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        nextPage,
        itemsPerPage,
        currentFilters.client,
        includesOrder
      );
    }
  };

  const goLast = async (includesOrder: boolean) => {
    const lastIdx = (clientsTable?.totalPages ?? 1) - 1;
    if (lastIdx >= 0 && (clientsTable?.page ?? 0) !== lastIdx) {
      await getClientsTable(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        lastIdx,
        itemsPerPage,
        currentFilters.client,
        includesOrder
      );
    }
  };

  return {
    clientsTable,
    visibleClients,
    startIndex,
    totalDisplay,
    currentPage,
    itemsPerPage,
    getClientsTable,
    goFirst,
    goPrev,
    goNext,
    goLast,
  };
}

