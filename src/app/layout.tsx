import type { Metadata } from "next";
import "./globals.css";
import { AppHydrator } from "@/components/AppHydrator";
import { getFamilyId } from "@/lib/auth";
import { getStudentWithProgress } from "@/lib/repositories/student-repo";

export const metadata: Metadata = {
  title: "Melodex",
  description: "Aprende órgano eléctrico desde cero",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const familyId = await getFamilyId();
  const data = familyId ? await getStudentWithProgress(familyId) : null;

  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppHydrator data={data} />
        {children}
      </body>
    </html>
  );
}
