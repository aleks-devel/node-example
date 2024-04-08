export function ceil(num: number, precision: number = 0) {
  let power = Math.pow(10, precision);

  return Math.ceil(num * power) / power;
}

export function floor(num: number, precision: number = 0) {
  let power = Math.pow(10, precision);

  return Math.floor(num * power) / power;
}

export function round(num: number, precision: number = 0) {
  let power = Math.pow(10, precision);

  return Math.round(num * power) / power;
}
