import { Source_Serif_4 } from "next/font/google";
import { auth } from "@clerk/nextjs/server";
import { AppChrome } from "@/components/app/app-chrome";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    default: "Escritório",
    template: "%s · Precedent Intelligence",
  },
};

export default async function AppLayout({
  children,
}: LayoutProps<"/app">) {
  const session = await auth.protect();

  return (
    <div
      className={`${sourceSerif.variable} app-desk flex min-h-svh flex-1 flex-col`}
    >
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        href="#conteudo"
      >
        Ir para o conteúdo
      </a>
      <AppChrome hasOffice={Boolean(session.orgId)} />
      <div className="flex min-h-0 flex-1 flex-col" id="conteudo">
        {children}
      </div>
    </div>
  );
}
