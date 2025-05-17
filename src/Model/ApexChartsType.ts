// types.ts
import type { ApexOptions } from 'apexcharts';

export interface MetricCardProps {
  title: string;
  value: number;
  chartData: number[];
  chartColor?: string;
}

export interface ChartSeries {
  name: string;
  data: number[];
}

export interface ApexChartProps {
  series: ChartSeries[];
  chartOptions?: Partial<ApexOptions>;
  chartColor?: string;
}

export interface DashboardData {
  salesData: number[];
  expensesData: number[];
  profitsData: number[];
}

export interface ApiResponse {
  salesData: number[];
  expensesData: number[];
  profitsData: number[];
}
