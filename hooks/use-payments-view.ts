import { PaymentTable } from "@/interfaces/payment-table";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Filters {
  dateStart: string;
  dateEnd: string;
  client?: string;
  payment?: string;
}

export function usePaymentsView() {
  const [paymentsTable, setPaymentsTable] = useState<PaymentTable>();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    dateStart: '2025-07-07',
    dateEnd: '2025-07-11',
  });
  const itemsPerPage = 10;

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const getPaymentTable = async (
    dateStart: string,
    dateEnd: string,
    page: number = 0,
    size: number = 10,
    client?: string,
    payment?: string
  ) => {
    try {
      if (!token) throw new Error("No hay token, inicia sesión");
      
      // Build URL with base parameters
      const url = new URL(`${API_BASE_URL}/reports/payments/table`);
      url.searchParams.set('from', dateStart);
      url.searchParams.set('to', dateEnd);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('size', size.toString());
      url.searchParams.set('sortBy', 'ACCREDITATION_DATE');
      url.searchParams.set('sortDir', 'DESC');
      
      // Add optional filters only if they are provided
      if (client && client.trim() !== '') {
        url.searchParams.set('client', client.trim());
      }
      if (payment && payment !== 'all' && payment.trim() !== '') {
        url.searchParams.set('payment', payment.trim());
      }
      
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener pagos");
      const data: PaymentTable = await res.json();
      setPaymentsTable(data);
      setCurrentPage(page + 1);
      
      // Save current filters for navigation
      setCurrentFilters({ dateStart, dateEnd, client, payment });
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const visiblePurchases = paymentsTable?.data ?? [];
  const startIndex = ((paymentsTable?.page ?? 0) * (paymentsTable?.size ?? itemsPerPage)) + 1;
  const totalDisplay = paymentsTable?.totalElements ?? 0;

  const goFirst = async () => {
    const page = 0;
    await getPaymentTable(
      currentFilters.dateStart,
      currentFilters.dateEnd,
      page,
      itemsPerPage,
      currentFilters.client,
      currentFilters.payment
    );
  };

  const goPrev = async () => {
    const curr = paymentsTable?.page ?? 0;
    if (curr > 0) {
      const nextPage = curr - 1;
      await getPaymentTable(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        nextPage,
        itemsPerPage,
        currentFilters.client,
        currentFilters.payment
      );
    }
  };

  const goNext = async () => {
    const curr = paymentsTable?.page ?? 0;
    const lastIdx = (paymentsTable?.totalPages ?? 1) - 1;
    if (curr < lastIdx) {
      const nextPage = curr + 1;
      await getPaymentTable(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        nextPage,
        itemsPerPage,
        currentFilters.client,
        currentFilters.payment
      );
    }
  };

  const goLast = async () => {
    const lastIdx = (paymentsTable?.totalPages ?? 1) - 1;
    if (lastIdx >= 0 && (paymentsTable?.page ?? 0) !== lastIdx) {
      await getPaymentTable(
        currentFilters.dateStart,
        currentFilters.dateEnd,
        lastIdx,
        itemsPerPage,
        currentFilters.client,
        currentFilters.payment
      );
    }
  };

  return {
    paymentsTable,
    visiblePurchases,
    startIndex,
    totalDisplay,
    currentPage,
    itemsPerPage,
    getPaymentTable,
    goFirst,
    goPrev,
    goNext,
    goLast,
  };
}
