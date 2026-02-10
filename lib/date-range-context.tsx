"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { subDays, startOfDay, endOfDay, subMonths, startOfMonth, startOfYear } from "date-fns";

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

interface DateRangeContextType {
  range: DateRange;
  setRange: (range: DateRange) => void;
  presets: DateRange[];
}

const defaultRange: DateRange = {
  from: subDays(new Date(), 30),
  to: new Date(),
  label: "Last 30 days",
};

const presets: DateRange[] = [
  { from: subDays(new Date(), 7), to: new Date(), label: "Last 7 days" },
  { from: subDays(new Date(), 14), to: new Date(), label: "Last 14 days" },
  { from: subDays(new Date(), 30), to: new Date(), label: "Last 30 days" },
  { from: subDays(new Date(), 90), to: new Date(), label: "Last 90 days" },
  { from: startOfMonth(new Date()), to: new Date(), label: "This month" },
  { from: startOfMonth(subMonths(new Date(), 1)), to: endOfDay(subDays(startOfMonth(new Date()), 1)), label: "Last month" },
  { from: startOfYear(new Date()), to: new Date(), label: "Year to date" },
];

const DateRangeContext = createContext<DateRangeContextType>({
  range: defaultRange,
  setRange: () => {},
  presets,
});

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [range, setRangeState] = useState<DateRange>(defaultRange);

  const setRange = useCallback((newRange: DateRange) => {
    setRangeState({
      from: startOfDay(newRange.from),
      to: endOfDay(newRange.to),
      label: newRange.label,
    });
  }, []);

  return (
    <DateRangeContext.Provider value={{ range, setRange, presets }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  return useContext(DateRangeContext);
}
