import { Payment, PaymentTable } from "@/interfaces/payment-table";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function usePaymentsView() {
  const [paymentsTable, setPaymentsTable] = useState<PaymentTable>();
  const [allPurchases, setAllPurchases] = useState<Payment[] | null>(null);
  const [isClientFiltering, setIsClientFiltering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedPaymentTypeFilter, setAppliedPaymentTypeFilter] = useState("all");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
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
    } catch (err: any) {
      console.log(err.message);
    }
  };

  const fetchAllPayments = async (from: string, to: string) => {
    try {
      if (!API_BASE_URL || !token) return [] as Payment[];
      const pageSize = 100;
      const firstRes = await fetch(`${API_BASE_URL}/reports/payments/table?from=${from}&to=${to}&page=0&size=${pageSize}&sortBy=ACCREDITATION_DATE&sortDir=ASC`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!firstRes.ok) return [] as Payment[];
      const firstData = await firstRes.json();
      const totalPages: number = firstData.totalPages ?? 1;
      const all: Payment[] = [...(firstData.data ?? [])];
      if (totalPages > 1) {
        const requests: Promise<Response>[] = [];
        for (let p = 1; p < totalPages; p++) {
          requests.push(fetch(`${API_BASE_URL}/reports/payments/table?from=${from}&to=${to}&page=${p}&size=${pageSize}&sortBy=ACCREDITATION_DATE&sortDir=ASC`, {
            headers: { Authorization: `Bearer ${token}` },
          }));
        }
        const responses = await Promise.all(requests);
        const jsons = await Promise.all(responses.filter(r => r.ok).map(r => r.json()));
        jsons.forEach(j => {
          if (Array.isArray(j?.data)) all.push(...j.data);
        });
      }
      return all;
    } catch {
      return [] as Payment[];
    }
  };

  const applyFilters = async (params: { searchTerm?: string; paymentType?: string; dateFrom?: string; dateTo?: string; }) => {
    const { searchTerm = "", paymentType = "all", dateFrom = "", dateTo = "" } = params;
    setAppliedSearchTerm(searchTerm);
    setAppliedPaymentTypeFilter(paymentType);
    setAppliedDateFrom(dateFrom);
    setAppliedDateTo(dateTo);
    setCurrentPage(1);
    const from = dateFrom || '2025-07-07';
    const to = dateTo || '2025-07-11';
    const hasFilters = (searchTerm.trim() !== "") || (paymentType !== "all") || (dateFrom !== "") || (dateTo !== "");
    if (hasFilters) {
      setIsClientFiltering(true);
      const all = await fetchAllPayments(from, to);
      setAllPurchases(all);
    } else {
      setIsClientFiltering(false);
      setAllPurchases(null);
      await getPaymentTable(from, to, 0, itemsPerPage);
    }
  };

  const clearFilters = async () => {
    setAppliedSearchTerm("");
    setAppliedPaymentTypeFilter("all");
    setAppliedDateFrom("");
    setAppliedDateTo("");
    setCurrentPage(1);
    setIsClientFiltering(false);
    setAllPurchases(null);
    await getPaymentTable('2025-07-07', '2025-07-11', 0, itemsPerPage);
  };

  const hasActiveFilters =
    appliedSearchTerm !== "" ||
    appliedPaymentTypeFilter !== "all" ||
    appliedDateFrom !== "" ||
    appliedDateTo !== "";

  const apiPurchases = paymentsTable?.data ?? [];
  const basePurchases: Payment[] = (isClientFiltering && allPurchases) ? allPurchases : apiPurchases;
  const filteredPurchases = basePurchases.filter((purchase) => {
    const search = (appliedSearchTerm || "").toLowerCase();
    const matchesSearch =
      (purchase.clientInfo?.name || "").toLowerCase().includes(search) ||
      (purchase.clientInfo?.email || "").toLowerCase().includes(search) ||
      String(purchase.operationId ?? "").toLowerCase().includes(search) ||
      (purchase.packageName?.toLowerCase() ?? "").includes(search);
    const matchesPaymentType = appliedPaymentTypeFilter === "all" || (purchase.paymentMethod || "") === appliedPaymentTypeFilter;

    let matchesDate = true;
    if (appliedDateFrom || appliedDateTo) {
      const purchaseDateMs = purchase.purchaseDate ? new Date(purchase.purchaseDate).getTime() : undefined;
      if (appliedDateFrom) {
        const fromMs = new Date(appliedDateFrom).getTime();
        matchesDate = matchesDate && purchaseDateMs !== undefined && purchaseDateMs >= fromMs;
      }
      if (appliedDateTo) {
        const toMs = new Date(appliedDateTo).getTime();
        matchesDate = matchesDate && purchaseDateMs !== undefined && purchaseDateMs <= toMs;
      }
    }

    return matchesSearch && matchesPaymentType && matchesDate;
  });

  const clientTotalPages = Math.max(1, Math.ceil(filteredPurchases.length / itemsPerPage));
  const visiblePurchases = isClientFiltering
    ? filteredPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredPurchases;
  const startIndex = isClientFiltering
    ? ((currentPage - 1) * itemsPerPage) + 1
    : (((paymentsTable?.page ?? 0) * (paymentsTable?.size ?? itemsPerPage)) + 1);
  const totalDisplay = isClientFiltering ? filteredPurchases.length : (paymentsTable?.totalElements ?? filteredPurchases.length);

  const uniquePaymentTypes = [...new Set(basePurchases.map((p) => p.paymentMethod))];

  const goFirst = async () => {
    if (isClientFiltering) {
      setCurrentPage(1);
    } else {
      if ((paymentsTable?.page ?? 0) > 0) {
        const from = appliedDateFrom || '2025-07-07';
        const to = appliedDateTo || '2025-07-11';
        setCurrentPage(1);
        await getPaymentTable(from, to, 0, itemsPerPage);
      }
    }
  };
  const goPrev = async () => {
    if (isClientFiltering) {
      setCurrentPage((p) => Math.max(1, p - 1));
    } else {
      const curr = paymentsTable?.page ?? 0;
      if (curr > 0) {
        const nextPage = curr - 1;
        const from = appliedDateFrom || '2025-07-07';
        const to = appliedDateTo || '2025-07-11';
        setCurrentPage(nextPage + 1);
        await getPaymentTable(from, to, nextPage, itemsPerPage);
      }
    }
  };
  const goNext = async () => {
    if (isClientFiltering) {
      setCurrentPage((p) => Math.min(clientTotalPages, p + 1));
    } else {
      const curr = paymentsTable?.page ?? 0;
      const lastIdx = (paymentsTable?.totalPages ?? 1) - 1;
      if (curr < lastIdx) {
        const nextPage = curr + 1;
        const from = appliedDateFrom || '2025-07-07';
        const to = appliedDateTo || '2025-07-11';
        setCurrentPage(nextPage + 1);
        await getPaymentTable(from, to, nextPage, itemsPerPage);
      }
    }
  };
  const goLast = async () => {
    if (isClientFiltering) {
      setCurrentPage(clientTotalPages);
    } else {
      const lastIdx = (paymentsTable?.totalPages ?? 1) - 1;
      if (lastIdx >= 0 && (paymentsTable?.page ?? 0) !== lastIdx) {
        const from = appliedDateFrom || '2025-07-07';
        const to = appliedDateTo || '2025-07-11';
        setCurrentPage(lastIdx + 1);
        await getPaymentTable(from, to, lastIdx, itemsPerPage);
      }
    }
  };

  return {
    // data
    paymentsTable,
    visiblePurchases,
    filteredPurchases,
    startIndex,
    totalDisplay,
    uniquePaymentTypes,
    isClientFiltering,
    currentPage,
    clientTotalPages,
    itemsPerPage,
    // filters state (applied)
    appliedSearchTerm,
    appliedPaymentTypeFilter,
    appliedDateFrom,
    appliedDateTo,
    hasActiveFilters,
    // actions
    getPaymentTable,
    applyFilters,
    clearFilters,
    goFirst,
    goPrev,
    goNext,
    goLast,
    setCurrentPage,
  };
}
