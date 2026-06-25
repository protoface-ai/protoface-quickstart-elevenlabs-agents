import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Protoface + ElevenLabs Starter",
  description: "A realtime Protoface avatar starter for ElevenLabs agents.",
  icons: {
    icon: "/protoface-logo.png",
    apple: "/protoface-logo.png"
  },
  openGraph: {
    title: "Protoface + ElevenLabs Starter",
    description: "A realtime Protoface avatar starter for ElevenLabs agents.",
    images: ["/protoface-logo.png"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
