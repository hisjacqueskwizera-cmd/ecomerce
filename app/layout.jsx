import "./globals.css";
import { StoreProvider } from "../components/StoreProvider";
import StorefrontFrame from "../components/StorefrontFrame";

export const metadata = {
  title: { default: "JashaMart | Products, stores, and great prices", template: "%s | JashaMart" },
  description: "Shop products from independent stores across Rwanda, with prices in RWF."
};

export default function RootLayout({ children }) {
  return <html lang="en"><body><StoreProvider><StorefrontFrame>{children}</StorefrontFrame></StoreProvider></body></html>;
}
