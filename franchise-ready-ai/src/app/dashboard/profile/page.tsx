"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => {
        if (r.status === 401) throw new Error("Unauthorized");
        return r.json();
      })
      .then((data) => {
        if (data?.user) {
          setProfile(data.user);
          setName(data.user.name ?? "");
          setMobile(data.user.mobile ?? "");
        } else {
          setError("تعذّر تحميل بيانات الحساب");
        }
      })
      .catch(() => setError("تعذّر تحميل بيانات الحساب"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), mobile: mobile.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveMsg({ type: "error", text: data.error ?? "فشل حفظ البيانات" });
      } else {
        setSaveMsg({ type: "success", text: "تم حفظ البيانات بنجاح" });
        setProfile((prev) => (prev ? { ...prev, name: name.trim(), mobile: mobile.trim() || null } : prev));
      }
    } catch {
      setSaveMsg({ type: "error", text: "حدث خطأ غير متوقع" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "كلمتا المرور غير متطابقتين" });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ type: "error", text: data.error ?? "فشل تغيير كلمة المرور" });
      } else {
        setPasswordMsg({ type: "success", text: "تم تغيير كلمة المرور بنجاح" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMsg({ type: "error", text: "حدث خطأ غير متوقع" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "حذف حسابي") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.href = "/";
      } else {
        const data = await res.json();
        alert(data.error ?? "فشل حذف الحساب");
      }
    } catch {
      alert("حدث خطأ غير متوقع");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">حسابي</h1>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#1a5c3a] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {profile && (
          <>
            {/* Profile info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-[#1a5c3a] flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{profile.name}</p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>

              <h2 className="font-bold text-gray-900 mb-4">المعلومات الشخصية</h2>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    الاسم الكامل
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30 focus:border-[#1a5c3a] transition-all bg-[#f8faf9]"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-400">البريد الإلكتروني لا يمكن تغييره</p>
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    رقم الجوال
                  </label>
                  <input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30 focus:border-[#1a5c3a] transition-all bg-[#f8faf9]"
                  />
                </div>

                {saveMsg && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      saveMsg.type === "success"
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    {saveMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#1a5c3a] hover:bg-[#0f3d26] text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
                >
                  {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 mb-4">تغيير كلمة المرور</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    كلمة المرور الحالية
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30 focus:border-[#1a5c3a] transition-all bg-[#f8faf9]"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    كلمة المرور الجديدة
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30 focus:border-[#1a5c3a] transition-all bg-[#f8faf9]"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30 focus:border-[#1a5c3a] transition-all bg-[#f8faf9]"
                  />
                </div>

                {passwordMsg && (
                  <div
                    className={`rounded-xl px-4 py-3 text-sm ${
                      passwordMsg.type === "success"
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-[#1a5c3a] hover:bg-[#0f3d26] text-white font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
                >
                  {changingPassword ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
                </button>
              </form>
            </div>

            {/* Delete account */}
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
              <h2 className="font-bold text-red-700 mb-2">حذف الحساب</h2>
              <p className="text-sm text-gray-600 mb-4">
                سيؤدي حذف حسابك إلى إزالة جميع بياناتك ومشاريعك بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border border-red-300 text-red-600 hover:bg-red-50 font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  حذف حسابي
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm text-red-700 font-medium">
                    للتأكيد، اكتب: <span className="font-bold">حذف حسابي</span>
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="حذف حسابي"
                    className="w-full px-4 py-2.5 border border-red-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== "حذف حسابي" || deleting}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl transition-colors disabled:opacity-40 text-sm"
                    >
                      {deleting ? "جارٍ الحذف..." : "تأكيد الحذف"}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText("");
                      }}
                      className="border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-5 py-2 rounded-xl transition-colors text-sm"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
