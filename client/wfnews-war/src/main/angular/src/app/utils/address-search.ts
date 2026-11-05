function getFullAddress(location) {
  let result = '';

  if (location.civicNumber) {
    result += location.civicNumber;
  }

  if (location.streetName) {
    result += ' ' + location.streetName;
  }

  if (location.streetQualifier) {
    result += ' ' + location.streetQualifier;
  }

  if (location.streetType) {
    result += ' ' + location.streetType;
  }

  return result;
}

/** Sets each result's `address`, and moves the ones that match the typed text to the front. */
export function sortAddressList(results: any, value: string) {
  let address = null;
  let trimmedAddress = null;
  let valueLength = null;
  let valueMatch = null;
  results.forEach((result) => {
    address = getFullAddress(result);
    result.address = address.trim();
    trimmedAddress = result.address;
    valueLength = value.length;
    if (trimmedAddress != null) {
      valueMatch = trimmedAddress.substring(0, valueLength);
    }

    if (
      address != null &&
      valueLength != null &&
      valueMatch != null &&
      (value.toUpperCase() === address.toUpperCase() ||
        value.toUpperCase() === valueMatch.toUpperCase())
    ) {
      const index = results.indexOf(result);
      if (index !== -1) {
        results.splice(index, 1);
      }
      const resultToBeUnshifted = result;

      results.unshift(resultToBeUnshifted);
    }
  });

  return results;
}
