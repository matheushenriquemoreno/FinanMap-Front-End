export interface DashboardCategoryRegistry<TType extends PropertyKey, TValue> {
  request(type: TType): void;
  requestedTypes(): TType[];
  merge(
    current: Partial<Record<TType, TValue>>,
    incoming: Partial<Record<TType, TValue>>,
  ): Partial<Record<TType, TValue>>;
}

export function createDashboardCategoryRegistry<TType extends PropertyKey, TValue = unknown>(
  initialTypes?: readonly TType[],
): DashboardCategoryRegistry<TType, TValue>;
