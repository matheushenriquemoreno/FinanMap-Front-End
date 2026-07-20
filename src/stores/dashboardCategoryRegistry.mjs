export function createDashboardCategoryRegistry(initialTypes = []) {
  const requested = new Set(initialTypes);

  function request(type) {
    requested.add(type);
  }

  function requestedTypes() {
    return [...requested];
  }

  function merge(current, incoming) {
    return { ...current, ...incoming };
  }

  return {
    request,
    requestedTypes,
    merge,
  };
}
