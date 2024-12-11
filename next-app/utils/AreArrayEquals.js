const areArraysEqual = (arr1, arr2) => {
  // Check if arrays are the same reference
  if (arr1 === arr2) return true;

  // Check if either is not an array or lengths differ
  if (
    !Array.isArray(arr1) ||
    !Array.isArray(arr2) ||
    arr1.length !== arr2.length
  ) {
    return false;
  }

  // Sort arrays if order doesn't matter
  // Note: modify the sort key based on your object structure
  const sortedArr1 = [...arr1].sort((a, b) =>
    JSON.stringify(a) > JSON.stringify(b) ? 1 : -1,
  );
  const sortedArr2 = [...arr2].sort((a, b) =>
    JSON.stringify(a) > JSON.stringify(b) ? 1 : -1,
  );

  // Compare each object in the arrays
  return sortedArr1.every((item, index) => {
    const obj1 = sortedArr1[index];
    const obj2 = sortedArr2[index];

    // Compare object keys
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    // Check if all properties are equal
    return keys1.every((key) => {
      const val1 = obj1[key];
      const val2 = obj2[key];

      // Handle nested objects/arrays
      if (typeof val1 === "object" && val1 !== null) {
        return JSON.stringify(val1) === JSON.stringify(val2);
      }

      return val1 === val2;
    });
  });
};

export default areArraysEqual;
