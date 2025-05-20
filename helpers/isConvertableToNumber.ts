export const isConvertableToNumber = (string: string | undefined): boolean => {
  if (!string || typeof string !== 'string' || string.trim() === '') {
    return false;
  }

  const numbericString = Number(string);

  return !Number.isNaN(numbericString) && Number.isFinite(numbericString);
};
