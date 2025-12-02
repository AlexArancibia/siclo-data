"use client";

import { getDefaultMonthDateRange } from "@/lib/format-date";
import { createContext, useContext, useState } from "react";

const { from: DEFAULT_DATE_FROM, to: DEFAULT_DATE_TO } = getDefaultMonthDateRange();

type DateContextType = {
  startDate: string | null;
  endDate: string | null;
  setStartDate: (date: string | null) => void;
  setEndDate: (date: string | null) => void;
  resetDates: () => void;
};

const DateContext = createContext<DateContextType | null>(null);

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [startDate, setStartDate] = useState<string | null>(DEFAULT_DATE_FROM);
  const [endDate, setEndDate] = useState<string | null>(DEFAULT_DATE_TO);

  const resetDates = () => {
    setStartDate(DEFAULT_DATE_FROM);
    setEndDate(DEFAULT_DATE_TO);
  };

  return (
    <DateContext.Provider
      value={{
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        resetDates,
      }}
    >
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const ctx = useContext(DateContext);
  if (!ctx) {
    throw new Error("useDate must be used inside DateProvider");
  }
  return ctx;
}
