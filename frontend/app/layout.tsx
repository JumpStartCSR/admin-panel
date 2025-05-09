import type { Metadata } from "next";
import "./globals.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { AuthProvider } from "./context/auth-context";
import { OrganizationProvider } from "./context/org-context";
import ActivityTracker from "./components/ActivityTracker";

export const metadata: Metadata = {
  title: "Holmz Admin Panel",
  description: "Holmz Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <AuthProvider>
            <OrganizationProvider>
              <ActivityTracker />
              {children}
            </OrganizationProvider>
          </AuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
