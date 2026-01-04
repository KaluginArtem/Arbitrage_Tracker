import { ValidatorConfig } from "./index";

export const VALIDATOR_CFG: ValidatorConfig = {
  // пример — подстрой под твои поля
  minProfitPct: 0,       // минимум профита после комиссий
  maxTimeSkewMs: 10_000,         // хотя бы 1 стабильный тик
  minStableTicks: 0,    // максимум допустимого рассинхрона по времени
  minNotional: 0,           // минимальный объём (если проверяешь)
};
