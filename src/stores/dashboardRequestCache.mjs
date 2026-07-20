export function createAsyncKeyedCache() {
  const values = new Map();
  const requests = new Map();
  const versions = new Map();

  function getOrLoad(key, loader) {
    if (values.has(key)) return Promise.resolve(values.get(key));

    const existingRequest = requests.get(key);
    if (existingRequest) return existingRequest;

    const version = versions.get(key) ?? 0;
    const request = Promise.resolve()
      .then(loader)
      .then((value) => {
        if ((versions.get(key) ?? 0) === version) {
          values.set(key, value);
        }
        return value;
      })
      .finally(() => {
        if (requests.get(key) === request) {
          requests.delete(key);
        }
      });

    requests.set(key, request);
    return request;
  }

  function deleteKey(key) {
    values.delete(key);
    requests.delete(key);
    versions.set(key, (versions.get(key) ?? 0) + 1);
  }

  return {
    has: (key) => values.has(key),
    get: (key) => values.get(key),
    getOrLoad,
    delete: deleteKey,
  };
}
