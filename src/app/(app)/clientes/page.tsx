"use client";

import { Fragment, useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Building2,
  Pencil,
  FolderTree,
  FileOutput,
  Globe,
  Server,
  Search,
  Check,
  X,
} from "lucide-react";
import { clients, type Client } from "@/lib/mock-data";
import { isValidEmail } from "@/lib/validators";

/* ------------------------------------------------------------------ */
/*  Type badge                                                          */
/* ------------------------------------------------------------------ */
function TypeBadge({ type }: { type: Client["type"] }) {
  const config: Record<
    Client["type"],
    { label: string; bg: string; text: string; ring: string; icon: React.ReactNode }
  > = {
    web_app: {
      label: "Web App",
      bg: "bg-blue-50",
      text: "text-blue-700",
      ring: "ring-blue-600/20",
      icon: <Globe className="h-3 w-3" />,
    },
    erp: {
      label: "ERP",
      bg: "bg-purple-50",
      text: "text-purple-700",
      ring: "ring-purple-600/20",
      icon: <Server className="h-3 w-3" />,
    },
    marketplace: {
      label: "Marketplace",
      bg: "bg-orange-50",
      text: "text-orange-700",
      ring: "ring-orange-600/20",
      icon: <Building2 className="h-3 w-3" />,
    },
  };

  const c = config[type];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${c.bg} ${c.text} ${c.ring}`}
    >
      {c.icon}
      {c.label}
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
/*  Page component                                                      */
/* ------------------------------------------------------------------ */
export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [openClientId, setOpenClientId] = useState<number | null>(null);
  const [list, setList] = useState<Client[]>(clients);
  const [isCreating, setIsCreating] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [form, setForm] = useState<Partial<Client>>({
    name: "",
    type: "web_app",
    description: "",
    contactEmail: "",
    contactPhone: "",
    pointsConversionFactor: null,
    isActive: true,
    categoriesCount: 0,
    hasOutputTemplate: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [clientSubmitAttempt, setClientSubmitAttempt] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit flow
  const [isEditing, setIsEditing] = useState(false);
  const [editClientId, setEditClientId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  const [editSubmitAttempt, setEditSubmitAttempt] = useState(false);

  function isValidPhone(phone?: string) {
    if (!phone) return true; // optional
    // simple validation: allow +, numbers, spaces, dashes, parentheses
    return /^\+?[0-9 ()-]{7,}$/.test(phone);
  }

  function resetForm() {
    setForm({
      name: "",
      type: "web_app",
      description: "",
      contactEmail: "",
      contactPhone: "",
      pointsConversionFactor: null,
      isActive: true,
      categoriesCount: 0,
      hasOutputTemplate: false,
    });
  }

  function resetEditForm() {
    setEditForm({});
    setEditFormErrors({});
    setEditClientId(null);
  }

  function openEditClient(c: Client) {
    setEditClientId(c.id);
    setEditForm({
      name: c.name,
      type: c.type,
      description: c.description,
      contactEmail: c.contactEmail,
      contactPhone: c.contactPhone,
      pointsConversionFactor: c.pointsConversionFactor,
      isActive: c.isActive,
      categoriesCount: c.categoriesCount,
      hasOutputTemplate: c.hasOutputTemplate,
    });
    setIsEditing(true);
  }

  function handleUpdateClient(e: any) {
    e.preventDefault();
    setEditSubmitAttempt(true);
    const errors: Record<string, string> = {};
    if (!editForm.name || !editForm.name.trim()) errors.name = "El nombre es requerido";
    if (!isValidEmail(editForm.contactEmail)) errors.contactEmail = "Email inválido";

    // check duplicates by email (exclude current)
    if (
      editForm.contactEmail &&
      list.some((c) => c.contactEmail === editForm.contactEmail && c.id !== editClientId)
    ) {
      errors.contactEmail = "Ya existe un cliente con ese email";
    }

    if (editForm.contactPhone && !isValidPhone(editForm.contactPhone)) {
      errors.contactPhone = "Teléfono inválido";
    }

    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    if (editClientId == null) return;

    const updated: Client = {
      id: editClientId,
      name: editForm.name || `Cliente ${editClientId}`,
      type: (editForm.type as Client["type"]) || "web_app",
      description: editForm.description || "",
      pointsConversionFactor:
        typeof editForm.pointsConversionFactor === "number"
          ? editForm.pointsConversionFactor
          : null,
      isActive: editForm.isActive ?? true,
      categoriesCount: editForm.categoriesCount ?? 0,
      hasOutputTemplate: editForm.hasOutputTemplate ?? false,
      contactEmail: editForm.contactEmail,
      contactPhone: editForm.contactPhone,
    };

    setList((prev) => prev.map((c) => (c.id === editClientId ? updated : c)));
    setIsEditing(false);
    resetEditForm();
    setEditSubmitAttempt(false);
    setSuccessMessage("Cliente actualizado correctamente");
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  function resetFilters() {
    setSearch("");
    setTypeFilter("");
    setStatusFilter("all");
  }

  function handleCreateClient(e: any) {
    e.preventDefault();
    setClientSubmitAttempt(true);
    const errors: Record<string, string> = {};
    if (!form.name || !form.name.trim()) errors.name = "El nombre es requerido";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const nextId = Math.max(0, ...list.map((c) => c.id)) + 1;
    const newClient: Client = {
      id: nextId,
      name: form.name || `Cliente ${nextId}`,
      type: (form.type as Client["type"]) || "web_app",
      description: form.description || "",
      pointsConversionFactor:
        typeof form.pointsConversionFactor === "number"
          ? form.pointsConversionFactor
          : null,
      isActive: form.isActive ?? true,
      categoriesCount: form.categoriesCount ?? 0,
      hasOutputTemplate: form.hasOutputTemplate ?? false,
    };

    setList((prev) => [newClient, ...prev]);
    setIsCreating(false);
    resetForm();
    setFormErrors({});
    setClientSubmitAttempt(false);
    setSuccessMessage("Cliente creado correctamente");
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return list.filter((c) => {
      // text match (if search provided)
      const matchesText =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        (c.contactEmail ?? "").toLowerCase().includes(q) ||
        (c.contactPhone ?? "").toLowerCase().includes(q);

      if (!matchesText) return false;

      // type filter
      if (typeFilter && c.type !== typeFilter) return false;

      // status filter
      if (statusFilter === "active" && !c.isActive) return false;
      if (statusFilter === "inactive" && c.isActive) return false;

      return true;
    });
  }, [search, list, typeFilter, statusFilter]);

  return (
    <div>
      {/* -- Page header -- */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
            <Building2 className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Clientes
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Administra los clientes, sus categorías y plantillas de salida
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* -- Search bar -- */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="sm:flex sm:items-center sm:gap-4">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, tipo, descripción, email o teléfono..."
              className="w-full rounded-lg border border-gray-200 bg-surface py-2 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="mt-3 sm:mt-0 flex items-center gap-2">
            <select
              aria-label="Filtrar por tipo"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-700"
            >
              <option value="">Todos los tipos</option>
              <option value="web_app">Web App</option>
              <option value="erp">ERP</option>
              <option value="marketplace">Marketplace</option>
            </select>

            <select
              aria-label="Filtrar por estado"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-700"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* -- Data table card -- */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="py-3.5 pl-6 pr-3">Nombre</th>
                <th className="px-3 py-3.5">Tipo</th>
                <th className="px-3 py-3.5">Descripción</th>
                <th className="px-3 py-3.5 text-center">Factor Puntos</th>
                <th className="px-3 py-3.5 text-center">Categorías</th>
                <th className="px-3 py-3.5 text-center">Plantilla</th>
                <th className="px-3 py-3.5 text-center">Estado</th>
                <th className="py-3.5 pl-3 pr-6 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-sm text-gray-400"
                  >
                    No se encontraron clientes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <Fragment key={c.id}>
                    <tr className="group transition-colors hover:bg-gray-50/60">
                      {/* Name */}
                      <td className="py-4 pl-6 pr-3">
                        <span className="font-medium text-gray-900">
                          {c.name}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-3 py-4">
                        <TypeBadge type={c.type} />
                      </td>

                      {/* Description */}
                      <td className="max-w-xs truncate px-3 py-4 text-gray-600">
                        {c.description}
                      </td>

                      {/* Points Factor */}
                      <td className="px-3 py-4 text-center">
                        {c.pointsConversionFactor !== null ? (
                          <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-500/20">
                            {c.pointsConversionFactor}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </td>

                      {/* Categories count */}
                      <td className="px-3 py-4 text-center font-semibold text-gray-900">
                        {c.categoriesCount}
                      </td>

                      {/* Template */}
                      <td className="px-3 py-4 text-center">
                        {c.hasOutputTemplate ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-50 text-green-600">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <X className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-4 text-center">
                        <StatusBadge active={c.isActive} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-3 pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Editar cliente"
                            onClick={() => openEditClient(c)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <Link
                            href={`/clientes/${c.id}/categorias`}
                            title="Gestionar Categorías"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          >
                            <FolderTree className="h-4 w-4" />
                          </Link>

                          <Link
                            href={`/clientes/${c.id}/plantilla-salida`}
                            title="Configurar Plantilla"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600"
                          >
                            <FileOutput className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setOpenClientId(openClientId === c.id ? null : c.id)}
                            title="Ver contacto"
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Building2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {openClientId === c.id && (
                      <tr key={`details-${c.id}`} className="bg-gray-50">
                        <td colSpan={8} className="px-6 py-3 text-sm text-gray-700">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-xs text-gray-500">Contacto</p>
                                <p className="font-medium text-gray-900">{c.contactPhone ?? "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{c.contactEmail ?? "-"}</p>
                              </div>
                            </div>
                            <div className="mt-2 sm:mt-0 text-sm text-gray-500">
                              Categorías: <span className="font-medium text-gray-900">{c.categoriesCount}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* -- Table footer -- */}
        <div className="border-t border-gray-100 px-6 py-3.5">
          <p className="text-sm text-gray-500">
            Mostrando{" "}
            <span className="font-medium text-gray-900">
              {filtered.length}
            </span>{" "}
            de{" "}
            <span className="font-medium text-gray-900">
              {list.length}
            </span>{" "}
            clientes
          </p>
        </div>
      </div>

      {/* Create modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleCreateClient} className="w-full max-w-lg rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Nuevo Cliente</h3>
            {successMessage && (
              <div className="mb-3 rounded-md bg-green-50 p-2 text-sm font-medium text-green-700">{successMessage}</div>
            )}
            <div className="mb-3">
              <label htmlFor="create-client-name" className="block text-xs text-gray-600">Nombre</label>
              <input
                id="create-client-name"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                  setFormErrors((prev) => {
                    const next = { ...prev };
                    delete next.name;
                    return next;
                  });
                }}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
              {(clientSubmitAttempt && !form.name) && (
                <p className="mt-1 text-xs text-red-600">El nombre es requerido</p>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="create-client-type" className="block text-xs text-gray-600">Tipo</label>
              <select
                id="create-client-type"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Client["type"] }))}
                className="mt-1 w-full rounded-md border px-3 py-2"
              >
                <option value="web_app">Web</option>
                <option value="erp">ERP</option>
                <option value="marketplace">Marketplace</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="create-client-desc" className="block text-xs text-gray-600">Descripción</label>
              <input
                id="create-client-desc"
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="create-client-active" className="block text-xs text-gray-600">Estado activo</label>
              <select
                id="create-client-active"
                value={form.isActive ? "active" : "inactive"}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === "active" }))}
                className="mt-1 w-full rounded-md border px-3 py-2"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setIsCreating(false); resetForm(); }} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Crear</button>
            </div>
          </form>
        </div>
      )}
      {/* Edit modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleUpdateClient} className="w-full max-w-lg rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Editar Cliente</h3>
            {successMessage && (
              <div className="mb-3 rounded-md bg-green-50 p-2 text-sm font-medium text-green-700">{successMessage}</div>
            )}
            <div className="mb-3">
              <label htmlFor="edit-client-name" className="block text-xs text-gray-600">Nombre</label>
              <input
                id="edit-client-name"
                value={editForm.name ?? ""}
                onChange={(e) => {
                  setEditForm((f) => ({ ...f, name: e.target.value }));
                  setEditFormErrors((prev) => {
                    const next = { ...prev };
                    delete next.name;
                    return next;
                  });
                }}
                className="mt-1 w-full rounded-md border px-3 py-2"
              />
              {(editSubmitAttempt && !editForm.name) && (
                <p className="mt-1 text-xs text-red-600">El nombre es requerido</p>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit-client-desc" className="block text-xs text-gray-600">Descripción</label>
              <input id="edit-client-desc" value={editForm.description ?? ""} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-client-email" className="block text-xs text-gray-600">Email</label>
                <input
                  id="edit-client-email"
                  value={editForm.contactEmail ?? ""}
                  onChange={(e) => {
                    setEditForm((f) => ({ ...f, contactEmail: e.target.value }));
                    setEditFormErrors((prev) => {
                      const next = { ...prev };
                      delete next.contactEmail;
                      return next;
                    });
                  }}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                />
                {(editSubmitAttempt && !isValidEmail(editForm.contactEmail)) && (
                  <p className="mt-1 text-xs text-red-600">Ingrese un email válido</p>
                )}
              </div>
              <div>
                <label htmlFor="edit-client-phone" className="block text-xs text-gray-600">Teléfono</label>
                <input id="edit-client-phone" value={editForm.contactPhone ?? ""} onChange={(e) => setEditForm(f => ({ ...f, contactPhone: e.target.value }))} className="mt-1 w-full rounded-md border px-3 py-2" />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { setIsEditing(false); resetEditForm(); }} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button>
              <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
