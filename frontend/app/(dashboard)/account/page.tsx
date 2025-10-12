"use client";

import { useEffect, useState } from "react";
import { userApi, UpdateUserDto } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Check, Shield, UserRound } from "lucide-react";

export default function AccountSettingsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UpdateUserDto>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!profile.name?.trim() || !profile.email?.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setLoading(true);
    try {
      await userApi.update(user.id, {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone?.trim(),
        address: profile.address?.trim(),
      });
      toast.success("Profile updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (!passwords.newPassword) {
      toast.error("Enter a new password");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      // If your API requires currentPassword, include it here.
      await userApi.update(user.id, { password: passwords.newPassword });
      toast.success("Password updated");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      console.error(e);
      toast.error("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-sm text-gray-500">
            Manage your profile information and security preferences.
          </p>
        </div>
      </div>

      {/* Profile card */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-emerald-600" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              id="name"
              label="Name"
              value={profile.name || ""}
              onChange={(v) => setProfile({ ...profile, name: v })}
              required
            />
            <Field
              id="email"
              label="Email"
              type="email"
              value={profile.email || ""}
              onChange={(v) => setProfile({ ...profile, email: v })}
              required
            />
            <Field
              id="phone"
              label="Phone"
              value={profile.phone || ""}
              onChange={(v) => setProfile({ ...profile, phone: v })}
            />
            <Field
              id="address"
              label="Address"
              value={profile.address || ""}
              onChange={(v) => setProfile({ ...profile, address: v })}
            />
          </div>

          <div className="flex items-center justify-end">
            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
            >
              {loading ? "Saving..." : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security card */}
      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              id="currentPassword"
              label="Current Password"
              type="password"
              value={passwords.currentPassword}
              onChange={(v) => setPasswords({ ...passwords, currentPassword: v })}
            />
            <Field
              id="newPassword"
              label="New Password"
              type="password"
              value={passwords.newPassword}
              onChange={(v) => setPasswords({ ...passwords, newPassword: v })}
              required
            />
            <Field
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={passwords.confirmPassword}
              onChange={(v) => setPasswords({ ...passwords, confirmPassword: v })}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Use a strong password you don’t use elsewhere.
            </p>
            <Button
              variant="secondary"
              onClick={handleChangePassword}
              disabled={loading}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>

          <Separator className="my-2" />
          <div className="text-xs text-muted-foreground">
            Changes apply to your current account only.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------- Small field helper for tidy inputs -------- */

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="h-10 focus-visible:ring-emerald-500/50"
      />
    </div>
  );
}
