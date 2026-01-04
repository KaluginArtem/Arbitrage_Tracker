const ASSET_ALIASES: Record<string, string> = {
  XBT: "BTC",
  XDG: "DOGE",
  BCHABC: "BCH",
  BCHSV: "BCH",
};

export function canonicalAsset(a: string): string {
  return ASSET_ALIASES[a] ?? a;
}
