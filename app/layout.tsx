import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Штукатурка PRO — прозрачный контроль вашего ремонта",
  description:
    "Личный кабинет клиента: прогресс работ по механизированной штукатурке в реальном времени.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
