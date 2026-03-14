import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Shield, ChevronDown, Trash2, UserPlus } from "lucide-react";

interface UserWithRole {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: AppRole;
  role_id: string;
}

export default function UserManagementPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch profiles and their roles
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");

    if (profiles && roles) {
      const merged: UserWithRole[] = profiles.map((p) => {
        const userRole = roles.find((r) => r.user_id === p.user_id);
        return {
          user_id: p.user_id,
          display_name: p.display_name,
          email: p.email,
          avatar_url: p.avatar_url,
          role: userRole?.role || "viewer",
          role_id: userRole?.id || "",
        };
      });
      setUsers(merged);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, roleId: string, newRole: AppRole) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("id", roleId);
    if (error) toast.error("Failed to update role: " + error.message);
    else {
      toast.success("Role updated");
      fetchUsers();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Remove this user's role? They will lose access.")) return;
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);
    if (error) toast.error(error.message);
    else {
      toast.success("User role removed");
      fetchUsers();
    }
  };

  const roleColors: Record<AppRole, string> = {
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    editor: "bg-primary/10 text-primary border-primary/20",
    viewer: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-primary" />
          <h1 className="text-[1.25rem] sm:text-[1.5rem] font-bold tracking-[-0.02em] text-foreground">User Management</h1>
        </div>
        <p className="text-[13px] text-muted-foreground mb-6">Manage user roles and permissions.</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="border border-border rounded-md divide-y divide-border">
            {users.map((u) => (
              <div key={u.user_id} className="flex items-center justify-between px-3 sm:px-4 py-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                    {u.display_name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-foreground truncate">
                      {u.display_name || "Unnamed"}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono truncate">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {isAdmin ? (
                    <div className="relative">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.user_id, u.role_id, e.target.value as AppRole)}
                        className={`appearance-none px-2.5 py-1 text-[11px] font-medium rounded-md border pr-6 outline-none cursor-pointer ${roleColors[u.role]}`}
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                    </div>
                  ) : (
                    <span className={`px-2.5 py-1 text-[11px] font-medium rounded-md border ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteUser(u.user_id)}
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">No users found</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
