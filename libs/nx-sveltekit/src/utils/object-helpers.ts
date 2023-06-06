export function filterObjectByExclusions(
  obj: Record<string, string>,
  exclusions: string[]
) {
  const filteredObject = {};

  for (const [key, value] of Object.entries(obj)) {
    if (
      !exclusions.some((pattern) => {
        if (pattern.endsWith('*')) {
          return key.startsWith(pattern.slice(0, -1));
        } else {
          return key === pattern;
        }
      })
    ) {
      filteredObject[key] = value;
    }
  }

  return filteredObject;
}

export function filterUndefinedAndNullValues(obj: Record<string, unknown>) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
}
