import { Poppins } from "next/font/google";
import "./globals.css";
import { TasksProvider } from "@/components/TasksProvider";
import SheetHost from "@/components/TaskSheet";
import { DesktopCredit } from "@/components/Credit";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "To-Do · Manage What To Do",
  description: "Create, schedule and track your tasks week by week. A Digiaccel assignment by Akshay Bhasin.",
  authors: [{ name: "Akshay Bhasin" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4566ec",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans text-ink antialiased">
        <TasksProvider>
          <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-white sm:shadow-xl">{children}</div>
          <SheetHost />
        </TasksProvider>
        <DesktopCredit />
      </body>
    </html>
  );
}
