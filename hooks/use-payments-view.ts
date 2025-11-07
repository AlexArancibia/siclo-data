import { PaymentTable } from "@/interfaces/payment-table";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function usePaymentsView() {
  const [paymentsTable, setPaymentsTable] = useState<PaymentTable>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const getPaymentTable = async (dateStart: string, dateEnd: string, page: number = 0, size: number = 10) => {
    try {
      if (!token) throw new Error("No hay token, inicia sesión");
      const res = await fetch(`${API_BASE_URL}/reports/payments/table?from=${dateStart}&to=${dateEnd}&page=${page}&size=${size}&sortBy=ACCREDITATION_DATE&sortDir=ASC`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data: PaymentTable = await res.json();
      setPaymentsTable(data);
      setCurrentPage(page + 1);
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const visiblePurchases = paymentsTable?.data ?? [];
  const startIndex = ((paymentsTable?.page ?? 0) * (paymentsTable?.size ?? itemsPerPage)) + 1;
  const totalDisplay = paymentsTable?.totalElements ?? 0;

  const goFirst = async () => {
    const page = 0;
    const from = '2025-07-07';
    const to = '2025-07-11';
    await getPaymentTable(from, to, page, itemsPerPage);
  };

  const goPrev = async () => {
    const curr = paymentsTable?.page ?? 0;
    if (curr > 0) {
      const nextPage = curr - 1;
      const from = '2025-07-07';
      const to = '2025-07-11';
      await getPaymentTable(from, to, nextPage, itemsPerPage);
    }
  };

  const goNext = async () => {
    const curr = paymentsTable?.page ?? 0;
    const lastIdx = (paymentsTable?.totalPages ?? 1) - 1;
    if (curr < lastIdx) {
      const nextPage = curr + 1;
      const from = '2025-07-07';
      const to = '2025-07-11';
      await getPaymentTable(from, to, nextPage, itemsPerPage);
    }
  };

  const goLast = async () => {
    const lastIdx = (paymentsTable?.totalPages ?? 1) - 1;
    if (lastIdx >= 0 && (paymentsTable?.page ?? 0) !== lastIdx) {
      const from = '2025-07-07';
      const to = '2025-07-11';
      await getPaymentTable(from, to, lastIdx, itemsPerPage);
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
