import type { Metadata } from "next";
import { AppToaster } from "@/components/app-toaster";
import "@whatmatters/wmds/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pitchkit",
    template: "%s · Pitchkit",
  },
  description: "A hosted media kit for Instagram creators.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
