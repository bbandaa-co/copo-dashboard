import type { Metadata } from "next";
import "react-day-picker/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoPo — State of Affairs",
  description: "Company Policy internal ops dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
