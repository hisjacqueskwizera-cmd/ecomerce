import { StoreLayout } from "../../components/StoreChrome";
import StoresDirectory from "../../components/StoresDirectory";

export const metadata = { title: "Independent stores" };

export default function StoresPage() {
  return <main><StoreLayout><StoresDirectory /></StoreLayout></main>;
}
