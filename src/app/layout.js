// File: src/app/layout.js
import ClientLayout from "./ClientLayout";
import { ModalProvider } from "@/context/ModalContext";

export const metadata = {
  title: "STI-Policy | Helpdesk",
  description: "Connecting you with the right help",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <ModalProvider>
      <ClientLayout>{children}</ClientLayout>
    </ModalProvider>
  );
}
