import type { Metadata } from "next";
import { AppProvider } from "../context/AppContext";
import "./globals.css";
import { SocketProvider } from "@/context/SocketContext";

export const metadata: Metadata = {
  title: "Chatvia",
  description: "It is an ChatApp named Chatvia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AppProvider>
      </body>
    </html>
  );
}
