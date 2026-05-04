import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import { suppliers, supplierUploads, type SupplierUpload } from "@/lib/mock-data";

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + " · " + d.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusPill({ status }: { status: SupplierUpload["status"] }) {
  const map = {
    completed: { label: "Completada", cls: "bg-green-50 text-green-700 ring-green-600/20", Icon: CheckCircle2 },
    processing: { label: "Procesando", cls: "bg-blue-50 text-blue-700 ring-blue-600/20", Icon: Clock },
    failed: { label: "Fallida", cls: "bg-red-50 text-red-700 ring-red-600/20", Icon: XCircle },
    pending_review: { label: "Pendiente revisión", cls: "bg-amber-50 text-amber-700 ring-amber-500/20", Icon: AlertCircle },
  } as const;
  const { label, cls, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export default async function CargasProveedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplierId = parseInt(id, 10);
  const supplier = suppliers.find((s) => s.id === supplierId);

  if (!supplier) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Proveedor no encontrado</p>
      </div>
    );
  }

  const uploads = supplierUploads
    .filter((u) => u.supplierId === supplierId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

  const totalProducts = uploads.reduce((acc, u) => acc + u.newProducts, 0);
  const totalDuplicates = uploads.reduce((acc, u) => acc + u.duplicates, 0);
  const totalErrors = uploads.reduce((acc, u) => acc + u.errors, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/proveedores"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de Cargas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Cargas de productos del proveedor
          </p>
        </div>
      </div>

      {/* Supplier info card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">{supplier.name}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="text-xs text-gray-500">RUC</p>
            <p className="font-medium text-gray-900">{supplier.ruc}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Código</p>
            <p className="font-medium text-gray-900">{supplier.code}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email Contacto</p>
            <p className="font-medium text-gray-900">{supplier.contactEmail}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Teléfono</p>
            <p className="font-medium text-gray-900">{supplier.contactPhone ?? "-"}</p>
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total cargas</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{uploads.length}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Productos nuevos</p>
          <p className="mt-2 text-2xl font-bold text-green-600">{totalProducts}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Duplicados</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{totalDuplicates}</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Errores</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{totalErrors}</p>
        </div>
      </div>

      {/* Uploads table */}
      {uploads.length === 0 ? (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="flex h-96 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
              <UploadCloud className="h-8 w-8 text-brand-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No hay cargas recientes</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Este proveedor todavía no ha realizado ninguna carga de productos en el sistema.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h3 className="text-base font-semibold text-gray-900">Cargas registradas</h3>
            <Link
              href={`/cargar-plantilla?ruc=${supplier.ruc}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              <UploadCloud className="h-4 w-4" />
              Nueva carga
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="py-3.5 pl-6 pr-3">Archivo</th>
                  <th className="px-3 py-3.5">Fecha</th>
                  <th className="px-3 py-3.5 text-center">Filas</th>
                  <th className="px-3 py-3.5 text-center">Nuevos</th>
                  <th className="px-3 py-3.5 text-center">Duplicados</th>
                  <th className="px-3 py-3.5 text-center">Errores</th>
                  <th className="px-3 py-3.5">Estado</th>
                  <th className="px-3 py-3.5">Usuario</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {uploads.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-gray-50/60">
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50">
                          <FileText className="h-4 w-4 text-brand-600" />
                        </div>
                        <span className="font-medium text-gray-900">{u.fileName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-gray-600">{fmtDateTime(u.uploadedAt)}</td>
                    <td className="px-3 py-4 text-center font-semibold text-gray-900">{u.totalRows}</td>
                    <td className="px-3 py-4 text-center font-semibold text-green-600">{u.newProducts}</td>
                    <td className="px-3 py-4 text-center font-semibold text-amber-600">{u.duplicates}</td>
                    <td className="px-3 py-4 text-center font-semibold text-red-600">{u.errors}</td>
                    <td className="px-3 py-4"><StatusPill status={u.status} /></td>
                    <td className="px-3 py-4 text-gray-600">{u.uploadedBy}</td>
                    <td className="py-4 pl-3 pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Descargar archivo original"
                          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-6 py-3.5">
            <p className="text-sm text-gray-500">
              Mostrando{" "}
              <span className="font-medium text-gray-900">{uploads.length}</span>{" "}
              {uploads.length === 1 ? "carga" : "cargas"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
