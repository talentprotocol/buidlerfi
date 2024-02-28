/** @type {import('next').NextConfig} */
let nextConfig = {
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}"
    },
    "@heroicons/react": {
      transform: "@heroicons/react/{{member}}"
    }
  },
  webpack: config => {
    config.resolve.alias["@mui/material"] = "@mui/joy";
    return config;
  }
};

// Injected content via PWA below
//eslint-disable-next-line
const withPWA = require("next-pwa")({
  dest: "public"
});

nextConfig = process.env.NODE_ENV === "production" ? withPWA(nextConfig) : nextConfig;

// Injected content via Sentry wizard below
//eslint-disable-next-line
const { withSentryConfig } = require("@sentry/nextjs");

nextConfig = withSentryConfig(
  nextConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "talentprotocol",
    project: "javascript-nextjs"
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true
  }
);

module.exports = nextConfig;
