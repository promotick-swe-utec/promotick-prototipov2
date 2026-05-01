import Link from "next/link";
import { ArrowLeft, FileText, UploadCloud } from "lucide-react";
import { suppliers } from "@/lib/mock-data";

export default function CargasProveedorPage({ params }: { params: { id: string } }) {
  const supplierId = parseInt(params.id, 10);
  const supplier = suppliers.find((s) => s.id === supplierId);

  if (!supplier) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Proveedor no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <div className="flex h-96 flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <UploadCloud className="h-8 w-8 text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No hay cargas recientes</h3>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            Este proveedor todavía no ha realizado ninguna carga de productos en el sistema.
          </p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700">
            <FileText className="h-4 w-4" />
            Simular nueva carga
          </button>
        </div>
      </div>
    </div>
  );
}
