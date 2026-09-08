import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OfficeSetup } from "@/components/app/office-setup";

export default async function OfficeSetupPage() {
  const session = await auth();

  if (!session.userId) {
    redirect("/sign-in");
  }

  if (session.orgId) {
    redirect("/app");
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Escolha um Escritório</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Crie um escritório ou entre em um existente para continuar.
        </p>
      </div>
      <OfficeSetup />
    </main>
  );
}
