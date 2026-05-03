"use client";

import { useState } from "react";
import {
  Users,
  Shield,
  Key,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Plus,
  Check,
  X,
  Lock,
} from "lucide-react";
import {
  appUsers,
  roles,
  allPermissions,
  type AppUser,
  type Role,
} from "@/lib/mock-data";
import { isValidEmail } from "@/lib/validators";

/* ------------------------------------------------------------------ */
/*  Tabs                                                                */
/* ------------------------------------------------------------------ */
type Tab = "usuarios" | "roles" | "permisos";

type CreateUserForm = Partial<AppUser> & {
  password: string;
};

const tabs: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: "usuarios", label: "Usuarios", icon: <Users className="h-4 w-4" /> },
  { value: "roles", label: "Roles", icon: <Shield className="h-4 w-4" /> },
  {
    value: "permisos",
    label: "Matriz de Permisos",
    icon: <Lock className="h-4 w-4" />,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function fmtDate(iso: string | null): string {
  if (!iso) return "\u2014";
  return iso;
}

function groupPermissionsByModule() {
  return allPermissions.reduce<Record<string, typeof allPermissions>>((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {});
}

function getPermissionName(permissionCode: string): string {
  return allPermissions.find((perm) => perm.code === permissionCode)?.name || permissionCode;
}

const CORPORATE_PASSWORD_MIN_LENGTH = 12;

function validateCorporatePasswordPolicy(password: string): string | null {
  const value = password.trim();

  if (!value) return "La nueva contraseña es requerida";
  if (value.length < CORPORATE_PASSWORD_MIN_LENGTH) {
    return `Debe tener al menos ${CORPORATE_PASSWORD_MIN_LENGTH} caracteres`;
  }
  if (!/[a-z]/.test(value)) return "Debe incluir letras minúsculas";
  if (!/[A-Z]/.test(value)) return "Debe incluir letras mayúsculas";
  if (!/[0-9]/.test(value)) return "Debe incluir números";
  if (!/[^A-Za-z0-9]/.test(value)) return "Debe incluir símbolos";

  return null;
}

/* ------------------------------------------------------------------ */
/*  Role badge colors                                                   */
/* ------------------------------------------------------------------ */
function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, { bg: string; text: string; ring: string }> = {
    Administrador: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      ring: "ring-purple-600/20",
    },
    Ejecutivo: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      ring: "ring-blue-600/20",
    },
    Visualizador: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      ring: "ring-gray-600/20",
    },
  };

  const c = colors[role] || colors["Visualizador"];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${c.bg} ${c.text} ${c.ring}`}
    >
      <Shield className="h-3 w-3" />
      {role}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                        */
/* ------------------------------------------------------------------ */
function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
      Activo
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-600/20">
      Inactivo
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Users Tab                                                           */
/* ------------------------------------------------------------------ */
function UsuariosTab({ users, onEdit, onResetPassword, onToggleActive }: { users: AppUser[]; onEdit: (user: AppUser) => void; onResetPassword: (user: AppUser) => void; onToggleActive: (userId: number) => void }) {
  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="py-3.5 pl-6 pr-3">Nombre Completo</th>
              <th className="px-3 py-3.5">Usuario</th>
              <th className="px-3 py-3.5">Email</th>
              <th className="px-3 py-3.5">Rol</th>
              <th className="px-3 py-3.5">Último Acceso</th>
              <th className="px-3 py-3.5 text-center">Estado</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr
                key={u.id}
                className="group transition-colors hover:bg-gray-50/60"
              >
                {/* Full name + avatar */}
                <td className="py-4 pl-6 pr-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${u.isActive ? "bg-brand-600" : "bg-gray-400"
                        }`}
                    >
                      {u.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <span className="font-medium text-gray-900">
                      {u.fullName}
                    </span>
                  </div>
                </td>

                {/* Username */}
                <td className="px-3 py-4">
                  <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {u.username}
                  </span>
                </td>

                {/* Email */}
                <td className="px-3 py-4 text-gray-600">{u.email}</td>

                {/* Role */}
                <td className="px-3 py-4">
                  <RoleBadge role={u.roleName} />
                </td>

                {/* Last login */}
                <td className="px-3 py-4 text-gray-500">
                  {fmtDate(u.lastLogin)}
                </td>

                {/* Status */}
                <td className="px-3 py-4 text-center">
                  <StatusBadge active={u.isActive} />
                </td>

                {/* Actions */}
                <td className="py-4 pl-3 pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="Editar usuario"
                      onClick={() => onEdit(u)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      title="Reset Password"
                      onClick={() => onResetPassword(u)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Key className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      title={
                        u.isActive
                          ? "Desactivar usuario"
                          : "Activar usuario"
                      }
                      onClick={() => onToggleActive(u.id)}
                      className={`rounded-lg p-2 transition-colors ${u.isActive
                        ? "text-brand-500 hover:bg-brand-50 hover:text-brand-700"
                        : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        }`}
                    >
                      {u.isActive ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table footer */}
      <div className="border-t border-gray-100 px-6 py-3.5">
        <p className="text-sm text-gray-500">
          Mostrando{" "}
          <span className="font-medium text-gray-900">{users.length}</span>{" "}
          usuarios
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Roles Tab                                                           */
/* ------------------------------------------------------------------ */
function RolesTab({ rolesList, onCreateRole, onEditPermissions }: { rolesList: Role[]; onCreateRole: () => void; onEditPermissions: (role: Role) => void }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          type="button"
          onClick={onCreateRole}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo Rol
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rolesList.map((role) => (
          <div
            key={role.id}
            className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
          >
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-gray-900">
                    {role.name}
                  </h3>
                  {role.isSystem && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      <Lock className="h-2.5 w-2.5" />
                      Sistema
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {role.description}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
                <Shield className="h-5 w-5 text-brand-600" />
              </div>
            </div>

            {/* Permissions count */}
            <div className="mb-3 flex items-center gap-2 text-sm">
              <span className="text-gray-500">Permisos:</span>
              <span className="font-semibold text-gray-900">
                {role.permissions.length}
              </span>
            </div>

            {/* Permission pills */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {role.permissions.map((p) => (
                <span
                  key={p}
                  className="inline-flex rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200"
                >
                  {getPermissionName(p)}
                </span>
              ))}
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={() => onEditPermissions(role)}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar Permisos
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Permission Matrix Tab                                               */
/* ------------------------------------------------------------------ */
function MatrizPermisosTab() {
  const [matrixState, setMatrixState] = useState<Record<number, string[]>>(() => {
    const initialState: Record<number, string[]> = {};
    roles.forEach((r) => {
      initialState[r.id] = [...r.permissions];
    });
    return initialState;
  });
  const [savedMatrixState, setSavedMatrixState] = useState<Record<number, string[]>>(() => {
    const initialState: Record<number, string[]> = {};
    roles.forEach((r) => {
      initialState[r.id] = [...r.permissions];
    });
    return initialState;
  });

  const [isSaving, setIsSaving] = useState(false);

  const modules = allPermissions.reduce<Record<string, { code: string; name: string }[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push({ code: p.code, name: p.name });
    return acc;
  }, {});

  const togglePermission = (roleId: number, permCode: string, isSystem: boolean) => {
    if (isSystem) return;

    setMatrixState((prev) => {
      const currentPerms = prev[roleId] || [];
      const hasPerm = currentPerms.includes(permCode);

      if (hasPerm) {
        return {
          ...prev,
          [roleId]: currentPerms.filter((c) => c !== permCode),
        };
      } else {
        return {
          ...prev,
          [roleId]: [...currentPerms, permCode],
        };
      }
    });
  };

  const cloneMatrixState = (state: Record<number, string[]>) =>
    Object.fromEntries(
      Object.entries(state).map(([roleId, permissions]) => [roleId, [...permissions]])
    ) as Record<number, string[]>;

  const handleSave = () => {
    setIsSaving(true);
    setSavedMatrixState(cloneMatrixState(matrixState));
    // TODO: Conectar guardado con la API aquí en el futuro
    setTimeout(() => {
      setIsSaving(false);
    }, 600);
  };

  const handleUndo = () => {
    setMatrixState(cloneMatrixState(savedMatrixState));
  };

  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="py-3.5 pl-6 pr-3">Permiso</th>
              {roles.map((r) => (
                <th key={r.id} className="px-4 py-3.5 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span>{r.name}</span>
                    {r.isSystem && (
                      <Lock className="h-3 w-3 text-gray-400" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          {Object.entries(modules).map(([module, permissions]) => (
            <tbody key={module}>
              {/* Module header row */}
              <tr className="bg-gray-50/40">
                <td
                  colSpan={roles.length + 1}
                  className="py-2.5 pl-6 pr-3"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {module}
                  </span>
                </td>
              </tr>

              {/* Permission rows */}
              {permissions.map((perm) => (
                <tr
                  key={perm.code}
                  className="border-b border-gray-50 transition-colors hover:bg-gray-50/60"
                >
                  <td className="py-3 pl-6 pr-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {perm.name}
                      </p>
                      <p className="font-mono text-xs text-gray-400">
                        {perm.code}
                      </p>
                    </div>
                  </td>

                  {roles.map((role) => {
                    const hasPermission = matrixState[role.id]?.includes(perm.code);
                    const isSystem = role.isSystem;

                    return (
                      <td key={role.id} className="px-4 py-3 text-center">
                        <div className="flex justify-center">
                          {isSystem ? (
                            /* Administrador: always checked, non-interactive, full green */
                            <span
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-green-600"
                              title="Administrador — permiso fijo"
                            >
                              <Check className="h-4 w-4" strokeWidth={2.5} />
                            </span>
                          ) : (
                            /* Ejecutivo / Visualizador: interactive toggle */
                            <button
                              type="button"
                              onClick={() => togglePermission(role.id, perm.code, false)}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-all focus:outline-none cursor-pointer ${hasPermission
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500"
                                }`}
                            >
                              {hasPermission ? (
                                <Check className="h-4 w-4" strokeWidth={2.5} />
                              ) : (
                                <X className="h-4 w-4" strokeWidth={2.5} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-900">
              {allPermissions.length}
            </span>{" "}
            permisos en{" "}
            <span className="font-medium text-gray-900">
              {Object.keys(modules).length}
            </span>{" "}
            módulos
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleUndo}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${isSaving
                ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              Deshacer
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${isSaving
                ? "bg-brand-400 cursor-wait"
                : "bg-brand-600 hover:bg-brand-700"
                }`}
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                      */
/* ------------------------------------------------------------------ */
export default function UsuariosPage() {
  const [activeTab, setActiveTab] = useState<Tab>("usuarios");
  const [users, setUsers] = useState<AppUser[]>(appUsers);
  const [rolesList, setRolesList] = useState<Role[]>(roles);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  const [userForm, setUserForm] = useState<CreateUserForm>({
    fullName: "",
    username: "",
    email: "",
    password: "",
    roleName: roles[1]?.name || "Ejecutivo",
    isActive: true,
  });
  const [userFormErrors, setUserFormErrors] = useState<Record<string, string>>({});
  const [userSubmitAttempt, setUserSubmitAttempt] = useState(false);
  const [userSuccessMessage, setUserSuccessMessage] = useState<string | null>(null);

  const [newRoleForm, setNewRoleForm] = useState<Partial<Role>>({
    name: "",
    description: "",
    permissions: [],
    isSystem: false,
  });
  const [newRoleFormErrors, setNewRoleFormErrors] = useState<Record<string, string>>({});
  const [roleSubmitAttempt, setRoleSubmitAttempt] = useState(false);
  const [roleSuccessMessage, setRoleSuccessMessage] = useState<string | null>(null);

  // Edit permissions flow
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [editPermissionsRoleId, setEditPermissionsRoleId] = useState<number | null>(null);
  const [editPermissionsForm, setEditPermissionsForm] = useState<Record<string, boolean>>({});
  const [permissionsSuccessMessage, setPermissionsSuccessMessage] = useState<string | null>(null);

  // Edit flow
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUserForm, setEditUserForm] = useState<Partial<AppUser>>({});
  const [editUserFormErrors, setEditUserFormErrors] = useState<Record<string, string>>({});
  const [editUserSubmitAttempt, setEditUserSubmitAttempt] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [resetPasswordForm, setResetPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [resetPasswordErrors, setResetPasswordErrors] = useState<Record<string, string>>({});
  const [resetPasswordSubmitAttempt, setResetPasswordSubmitAttempt] = useState(false);
  const [resetPasswordSuccessMessage, setResetPasswordSuccessMessage] = useState<string | null>(null);

  function resetUserForm() {
    setUserForm({ fullName: "", username: "", email: "", password: "", roleName: roles[1]?.name || "Ejecutivo", isActive: true });
  }

  function resetNewRoleForm() {
    setNewRoleForm({ name: "", description: "", permissions: [], isSystem: false });
    setNewRoleFormErrors({});
  }

  function toggleNewRolePermission(permissionCode: string) {
    setNewRoleForm((prev) => {
      const currentPermissions = prev.permissions || [];
      const hasPermission = currentPermissions.includes(permissionCode);

      return {
        ...prev,
        permissions: hasPermission
          ? currentPermissions.filter((code) => code !== permissionCode)
          : [...currentPermissions, permissionCode],
      };
    });
  }

  function handleCreateRole(e: any) {
    e.preventDefault();
    setRoleSubmitAttempt(true);
    const errors: Record<string, string> = {};
    if (!newRoleForm.name || !newRoleForm.name.trim()) errors.name = "El nombre del rol es requerido";
    if (newRoleForm.name && rolesList.some((r) => r.name === newRoleForm.name)) {
      errors.name = "Ya existe un rol con ese nombre";
    }

    if (Object.keys(errors).length > 0) {
      setNewRoleFormErrors(errors);
      return;
    }

    const nextId = Math.max(0, ...rolesList.map((r) => r.id)) + 1;
    const newRole: Role = {
      id: nextId,
      name: newRoleForm.name || "",
      description: newRoleForm.description || "",
      permissions: newRoleForm.permissions || [],
      isSystem: false,
    };

    setRolesList((prev) => [newRole, ...prev]);
    setIsCreatingRole(false);
    resetNewRoleForm();
    setRoleSubmitAttempt(false);
    setRoleSuccessMessage("Rol creado correctamente");
    setTimeout(() => setRoleSuccessMessage(null), 3000);
  }

  function openEditPermissionsModal(role: Role) {
    setEditPermissionsRoleId(role.id);
    const permissionsMap: Record<string, boolean> = {};
    const isAdmin = role.name === "Administrador";

    allPermissions.forEach((perm) => {
      // Para administrador, todos los permisos están marcados
      permissionsMap[perm.code] = isAdmin ? true : role.permissions.includes(perm.code);
    });
    setEditPermissionsForm(permissionsMap);
    setIsEditingPermissions(true);
  }

  function handleUpdatePermissions(e: any) {
    e.preventDefault();
    const selectedPermissions = Object.entries(editPermissionsForm)
      .filter(([_, isSelected]) => isSelected)
      .map(([code, _]) => code);

    setRolesList((prev) =>
      prev.map((r) =>
        r.id === editPermissionsRoleId
          ? { ...r, permissions: selectedPermissions }
          : r
      )
    );

    setIsEditingPermissions(false);
    setEditPermissionsRoleId(null);
    setEditPermissionsForm({});
    setPermissionsSuccessMessage("Permisos actualizados correctamente");
    setTimeout(() => setPermissionsSuccessMessage(null), 3000);
  }

  function togglePermission(permissionCode: string) {
    const currentRole = rolesList.find((r) => r.id === editPermissionsRoleId);
    const isAdmin = currentRole?.name === "Administrador";

    // No-op if trying to uncheck role.manage on non-admin
    if (permissionCode === "role.manage" && !isAdmin && editPermissionsForm[permissionCode]) {
      return;
    }

    setEditPermissionsForm((prev) => ({
      ...prev,
      [permissionCode]: !prev[permissionCode],
    }));
  }

  function resetEditUserForm() {
    setEditUserForm({});
    setEditUserFormErrors({});
    setEditUserId(null);
  }

  function openEditUser(user: AppUser) {
    setEditUserId(user.id);
    setEditUserForm({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      roleName: user.roleName,
      isActive: user.isActive,
    });
    setIsEditingUser(true);
  }

  function openResetPassword(user: AppUser) {
    setResetPasswordUserId(user.id);
    setResetPasswordForm({ password: "", confirmPassword: "" });
    setResetPasswordErrors({});
    setResetPasswordSubmitAttempt(false);
    setResetPasswordSuccessMessage(null);
    setIsResettingPassword(true);
  }

  function resetResetPasswordForm() {
    setResetPasswordForm({ password: "", confirmPassword: "" });
    setResetPasswordErrors({});
    setResetPasswordSubmitAttempt(false);
    setResetPasswordUserId(null);
  }

  function handleResetPassword(e: any) {
    e.preventDefault();
    setResetPasswordSubmitAttempt(true);

    const errors: Record<string, string> = {};
    const passwordPolicyError = validateCorporatePasswordPolicy(resetPasswordForm.password);
    if (passwordPolicyError) errors.password = passwordPolicyError;
    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden";

    if (Object.keys(errors).length > 0) {
      setResetPasswordErrors(errors);
      return;
    }

    if (resetPasswordUserId == null) return;

    const targetUser = users.find((u) => u.id === resetPasswordUserId);
    if (!targetUser) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === resetPasswordUserId ? { ...u, password: resetPasswordForm.password } : u
      )
    );

    setIsResettingPassword(false);
    resetResetPasswordForm();
    setResetPasswordSuccessMessage(`Contraseña actualizada para ${targetUser.fullName}`);
    setTimeout(() => setResetPasswordSuccessMessage(null), 3000);
  }

  function handleUpdateUser(e: any) {
    e.preventDefault();
    setEditUserSubmitAttempt(true);
    const errors: Record<string, string> = {};
    if (!editUserForm.fullName || !editUserForm.fullName.trim()) errors.fullName = "El nombre completo es requerido";
    if (!editUserForm.username || !editUserForm.username.trim()) errors.username = "El usuario es requerido";
    if (!isValidEmail(editUserForm.email)) errors.email = "Email inválido";

    // check duplicates (exclude current user)
    if (
      editUserForm.email &&
      users.some((u) => u.email === editUserForm.email && u.id !== editUserId)
    ) {
      errors.email = "Ya existe un usuario con ese email";
    }
    if (
      editUserForm.username &&
      users.some((u) => u.username === editUserForm.username && u.id !== editUserId)
    ) {
      errors.username = "El nombre de usuario ya está en uso";
    }

    if (Object.keys(errors).length > 0) {
      setEditUserFormErrors(errors);
      return;
    }

    if (editUserId == null) return;

    const updated: AppUser = {
      id: editUserId,
      fullName: editUserForm.fullName || "",
      username: editUserForm.username || "",
      email: editUserForm.email || "",
      password: users.find((u) => u.id === editUserId)?.password || "",
      roleName: editUserForm.roleName || "Ejecutivo",
      isActive: editUserForm.isActive ?? true,
      lastLogin: users.find((u) => u.id === editUserId)?.lastLogin || null,
    };

    setUsers((prev) => prev.map((u) => (u.id === editUserId ? updated : u)));
    setIsEditingUser(false);
    resetEditUserForm();
    setEditUserSubmitAttempt(false);
    setUserSuccessMessage("Usuario actualizado correctamente");
    setTimeout(() => setUserSuccessMessage(null), 3000);
  }

  function handleToggleUserActive(userId: number) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      )
    );
  }

  function handleCreateUser(e: any) {
    e.preventDefault();
    setUserSubmitAttempt(true);
    const errors: Record<string, string> = {};
    if (!userForm.fullName || !userForm.fullName.trim()) errors.fullName = "El nombre completo es requerido";
    if (!userForm.email || !userForm.email.trim() || !isValidEmail(userForm.email)) errors.email = "Email inválido";
    if (!userForm.username || !userForm.username.trim()) errors.username = "El usuario es requerido";
    if (!userForm.password || !userForm.password.trim()) errors.password = "La contraseña es requerida";

    // duplicate checks
    if (userForm.email && users.some(u => u.email === userForm.email)) {
      errors.email = "Ya existe un usuario con ese email";
    }
    if (userForm.username && users.some(u => u.username === userForm.username)) {
      errors.username = "El nombre de usuario ya está en uso";
    }

    if (Object.keys(errors).length > 0) {
      setUserFormErrors(errors);
      return;
    }

    const nextId = Math.max(0, ...users.map((u) => u.id)) + 1;
    const newUser: AppUser = {
      id: nextId,
      username: userForm.username || `user${nextId}`,
      email: userForm.email || "",
      fullName: userForm.fullName || "",
      password: userForm.password || "",
      roleName: userForm.roleName || roles[1]?.name || "Ejecutivo",
      isActive: userForm.isActive ?? true,
      lastLogin: null,
    };
    setUsers((prev) => [newUser, ...prev]);
    setIsCreatingUser(false);
    resetUserForm();
    setUserFormErrors({});
    setUserSubmitAttempt(false);
    setUserSuccessMessage('Usuario creado correctamente');
    setTimeout(() => setUserSuccessMessage(null), 3000);
  }

  return (
    <div>
      {/* -- Page header -- */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Users className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Usuarios y Roles
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Administra los usuarios del sistema y sus permisos
            </p>
          </div>
        </div>

        {activeTab === "usuarios" && (
          <div>
            <button
              type="button"
              onClick={() => setIsCreatingUser(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              <Plus className="h-4 w-4" />
              Nuevo Usuario
            </button>
          </div>
        )}
      </div>

      {/* -- Tab navigation -- */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`inline-flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${activeTab === tab.value
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* -- Tab content -- */}
      {activeTab === "usuarios" && (
        <UsuariosTab users={users} onEdit={openEditUser} onResetPassword={openResetPassword} onToggleActive={handleToggleUserActive} />
      )}
      {activeTab === "roles" && (
        <RolesTab rolesList={rolesList} onCreateRole={() => setIsCreatingRole(true)} onEditPermissions={openEditPermissionsModal} />
      )}
      {activeTab === "permisos" && <MatrizPermisosTab />}

      {/* Create user modal */}
      {isCreatingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreateUser} className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Nuevo Usuario</h3>
            {userSuccessMessage && (
              <div className="mb-3 rounded-md bg-green-50 p-2 text-sm font-medium text-green-700">{userSuccessMessage}</div>
            )}
            <div className="mb-3">
              <label htmlFor="create-user-fullname" className="block text-xs text-gray-600">Nombre Completo</label>
              <input
                id="create-user-fullname"
                value={userForm.fullName}
                onChange={(e) => {
                  setUserForm((f) => ({ ...f, fullName: e.target.value }));
                  setUserFormErrors((prev) => { const next = { ...prev }; delete next.fullName; return next; });
                }}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
              {(userSubmitAttempt && !userForm.fullName) && (
                <p className="mt-1 text-xs text-red-600">El nombre completo es requerido</p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="create-user-email" className="block text-xs text-gray-600">Email</label>
                <input
                  id="create-user-email"
                  value={userForm.email}
                  onChange={(e) => {
                    setUserForm((f) => ({ ...f, email: e.target.value }));
                    setUserFormErrors((prev) => { const next = { ...prev }; delete next.email; return next; });
                  }}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
                {(userSubmitAttempt && !isValidEmail(userForm.email)) && (
                  <p className="mt-1 text-xs text-red-600">Ingrese un email válido</p>
                )}
              </div>
              <div>
                <label htmlFor="create-user-username" className="block text-xs text-gray-600">Usuario</label>
                <input
                  id="create-user-username"
                  value={userForm.username}
                  onChange={(e) => {
                    setUserForm((f) => ({ ...f, username: e.target.value }));
                    setUserFormErrors((prev) => { const next = { ...prev }; delete next.username; return next; });
                  }}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
                {(userSubmitAttempt && !userForm.username) && (
                  <p className="mt-1 text-xs text-red-600">El usuario es requerido</p>
                )}
              </div>
            </div>

            <div className="mt-3">
              <label htmlFor="create-user-password" className="block text-xs text-gray-600">Contraseña</label>
              <input
                id="create-user-password"
                type="password"
                value={userForm.password}
                onChange={(e) => {
                  setUserForm((f) => ({ ...f, password: e.target.value }));
                  setUserFormErrors((prev) => { const next = { ...prev }; delete next.password; return next; });
                }}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
              {(userSubmitAttempt && !userForm.password) && (
                <p className="mt-1 text-xs text-red-600">La contraseña es requerida</p>
              )}
            </div>

            <div className="mt-3">
              <label htmlFor="create-user-role" className="block text-xs text-gray-600">Rol asignado</label>
              <select id="create-user-role" value={userForm.roleName} onChange={(e) => setUserForm(f => ({ ...f, roleName: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2">
                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>

            <div className="mt-3">
              <label htmlFor="create-user-status" className="block text-xs text-gray-600">Estado</label>
              <select
                id="create-user-status"
                value={userForm.isActive ? "active" : "inactive"}
                onChange={(e) => setUserForm((f) => ({ ...f, isActive: e.target.value === "active" }))}
                className="mt-1 w-full rounded-md border px-3 py-2"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setIsCreatingUser(false); resetUserForm(); }} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Crear</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit user modal */}
      {isEditingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleUpdateUser} className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Editar Usuario</h3>
            {userSuccessMessage && (
              <div className="mb-3 rounded-md bg-green-50 p-2 text-sm font-medium text-green-700">{userSuccessMessage}</div>
            )}
            <div className="mb-3">
              <label htmlFor="edit-user-fullname" className="block text-xs text-gray-600">Nombre Completo</label>
              <input
                id="edit-user-fullname"
                value={editUserForm.fullName ?? ""}
                onChange={(e) => {
                  setEditUserForm((f) => ({ ...f, fullName: e.target.value }));
                  setEditUserFormErrors((prev) => { const next = { ...prev }; delete next.fullName; return next; });
                }}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
              {(editUserSubmitAttempt && !editUserForm.fullName) && (
                <p className="mt-1 text-xs text-red-600">El nombre completo es requerido</p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-user-username" className="block text-xs text-gray-600">Usuario</label>
                <input
                  id="edit-user-username"
                  value={editUserForm.username ?? ""}
                  onChange={(e) => {
                    setEditUserForm((f) => ({ ...f, username: e.target.value }));
                    setEditUserFormErrors((prev) => { const next = { ...prev }; delete next.username; return next; });
                  }}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
                {(editUserSubmitAttempt && !editUserForm.username) && (
                  <p className="mt-1 text-xs text-red-600">El usuario es requerido</p>
                )}
              </div>
              <div>
                <label htmlFor="edit-user-email" className="block text-xs text-gray-600">Email</label>
                <input
                  id="edit-user-email"
                  value={editUserForm.email ?? ""}
                  onChange={(e) => {
                    setEditUserForm((f) => ({ ...f, email: e.target.value }));
                    setEditUserFormErrors((prev) => { const next = { ...prev }; delete next.email; return next; });
                  }}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
                {(editUserSubmitAttempt && !isValidEmail(editUserForm.email)) && (
                  <p className="mt-1 text-xs text-red-600">Ingrese un email válido</p>
                )}
              </div>
            </div>

            <div className="mt-3">
              <label htmlFor="edit-user-role" className="block text-xs text-gray-600">Rol</label>
              <select id="edit-user-role" value={editUserForm.roleName ?? "Ejecutivo"} onChange={(e) => setEditUserForm(f => ({ ...f, roleName: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2">
                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>

            <div className="mt-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editUserForm.isActive ?? true}
                  onChange={(e) => setEditUserForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Usuario activo</span>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setIsEditingUser(false); resetEditUserForm(); }} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit user modal */}
      {isEditingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleUpdateUser} className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Editar Usuario</h3>
            {userSuccessMessage && (
              <div className="mb-3 rounded-md bg-green-50 p-2 text-sm font-medium text-green-700">{userSuccessMessage}</div>
            )}
            <div className="mb-3">
              <label htmlFor="edit-user-fullname" className="block text-xs text-gray-600">Nombre Completo</label>
              <input
                id="edit-user-fullname"
                value={editUserForm.fullName ?? ""}
                onChange={(e) => {
                  setEditUserForm((f) => ({ ...f, fullName: e.target.value }));
                  setEditUserFormErrors((prev) => { const next = { ...prev }; delete next.fullName; return next; });
                }}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
              {(editUserSubmitAttempt && !editUserForm.fullName) && (
                <p className="mt-1 text-xs text-red-600">El nombre completo es requerido</p>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-user-username" className="block text-xs text-gray-600">Usuario</label>
                <input
                  id="edit-user-username"
                  value={editUserForm.username ?? ""}
                  onChange={(e) => {
                    setEditUserForm((f) => ({ ...f, username: e.target.value }));
                    setEditUserFormErrors((prev) => { const next = { ...prev }; delete next.username; return next; });
                  }}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
                {(editUserSubmitAttempt && !editUserForm.username) && (
                  <p className="mt-1 text-xs text-red-600">El usuario es requerido</p>
                )}
              </div>
              <div>
                <label htmlFor="edit-user-email" className="block text-xs text-gray-600">Email</label>
                <input
                  id="edit-user-email"
                  value={editUserForm.email ?? ""}
                  onChange={(e) => {
                    setEditUserForm((f) => ({ ...f, email: e.target.value }));
                    setEditUserFormErrors((prev) => { const next = { ...prev }; delete next.email; return next; });
                  }}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
                {(editUserSubmitAttempt && !isValidEmail(editUserForm.email)) && (
                  <p className="mt-1 text-xs text-red-600">Ingrese un email válido</p>
                )}
              </div>
            </div>

            <div className="mt-3">
              <label htmlFor="edit-user-role" className="block text-xs text-gray-600">Rol</label>
              <select id="edit-user-role" value={editUserForm.roleName ?? "Ejecutivo"} onChange={(e) => setEditUserForm(f => ({ ...f, roleName: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2">
                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>

            <div className="mt-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editUserForm.isActive ?? true}
                  onChange={(e) => setEditUserForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Usuario activo</span>
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setIsEditingUser(false); resetEditUserForm(); }} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* Reset password modal */}
      {isResettingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleResetPassword} className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Reset Password</h3>
            {resetPasswordSuccessMessage && (
              <div className="mb-3 rounded-md bg-green-50 p-2 text-sm font-medium text-green-700">{resetPasswordSuccessMessage}</div>
            )}
            <div className="mb-4 rounded-md bg-slate-50 p-3 text-xs leading-5 text-slate-700 ring-1 ring-inset ring-slate-200">
              Mínimo {CORPORATE_PASSWORD_MIN_LENGTH} caracteres, con mayúsculas, minúsculas, números y símbolos.
            </div>
            <p className="mb-4 text-sm text-gray-500">
              Usuario: <span className="font-medium text-gray-900">{users.find((u) => u.id === resetPasswordUserId)?.fullName ?? ""}</span>
            </p>
            <div className="mb-3">
              <label htmlFor="reset-password-new" className="block text-xs text-gray-600">Nueva contraseña</label>
              <input
                id="reset-password-new"
                type="password"
                value={resetPasswordForm.password}
                onChange={(e) => {
                  setResetPasswordForm((f) => ({ ...f, password: e.target.value }));
                  setResetPasswordErrors((prev) => { const next = { ...prev }; delete next.password; return next; });
                }}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
              {(resetPasswordSubmitAttempt && resetPasswordErrors.password) && (
                <p className="mt-1 text-xs text-red-600">{resetPasswordErrors.password}</p>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="reset-password-confirm" className="block text-xs text-gray-600">Confirmar contraseña</label>
              <input
                id="reset-password-confirm"
                type="password"
                value={resetPasswordForm.confirmPassword}
                onChange={(e) => {
                  setResetPasswordForm((f) => ({ ...f, confirmPassword: e.target.value }));
                  setResetPasswordErrors((prev) => { const next = { ...prev }; delete next.confirmPassword; return next; });
                }}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
              {(resetPasswordSubmitAttempt && resetPasswordErrors.confirmPassword) && (
                <p className="mt-1 text-xs text-red-600">{resetPasswordErrors.confirmPassword}</p>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsResettingPassword(false);
                  resetResetPasswordForm();
                }}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Guardar nueva contraseña</button>
            </div>
          </form>
        </div>
      )}

      {/* Create role modal */}
      {isCreatingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreateRole} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Nuevo Rol</h3>
            {roleSuccessMessage && (
              <div className="mb-3 rounded-md bg-green-50 p-2 text-sm font-medium text-green-700">{roleSuccessMessage}</div>
            )}
            <div className="mb-3">
              <label htmlFor="create-role-name" className="block text-xs text-gray-600">Nombre del Rol</label>
              <input
                id="create-role-name"
                value={newRoleForm.name}
                onChange={(e) => {
                  setNewRoleForm((f) => ({ ...f, name: e.target.value }));
                  setNewRoleFormErrors((prev) => { const next = { ...prev }; delete next.name; return next; });
                }}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
              {(roleSubmitAttempt && !newRoleForm.name) && (
                <p className="mt-1 text-xs text-red-600">El nombre del rol es requerido</p>
              )}
              {newRoleFormErrors.name && (
                <p className="mt-1 text-xs text-red-600">{newRoleFormErrors.name}</p>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="create-role-desc" className="block text-xs text-gray-600">Descripción</label>
              <textarea
                id="create-role-desc"
                value={newRoleForm.description}
                onChange={(e) => setNewRoleForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded-md border px-3 py-2"
                rows={3}
              />
            </div>

            <div className="mb-3">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs text-gray-600">Permisos</label>
                <span className="text-xs text-gray-500">{newRoleForm.permissions?.length || 0} seleccionados</span>
              </div>

              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                {Object.entries(groupPermissionsByModule()).map(([module, permissions]) => (
                  <div key={module} className="rounded-md bg-gray-50/70 p-3">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{module}</h4>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {permissions.map((perm) => (
                        <label key={perm.code} className="flex items-start gap-2 rounded-md bg-white px-3 py-2 ring-1 ring-inset ring-gray-200">
                          <input
                            type="checkbox"
                            checked={newRoleForm.permissions?.includes(perm.code) ?? false}
                            onChange={() => toggleNewRolePermission(perm.code)}
                            className="mt-0.5 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{perm.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setIsCreatingRole(false); resetNewRoleForm(); }} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Crear</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit permissions modal */}
      {isEditingPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleUpdatePermissions} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Editar Permisos - {rolesList.find((r) => r.id === editPermissionsRoleId)?.name}</h3>
            {permissionsSuccessMessage && (
              <div className="mb-3 rounded-md bg-green-50 p-2 text-sm font-medium text-green-700">{permissionsSuccessMessage}</div>
            )}

            <div className="space-y-4">
              {Object.entries(
                allPermissions.reduce<Record<string, typeof allPermissions>>((acc, perm) => {
                  if (!acc[perm.module]) acc[perm.module] = [];
                  acc[perm.module].push(perm);
                  return acc;
                }, {})
              ).map(([module, permissions]) => {
                const currentRole = rolesList.find((r) => r.id === editPermissionsRoleId);
                const isAdmin = currentRole?.name === "Administrador";

                return (
                  <div key={module} className="rounded-lg border border-gray-200 p-4">
                    <h4 className="mb-3 font-semibold text-gray-900">{module}</h4>
                    <div className="space-y-2">
                      {permissions.map((perm) => {
                        const isRoleManage = perm.code === "role.manage";
                        const isDisabled = isRoleManage && !isAdmin;

                        return (
                          <label key={perm.code} className={`flex items-center gap-2 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}>
                            <input
                              type="checkbox"
                              checked={editPermissionsForm[perm.code] ?? false}
                              onChange={() => !isDisabled && togglePermission(perm.code)}
                              disabled={isDisabled}
                              className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{perm.name}</span>
                            {isRoleManage && !isAdmin && (
                              <span className="ml-auto text-xs text-gray-500">(Solo Administrador)</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditingPermissions(false);
                  setEditPermissionsRoleId(null);
                  setEditPermissionsForm({});
                }}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
                Guardar Permisos
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
