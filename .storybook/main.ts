import type { StorybookConfig } from "@storybook/nextjs";
import path from "path";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-links",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  staticDirs: ["../public"],
  typescript: {
    check: false,
    reactDocgen: "react-docgen-typescript",
  },
  features: {
    experimentalRSC: true,
  },
  core: {
    disableTelemetry: true,
  },
  webpackFinal: async (config) => {
    // useAuthフックをモックに置き換え
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@/lib/auth/hooks": path.resolve(__dirname, "./mocks/auth-hooks.ts"),
      };
    }
    return config;
  },
};
export default config;
