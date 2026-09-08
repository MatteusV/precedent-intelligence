import { BrandMark } from "@/components/brand-mark";

/**
 * Shared frame for Clerk sign-in and sign-up.
 */
export function AuthScreen({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-8 px-6 py-16">
      <BrandMark href="/" />
      {children}
    </main>
  );
}
