"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";

const roleOptions = [
  { value: "super_admin", label: "Super admin" },
  { value: "seller", label: "Seller" },
  { value: "client", label: "Client" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: rpcError } = await createSupabaseBrowserClient().rpc("admin_list_users");
    if (rpcError) setError(rpcError.message.includes("admin_list_users")
      ? "Apply database/supabase-auth.sql in your Supabase SQL Editor, then reload this page."
      : rpcError.message);
    else setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function updateRole(userId, role) {
    setSavingId(userId);
    setError("");
    const { error: rpcError } = await createSupabaseBrowserClient().rpc("admin_set_user_role", {
      target_user_id: userId,
      new_role: role,
    });
    if (rpcError) setError(rpcError.message);
    else setUsers(current => current.map(user => user.user_id === userId ? { ...user, role } : user));
    setSavingId("");
  }

  return <>
    <div className="admin-page-heading"><div><h1>User roles</h1><p>Manage JashaMart super admins, sellers, and clients.</p></div><button className="admin-secondary" onClick={loadUsers} disabled={loading}>Refresh list</button></div>
    <section className="admin-card"><div className="admin-card-title"><div><h2>Accounts</h2><p>New accounts receive their initial role automatically. Promote an account here to add another super admin.</p></div></div>
      {error && <p className="coupon-error" role="alert">{error}</p>}
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>NAME</th><th>EMAIL</th><th>JOINED</th><th>ROLE</th></tr></thead><tbody>
        {users.map(user => <tr key={user.user_id}><td><strong>{user.full_name || "—"}</strong></td><td>{user.email}</td><td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td><td><select className="admin-filter" value={user.role} disabled={savingId === user.user_id} aria-label={`Role for ${user.email}`} onChange={event => updateRole(user.user_id, event.target.value)}>{roleOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td></tr>)}
      </tbody></table>{loading ? <div className="admin-empty">Loading accounts…</div> : !users.length && !error ? <div className="admin-empty">No accounts found.</div> : null}</div>
    </section>
  </>;
}
