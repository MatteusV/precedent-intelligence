import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { AppChrome } from "@/components/app/app-chrome";
import { AppChromeFallback } from "@/components/app/app-chrome-fallback";

export const metadata = {
  title: {
    default: "Escritório",
    template: "%s · Precedent Intelligence",
  },
};

export default function AppLayout({
  children,
}: LayoutProps<"/app">) {
  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        href="#conteudo"
      >
        Ir para o conteúdo
      </a>
      <Suspense fallback={<AppChromeFallback />}>
        <AppChromeWithAuth />
      </Suspense>
      <div className="flex min-h-0 flex-1 flex-col" id="conteudo">
        {children}
      </div>
    </div>
  );
}

async function AppChromeWithAuth() {
  const session = await auth.protect();

  return <AppChrome hasOffice={Boolean(session.orgId)} />;
}
