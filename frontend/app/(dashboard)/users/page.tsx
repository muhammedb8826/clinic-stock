"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { userApi, User, CreateUserDto } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus, Search, Edit, Trash2, Download, RefreshCcw, ShieldCheck, LockKeyhole,
} from "lucide-react";

/* ------------------------- RBAC helpers ------------------------- */

type Role = User["role"]; // "admin" | "manager" | "cashier"

const normalizeRole = (r: any): Role => {
  const v = String(r ?? "").toLowerCase();
  if (v === "admin" || v === "manager" || v === "cashier") return v as Role;
  return "cashier";
};

const ROLE_RANK: Record<Role, number> = { cashier: 1, manager: 2, admin: 3 };

const canCreateRole = (actor: Role, target: Role) => {
  if (actor === "admin") return target === "manager" || target === "cashier";
  if (actor === "manager") return target === "cashier";
  return false;
};

const canEditUser = (actor: Role, targetUser: User, selfId?: number) => {
  if (selfId && targetUser.id === selfId) return true; // allow self edit (no escalation)
  return ROLE_RANK[actor] > ROLE_RANK[normalizeRole(targetUser.role)];
};

const canDeleteUser = (actor: Role, targetUser: User) => {
  return ROLE_RANK[actor] > ROLE_RANK[normalizeRole(targetUser.role)];
};

const canSetRoleTo = (actor: Role, to: Role, targetUser?: User, selfId?: number) => {
  if (targetUser && selfId && targetUser.id === selfId) return false; // no self escalation
  return canCreateRole(actor, to);
};

function RoleBadge({ role }: { role: Role }) {
  const r = normalizeRole(role);
  const map: Record<Role, { cls: string; label: string }> = {
    admin: { cls: "bg-red-50 text-red-700 border-red-200", label: "Admin" },
    manager: { cls: "bg-blue-50 text-blue-700 border-blue-200", label: "Manager" },
    cashier: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Cashier" },
  };
  const { cls, label } = map[r];
  return <Badge className={`border ${cls}`}>{label}</Badge>;
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge
      className={`border ${
        active ? "bg-emerald-50 text-emerald-700 border-emerald-200"
               : "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

/* ------------------------- Page ------------------------- */

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // current signed-in user
  const [me, setMe] = useState<{ id: number; role: Role } | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState<CreateUserDto & { isActive?: boolean }>({
    name: "", email: "", password: "", role: "cashier", phone: "", address: "",
  });

  // Load current user (NO more "cashier" fallback)
  useEffect(() => {
    (async () => {
      setMeLoading(true);
      try {
        if ((userApi as any)?.me) {
          const meRes = await (userApi as any).me();
          if (meRes?.id && meRes?.role) {
            setMe({ id: meRes.id, role: normalizeRole(meRes.role) });
          }
        } else {
          // optional localStorage fallback if you save logged-in user after sign-in
          const raw = typeof window !== "undefined" ? localStorage.getItem("auth_user") : null;
          if (raw) {
            try {
              const obj = JSON.parse(raw);
              if (obj?.id && obj?.role) {
                setMe({ id: obj.id, role: normalizeRole(obj.role) });
              }
            } catch {}
          }
        }
      } catch {
        // do not force a cashier fallback here; just leave `me` null
      } finally {
        setMeLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.list();
      setUsers(response || []);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return (users || [])
      .map((u) => ({ ...u, role: normalizeRole(u.role) }))
      .filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
      .filter((u) => {
        if (statusFilter === "active") return !!u.isActive;
        if (statusFilter === "inactive") return !u.isActive;
        return true;
      })
      .filter((u) => {
        if (!q) return true;
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.address?.toLowerCase().includes(q)
        );
      });
  }, [users, roleFilter, statusFilter, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (meLoading) return;
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const myRole = me?.role;
    try {
      if (editingUser) {
        if (!myRole || !canEditUser(myRole, editingUser, me?.id)) {
          toast.error("You don’t have permission to edit this user");
          return;
        }
        const payload: Partial<CreateUserDto & { isActive?: boolean }> = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: form.address,
          isActive: form.isActive,
        };
        if (form.password.trim()) payload.password = form.password;
        if (form.role !== editingUser.role) {
          if (!canSetRoleTo(myRole, form.role, editingUser, me?.id)) {
            toast.error("You can’t set this role");
            return;
          }
          payload.role = form.role;
        }
        await userApi.update(editingUser.id, payload as CreateUserDto);
        toast.success("User updated successfully");
      } else {
        if (!myRole) {
          toast.error("Can’t determine your role. Please re-login.");
          return;
        }
        if (!canCreateRole(myRole, form.role)) {
          toast.error("You can’t create a user with this role");
          return;
        }
        if (!form.password.trim()) {
          toast.error("Password is required");
          return;
        }
        await userApi.create(form);
        toast.success("User created successfully");
      }

      setModalOpen(false);
      setEditingUser(null);
      setForm({ name: "", email: "", password: "", role: "cashier", phone: "", address: "", isActive: true });
      loadUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
      toast.error("Failed to save user");
    }
  };

  const handleEdit = (user: User) => {
    if (meLoading) return;
    const myRole = me?.role;
    if (!myRole || !canEditUser(myRole, user, me?.id)) {
      toast.error("You don’t have permission to edit this user");
      return;
    }
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: normalizeRole(user.role),
      phone: user.phone || "",
      address: user.address || "",
      isActive: !!user.isActive,
    });
    setModalOpen(true);
  };

  const handleDelete = (user: User) => {
    if (meLoading) return;
    const myRole = me?.role;
    if (!myRole || !canDeleteUser(myRole, user) || user.id === me?.id) {
      toast.error("You don’t have permission to delete this user");
      return;
    }
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await userApi.delete(userToDelete.id);
      toast.success("User deleted successfully");
      loadUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "cashier", phone: "", address: "", isActive: true });
  };

  const creatableRoles = useMemo<Role[]>(() => {
    if (!me) return [];
    if (me.role === "admin") return ["manager", "cashier"]; // add "admin" if you want admins to create admins
    if (me.role === "manager") return ["cashier"];
    return [];
  }, [me]);

  const canOpenCreate = !!me && creatableRoles.length > 0;

  const handleExport = () => {
    if (!filteredUsers.length) {
      toast.info("No users to export");
      return;
    }
    const headers = ["Name", "Email", "Role", "Phone", "Address", "Status", "Created"];
    const rows = filteredUsers.map((u) => [
      u.name,
      u.email,
      normalizeRole(u.role),
      u.phone ?? "",
      u.address ?? "",
      u.isActive ? "Active" : "Inactive",
      new Date(u.createdAt).toLocaleDateString("en-ET"),
    ]);
    const csv =
      [headers, ...rows]
        .map((r) =>
          r
            .map((v) => {
              const val = String(v ?? "");
              return /[",\n]/.test(val) ? `"${val.replace(/"/g, '""')}"` : val;
            })
            .join(",")
        )
        .join("\n") + "\n";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "milkii-users.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  const myRoleLabel = meLoading ? "…" : me ? normalizeRole(me.role) : "unknown";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <Badge variant="outline" className="gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            RBAC
          </Badge>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <LockKeyhole className="h-3.5 w-3.5" />
            You are:&nbsp;
            {me ? <RoleBadge role={me.role} /> : <span className="italic">{myRoleLabel}</span>}
          </span>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!filteredUsers.length}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={loadUsers} disabled={loading}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>

          {/* Add User (guarded by role) */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  if (!canOpenCreate) {
                    toast.error(meLoading ? "Determining your role…" : "You don’t have permission to add users");
                    return;
                  }
                  setEditingUser(null);
                  setForm({
                    name: "", email: "", password: "", role: creatableRoles[0] ?? "cashier",
                    phone: "", address: "", isActive: true,
                  });
                  setModalOpen(true);
                }}
                disabled={!canOpenCreate}
                className={canOpenCreate ? "bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700" : ""}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="user@company.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {editingUser ? "(leave blank to keep current)" : "*"}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editingUser ? "••••••••" : "Minimum 6 characters"}
                    required={!editingUser}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={form.role}
                      onValueChange={(v: Role) => setForm({ ...form, role: v })}
                      disabled={!me}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {editingUser
                          ? (["admin","manager","cashier"] as Role[]).map((r) => (
                              <SelectItem key={r} value={r} disabled={!canSetRoleTo(me!.role, r, editingUser, me!.id)}>
                                {r === "admin" ? "Admin" : r === "manager" ? "Manager" : "Cashier"}
                              </SelectItem>
                            ))
                          : creatableRoles.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r === "admin" ? "Admin" : r === "manager" ? "Manager" : "Cashier"}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+251..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Street / Kebele / City"
                  />
                </div>

                {editingUser && (
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Active</div>
                      <div className="text-xs text-gray-500">Toggle to activate/deactivate account</div>
                    </div>
                    <Switch
                      checked={!!form.isActive}
                      onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                      disabled={!me || !canEditUser(me.role, editingUser, me.id)}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleModalClose}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                  >
                    {editingUser ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Accent underline */}
      <div className="h-[3px] w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 rounded-full" />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, role, phone, address…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
            <SelectTrigger><SelectValue placeholder="All roles" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="cashier">Cashier</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  Loading users…
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12">
                  <div className="text-center">
                    <p className="text-gray-700 font-medium">No users found</p>
                    <p className="text-gray-500 text-sm">Try a different search or adjust filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const myRole = me?.role;
                const allowEdit = !!myRole && canEditUser(myRole, user, me?.id);
                const allowDelete = !!myRole && canDeleteUser(myRole, user) && user.id !== me?.id;

                return (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell><RoleBadge role={normalizeRole(user.role)} /></TableCell>
                    <TableCell>{user.phone || "N/A"}</TableCell>
                    <TableCell><StatusBadge active={!!user.isActive} /></TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString("en-ET")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="h-8 w-8 p-0"
                          aria-label="Edit"
                          title={allowEdit ? "Edit" : "You can’t edit this user"}
                          disabled={!allowEdit}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="h-8 w-8 p-0"
                          aria-label="Delete"
                          title={allowDelete ? "Delete" : "You can’t delete this user"}
                          disabled={!allowDelete}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p>
              Are you sure you want to delete{" "}
              <strong>{userToDelete?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
