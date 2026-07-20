import type { DashboardCategoryRegistry } from './dashboardCategoryRegistry.mjs';
import type { AsyncKeyedCache } from './dashboardRequestCache.mjs';

export interface DashboardSnapshot<TSummary, TEvolution, TType extends PropertyKey, TCategory> {
  summary: TSummary;
  evolution: TEvolution;
  categories: Partial<Record<TType, TCategory[]>>;
}

interface DashboardSnapshotLoaderOptions<
  TSummary,
  TEvolution,
  TType extends PropertyKey,
  TCategory,
> {
  dashboardCache: AsyncKeyedCache<DashboardSnapshot<TSummary, TEvolution, TType, TCategory>>;
  categoryCache: AsyncKeyedCache<TCategory[]>;
  categoryRegistry: DashboardCategoryRegistry<TType, TCategory[]>;
  loadSummary(start: string, end: string): Promise<TSummary>;
  loadEvolution(start: string, end: string): Promise<TEvolution>;
  loadCategories(start: string, end: string, type: TType): Promise<TCategory[]>;
}

export interface DashboardSnapshotLoader<
  TSummary,
  TEvolution,
  TType extends PropertyKey,
  TCategory,
> {
  load(
    periodKey: string,
    start: string,
    end: string,
  ): Promise<DashboardSnapshot<TSummary, TEvolution, TType, TCategory>>;
  loadCategory(periodKey: string, start: string, end: string, type: TType): Promise<TCategory[]>;
  invalidate(periodKey: string): void;
}

export function createDashboardSnapshotLoader<
  TSummary,
  TEvolution,
  TType extends PropertyKey,
  TCategory,
>(
  options: DashboardSnapshotLoaderOptions<TSummary, TEvolution, TType, TCategory>,
): DashboardSnapshotLoader<TSummary, TEvolution, TType, TCategory>;
