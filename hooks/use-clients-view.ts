import { ClientTable } from "@/interfaces/client-table";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useClientsView() {
  const [clientsTable, setClientsTable] = useState<ClientTable>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const getClientsTable = async (dateStart: string, dateEnd: string, page: number = 0, size: number = 50) => {
    try {
      if (!token) throw new Error("No hay token, inicia sesión");
      const res = await fetch(`${API_BASE_URL}/reports/clients?from=${dateStart}&to=${dateEnd}&page=${page}&size=${size}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener clientes");
      const data: ClientTable = await res.json();
      setClientsTable(data);
      setCurrentPage(page + 1);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const visibleClients = clientsTable?.data ?? [];
  const startIndex = ((clientsTable?.page ?? 0) * (clientsTable?.size ?? itemsPerPage)) + 1;
  const totalDisplay = clientsTable?.totalElements ?? 0;

  const goFirst = async () => {
    const page = 0;
    const from = '2025-07-07';
    const to = '2025-07-20';
    await getClientsTable(from, to, page, itemsPerPage);
  };

  const goPrev = async () => {
    const curr = clientsTable?.page ?? 0;
    if (curr > 0) {
      const nextPage = curr - 1;
      const from = '2025-07-07';
      const to = '2025-07-20';
      await getClientsTable(from, to, nextPage, itemsPerPage);
    }
  };

  const goNext = async () => {
    const curr = clientsTable?.page ?? 0;
    const lastIdx = (clientsTable?.totalPages ?? 1) - 1;
    if (curr < lastIdx) {
      const nextPage = curr + 1;
      const from = '2025-07-07';
      const to = '2025-07-20';
      await getClientsTable(from, to, nextPage, itemsPerPage);
    }
  };

  const goLast = async () => {
    const lastIdx = (clientsTable?.totalPages ?? 1) - 1;
    if (lastIdx >= 0 && (clientsTable?.page ?? 0) !== lastIdx) {
      const from = '2025-07-07';
      const to = '2025-07-20';
      await getClientsTable(from, to, lastIdx, itemsPerPage);
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

