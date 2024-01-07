/** @type {import('next').NextConfig} */
const nextConfig = {};

// Injected content via PWA below

//eslint-disable-next-line
const withPWA = require("next-pwa")({
  dest: "public"
});

module.exports = process.env.NODE_ENV === "production" ? withPWA(nextConfig) : nextConfig;

// Injected content via Sentry wizard below
//eslint-disable-next-line
const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
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
