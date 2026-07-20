export function createDashboardSnapshotLoader({
  dashboardCache,
  categoryCache,
  categoryRegistry,
  loadSummary,
  loadEvolution,
  loadCategories,
}) {
  function categoryKey(periodKey, type) {
    return `${periodKey}|${String(type)}`;
  }

  function loadCategory(periodKey, start, end, type) {
    return categoryCache.getOrLoad(categoryKey(periodKey, type), () =>
      loadCategories(start, end, type),
    );
  }

  async function load(periodKey, start, end) {
    const snapshot = await dashboardCache.getOrLoad(periodKey, async () => {
      const requestedTypes = categoryRegistry.requestedTypes();
      const [summary, evolution, categoryEntries] = await Promise.all([
        loadSummary(start, end),
        loadEvolution(start, end),
        Promise.all(
          requestedTypes.map(async (type) => [
            type,
            await loadCategory(periodKey, start, end, type),
          ]),
        ),
      ]);

      return {
        summary,
        evolution,
        categories: Object.fromEntries(categoryEntries),
      };
    });

    const missingTypes = categoryRegistry
      .requestedTypes()
      .filter((type) => snapshot.categories[type] === undefined);

    if (missingTypes.length === 0) return snapshot;

    const missingEntries = await Promise.all(
      missingTypes.map(async (type) => [type, await loadCategory(periodKey, start, end, type)]),
    );

    return {
      ...snapshot,
      categories: categoryRegistry.merge(snapshot.categories, Object.fromEntries(missingEntries)),
    };
  }

  function invalidate(periodKey) {
    dashboardCache.delete(periodKey);
    categoryRegistry
      .requestedTypes()
      .forEach((type) => categoryCache.delete(categoryKey(periodKey, type)));
  }

  return {
    load,
    loadCategory,
    invalidate,
  };
}
