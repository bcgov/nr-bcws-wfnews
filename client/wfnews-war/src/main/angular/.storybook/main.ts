import type { StorybookConfig } from "@storybook/angular";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: [
    { from: "../src/assets/icons", to: "/assets/icons" },
    { from: "../src/assets/images", to: "/assets/images" },
    { from: "../src/assets/images/drivebc", to: "/assets/images/drivebc" },
    { from: "../src/assets/images/logo", to: "/assets/images/logo" },
    { from: "../src/assets/images/svg-icons", to: "/assets/images/svg-icons" },
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/angular",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
};
export default config;
