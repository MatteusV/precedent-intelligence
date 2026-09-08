import { shadcn } from "@clerk/ui/themes";

export const clerkAppearance = {
  theme: shadcn,
  variables: {
    borderRadius: "var(--radius)",
    colorPrimary: "#d4a24a",
    colorBackground: "#1a1814",
    colorForeground: "#f4efe6",
    colorMutedForeground: "#b7b0a4",
    colorDanger: "#c45c3e",
    colorInput: "#11100e",
    colorInputForeground: "#f4efe6",
    colorNeutral: "#b7b0a4",
  },
  options: {
    unsafe_disableDevelopmentModeWarnings: true,
  },
  elements: {
    footerAction: { display: "none" },
    footerActionText: { display: "none" },
    footerActionLink: { display: "none" },
    cardBox: "shadow-none",
  },
};
