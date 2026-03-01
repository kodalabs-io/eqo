/**
 * Structured error types for programmatic API consumers.
 */

export class ConfigError extends Error {
  readonly code = "CONFIG_ERROR" as const;
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export class AnalysisError extends Error {
  readonly code = "ANALYSIS_ERROR" as const;
  constructor(message: string) {
    super(message);
    this.name = "AnalysisError";
  }
}

export class TimeoutError extends Error {
  readonly code = "TIMEOUT_ERROR" as const;
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}
