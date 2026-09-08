import { shadcn } from "@clerk/ui/themes";

export const clerkAppearance = {
  theme: shadcn,
  variables: {
    borderRadius: "var(--radius)",
  },
  options: {
    unsafe_disableDevelopmentModeWarnings: true,
  },
  elements: {
    footerAction: { display: "none" },
    footerActionText: { display: "none" },
    footerActionLink: { display: "none" },
  },
};
