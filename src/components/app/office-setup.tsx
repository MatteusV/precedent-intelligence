"use client";

import { OrganizationList } from "@clerk/nextjs";

export function OfficeSetup() {
  return (
    <OrganizationList
      hidePersonal
      afterCreateOrganizationUrl="/app"
      afterSelectOrganizationUrl="/app"
    />
  );
}
