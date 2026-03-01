import { z } from "zod";

export const PageConfigSchema = z.object({
  path: z.string().startsWith("/", { message: 'Page path must start with "/"' }),
  name: z.string().optional(),
});

export const OutputConfigSchema = z.object({
  format: z.enum(["json", "html", "sarif", "markdown", "junit"]),
  path: z.string().min(1, { message: "Output path must not be empty" }),
  minify: z.boolean().optional().default(false),
});

export const ThresholdConfigSchema = z
  .object({
    /**
     * Minimum compliance rate from 0 to 100.
     * 0 means CI/CD is never blocked — the report is still generated.
     */
    complianceRate: z
      .number()
      .min(0, { message: "complianceRate must be >= 0" })
      .max(100, { message: "complianceRate must be <= 100" })
      .optional()
      .default(0),
    failOn: z.enum(["error", "threshold", "none"]).optional().default("threshold"),
  })
  .optional();

/** Default glob patterns for static analysis — shared between schema defaults and config generator. */
export const DEFAULT_STATIC_INCLUDE = ["src/**/*.{tsx,jsx,ts,js}"];
export const DEFAULT_STATIC_EXCLUDE = ["**/*.test.*", "**/*.spec.*", "**/node_modules/**"];

export const StaticConfigSchema = z
  .object({
    include: z.array(z.string()).optional().default(DEFAULT_STATIC_INCLUDE),
    exclude: z.array(z.string()).optional().default(DEFAULT_STATIC_EXCLUDE),
  })
  .optional();

const CRITERION_FORMAT_RE = /^\d+\.\d+$/;

export const ExemptionConfigSchema = z.object({
  criterion: z
    .string()
    .regex(CRITERION_FORMAT_RE, { message: 'criterion must be in the format "X.Y" (e.g., "4.1")' }),
  reason: z.string().min(10, { message: "Exemption reason must be at least 10 characters" }),
});

export const KodaRGAAConfigSchema = z.object({
  baseUrl: z
    .string()
    .url({ message: "baseUrl must be a valid URL (e.g., http://localhost:3000)" })
    .refine((url) => /^https?:\/\//.test(url), {
      message: "baseUrl must use http:// or https:// protocol",
    }),
  pages: z.array(PageConfigSchema).min(1, { message: "At least one page must be configured" }),
  output: z
    .array(OutputConfigSchema)
    .min(1, { message: "At least one output format must be configured" }),
  thresholds: ThresholdConfigSchema,
  exemptions: z.array(ExemptionConfigSchema).optional().default([]),
  locale: z.string().optional().default("en-US"),
  projectName: z.string().optional(),
  static: StaticConfigSchema,
});

export type ValidatedConfig = z.infer<typeof KodaRGAAConfigSchema>;
