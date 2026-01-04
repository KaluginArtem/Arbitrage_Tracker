export function canonicalAsset(a: string): string {
  const up = a.toUpperCase();

  // Kraken-style / alias mapping
  if (up === "XBT") return "BTC";
  if (up === "XDG") return "DOGE";

  // Polygon rename
  if (up === "POL") return "POL"; // можно свести MATIC/POL по твоему решению
  if (up === "MATIC") return "MATIC";

  return up;
}

export function canonicalKrakenSymbol(pair: string): string {
  return pair
    .replace(/^XBT/, "BTC")
    .replace(/^XDG/, "DOGE");
}
