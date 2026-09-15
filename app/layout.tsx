import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jsmhomewatch.com"),
  title: "JSM Home Watch & Property Care | Peace of Mind While You're Away",
  description:
    "Professional home watch and property care serving Northern Michigan. Scheduled checks, storm monitoring, vendor access, and photo updates for primary homes, vacation homes, and Airbnbs.",
  keywords: [
    "home watch Northern Michigan",
    "vacation home care",
    "property care Traverse City",
    "Airbnb property watch",
    "JSM Home Watch",
  ],
  authors: [{ name: "JSM Home Watch & Property Care Services" }],
  openGraph: {
    title: "JSM Home Watch & Property Care Services",
    description:
      "Peace of mind while you're away. Professional home watch serving Northern Michigan.",
    type: "website",
    locale: "en_US",
    images: [{ url: "/hero-lakefront.png", width: 1200, height: 800 }],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-forest-deep">
        {children}
        <script src="/open-request.js?v=send-feedback-2" defer />
      </body>
    </html>
  );
}
