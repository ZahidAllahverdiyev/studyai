import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();

  // Profile
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty.");

    setSavingProfile(true);
    try {
      // ✅ Bu endpoint-i backend-də yaradacağıq (aşağıda)
      await api.put("/auth/profile", { name });

      // Əgər AuthContext user-i auto yeniləmirsə, yenə də UI-dakı name dəyişəcək.
      // İstəsən sonra AuthContext-ə "refreshMe()" əlavə edib tam sinxron edərik.
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return toast.error("Please fill all password fields.");
    }
    if (newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }
    if (newPassword !== confirmNewPassword) {
      return toast.error("New passwords do not match.");
    }

    setSavingPassword(true);
    try {
      // ✅ Bu endpoint-i backend-də yaradacağıq (aşağıda)
      await api.put("/auth/password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success("Password changed.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your profile and password</p>
        </div>
      </div>

      <div className="card-grid">
        {/* Profile */}
        <div className="card">
          <h3 style={{ fontFamily: "Playfair Display", marginBottom: 16 }}>
            Profile
          </h3>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input value={email} disabled />
            </div>

            <button className="btn btn-primary" type="submit" disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        {/* Password */}
        <div className="card">
          <h3 style={{ fontFamily: "Playfair Display", marginBottom: 16 }}>
            Change Password
          </h3>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 chars"
              />
            </div>

            <div className="form-group">
              <label>Confirm new password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={savingPassword}>
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}