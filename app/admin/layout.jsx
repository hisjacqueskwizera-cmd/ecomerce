import "./admin.css";
import AdminShell from "../../components/AdminShell";

export const metadata = { title: "Admin console | Open Shop" };

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
