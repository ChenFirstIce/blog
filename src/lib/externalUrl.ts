const hasProtocol = /^[a-z][a-z\d+\-.]*:\/\//i;

export const toExternalUrl = (url: string) => {
  const trimmed = url.trim();
  return hasProtocol.test(trimmed) ? trimmed : `https://${trimmed}`;
};
