import { Flex } from "@/components/shared/flex";
import { Metadata } from "next";
import Head from "next/head";
import Script from "next/script";
import "./globals.css";
import InnerLayout from "./innerLayout";

export const metadata: Metadata = {
  title: "builder.fi by Talent Protocol",
  description: "Where experienced builders can monetize their knowledge and earn crypto by answering questions.",
  metadataBase:
    process.env.NODE_ENV === "production" ? new URL("https://builder.fi") : new URL("http://localhost:3000"),
  openGraph: {
    images: ["https://builder.fi/thumbnail.jpg?2"],
    type: "website",
    title: "builder.fi by Talent Protocol",
    description: "Where experienced builders can monetize their knowledge and earn crypto by answering questions.",
    url: "https://app.builder.fi/"
  },
  twitter: {
    images: ["https://builder.fi/thumbnail.jpg?2"],
    card: "summary_large_image"
  },
  manifest: "/manifest.json"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Flex lang="en" component={"html"} suppressHydrationWarning grow>
        <InnerLayout> {children}</InnerLayout>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-DSXS61BZPF" />
        <Script id="google-analytics">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-DSXS61BZPF');
        `}
        </Script>
      </Flex>
    </>
  );
}
