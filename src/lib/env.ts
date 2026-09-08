import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CURSOR_API_KEY: z.string().min(1),
  JURISPRUDENCIAS_API_KEY: z.string().min(1),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}

export function getPublicEnv() {
  return publicEnvSchema.parse(process.env);
}

export function readCursorApiKey(): string {
  return process.env.CURSOR_API_KEY ?? "";
}

export function readJurisprudenciasApiKey(): string {
  return process.env.JURISPRUDENCIAS_API_KEY ?? "";
}

export function hasServerEnv(): boolean {
  return serverEnvSchema.safeParse(process.env).success;
}
