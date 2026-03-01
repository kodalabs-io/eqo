export function warn(module: string, message: string): void {
  console.warn(`[eqo:${module}] ${message}`);
}

export function error(module: string, message: string): void {
  console.error(`[eqo:${module}] ${message}`);
}
