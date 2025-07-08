import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface MonthlyReturn {
  date: string;
  sodefi_return: number;
  reference_return: number;
}

export interface PerformanceDataPoint {
  point_date: string;
  sodefi_value: number;
  reference_value: number;
}

export function calculateCumulativePerformance(monthlyReturns: MonthlyReturn[]): PerformanceDataPoint[] {
  if (monthlyReturns.length === 0) {
    return [];
  }

  // Ensure dates are parsed as UTC to avoid timezone issues
  const parseDateUTC = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };

  monthlyReturns.sort((a, b) => parseDateUTC(a.date).getTime() - parseDateUTC(b.date).getTime());

  const monthYearFormatter = new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });

  let cumulativeSodefi = 100;
  let cumulativeReference = 100;

  const performanceData: PerformanceDataPoint[] = monthlyReturns.map(monthlyReturn => {
    cumulativeSodefi *= (1 + monthlyReturn.sodefi_return);
    cumulativeReference *= (1 + monthlyReturn.reference_return);
    
    return {
      point_date: monthYearFormatter.format(parseDateUTC(monthlyReturn.date)),
      sodefi_value: cumulativeSodefi,
      reference_value: cumulativeReference,
    };
  });
  
  // Create the starting point for the month prior to the first return
  const firstReturnDate = parseDateUTC(monthlyReturns[0].date);
  const inceptionDate = new Date(Date.UTC(firstReturnDate.getUTCFullYear(), firstReturnDate.getUTCMonth(), 0));

  performanceData.unshift({
    point_date: monthYearFormatter.format(inceptionDate),
    sodefi_value: 100,
    reference_value: 100
  });

  return performanceData;
}