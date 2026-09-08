import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OfficeSetup } from "@/components/app/office-setup";
import { PageHeader } from "@/components/app/page-header";

export const metadata = {
  title: "Escritório",
};

export default async function OfficeSetupPage() {
  const session = await auth.protect();

  if (session.orgId) {
    redirect("/app");
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 px-6 py-16">
      <PageHeader
        description="Crie um escritório ou entre em um existente. Casos, dossiês e petições ficam nesse recorte."
        eyebrow="Acesso"
        title="Escolha um escritório"
      />
      <OfficeSetup />
    </main>
  );
}
