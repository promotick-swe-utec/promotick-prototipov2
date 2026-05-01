// ─── Mock Data para Promotick ───

export interface Supplier {
  id: number;
  name: string;
  code: string;
  ruc: string;
  contactEmail: string;
  contactPhone: string;
  preferred: boolean;
  isActive: boolean;
  uploadsCount: number;
  lastUpload: string | null;
}

export interface Category {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  categoryId: number;
  code: string;
  name: string;
  description: string;
  currentSequence: number;
  isActive: boolean;
}

export interface Product {
  id: number;
  netsuiteCode: string;
  legacyCode: string | null;
  sku: string;
  ean: string | null;
  name: string;
  displayName: string;
  brand: string;
  model: string;
  categoryName: string;
  subcategoryName: string;
  status: "draft" | "active" | "inactive" | "pending_confirmation";
  imageMainUrl: string | null;
  officialPrice: number;
  preferredSupplier: string;
  lastPriceUpdate: string;
  weightKg: number | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
}

export interface ProductPrice {
  id: number;
  supplierName: string;
  price: number;
  priceWithTax: number;
  validFrom: string;
  validTo: string | null;
  isCurrent: boolean;
  isOfficial: boolean;
}

export interface Client {
  id: number;
  name: string;
  type: "web_app" | "erp" | "marketplace";
  description: string;
  pointsConversionFactor: number | null;
  isActive: boolean;
  categoriesCount: number;
  hasOutputTemplate: boolean;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ClientCategory {
  id: number;
  clientId: number;
  externalId: string;
  name: string;
  parentId: number | null;
  masterSubcategoryName: string | null;
  masterCategoryName: string | null;
}

export interface ExportJob {
  id: number;
  clientName: string;
  fileName: string;
  totalProducts: number;
  status: "pending" | "processing" | "completed" | "failed";
  generatedBy: string;
  createdAt: string;
  completedAt: string | null;
}

export interface AppUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
  lastLogin: string | null;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}

export interface UploadRow {
  rowNumber: number;
  sku: string;
  name: string;
  brand: string;
  price: string;
  category: string;
  status: "new" | "duplicate" | "error";
  duplicateOf?: string;
  similarityScore?: number;
}

export interface ColumnMapping {
  sourceColumn: string;
  targetField: string;
  confidence: number;
  aiSuggested: boolean;
}

// ─── Data ───

export const suppliers: Supplier[] = [
  { id: 1, name: "Distribuidora Lima SAC", code: "DL001", ruc: "20512345678", contactEmail: "ventas@distlima.pe", contactPhone: "+51 1 234-5678", preferred: true, isActive: true, uploadsCount: 23, lastUpload: "2026-04-25" },
  { id: 2, name: "Importaciones del Sur EIRL", code: "IS002", ruc: "20687654321", contactEmail: "contacto@importsur.pe", contactPhone: "+51 54 987-6543", preferred: false, isActive: true, uploadsCount: 15, lastUpload: "2026-04-20" },
  { id: 3, name: "Tech Solutions Peru SA", code: "TS003", ruc: "20798765432", contactEmail: "pedidos@techsol.pe", contactPhone: "+51 1 876-5432", preferred: false, isActive: true, uploadsCount: 8, lastUpload: "2026-04-18" },
  { id: 4, name: "Global Brands SAC", code: "GB004", ruc: "20654321098", contactEmail: "info@globalbrands.pe", contactPhone: "+51 1 567-8901", preferred: true, isActive: true, uploadsCount: 31, lastUpload: "2026-04-27" },
  { id: 5, name: "Proveedora Nacional SRL", code: "PN005", ruc: "20543210987", contactEmail: "ventas@provnac.pe", contactPhone: "+51 44 345-6789", preferred: false, isActive: false, uploadsCount: 5, lastUpload: "2026-02-10" },
];

export const categories: Category[] = [
  {
    id: 1, code: "AL", name: "Alimentación", description: "Productos alimenticios y bebidas", isActive: true,
    subcategories: [
      { id: 1, categoryId: 1, code: "01", name: "Snacks y Galletas", description: "Galletas, papas fritas, etc.", currentSequence: 142, isActive: true },
      { id: 2, categoryId: 1, code: "02", name: "Bebidas", description: "Agua, gaseosas, jugos", currentSequence: 87, isActive: true },
      { id: 3, categoryId: 1, code: "03", name: "Confitería", description: "Chocolates, caramelos, gomitas", currentSequence: 56, isActive: true },
    ],
  },
  {
    id: 2, code: "EL", name: "Electrónica", description: "Dispositivos electrónicos y accesorios", isActive: true,
    subcategories: [
      { id: 4, categoryId: 2, code: "01", name: "Audio y Video", description: "Audífonos, parlantes, cámaras", currentSequence: 234, isActive: true },
      { id: 5, categoryId: 2, code: "02", name: "Accesorios Móviles", description: "Cases, cargadores, cables", currentSequence: 189, isActive: true },
      { id: 6, categoryId: 2, code: "03", name: "Computación", description: "Periféricos, almacenamiento", currentSequence: 67, isActive: true },
    ],
  },
  {
    id: 3, code: "HG", name: "Hogar", description: "Artículos para el hogar y decoración", isActive: true,
    subcategories: [
      { id: 7, categoryId: 3, code: "01", name: "Cocina", description: "Utensilios, electrodomésticos", currentSequence: 312, isActive: true },
      { id: 8, categoryId: 3, code: "02", name: "Decoración", description: "Cuadros, velas, adornos", currentSequence: 98, isActive: true },
    ],
  },
  {
    id: 4, code: "DP", name: "Deportes", description: "Artículos deportivos y fitness", isActive: true,
    subcategories: [
      { id: 9, categoryId: 4, code: "01", name: "Fitness", description: "Mancuernas, bandas, mats", currentSequence: 45, isActive: true },
      { id: 10, categoryId: 4, code: "02", name: "Camping", description: "Carpas, linternas, termos", currentSequence: 23, isActive: false },
    ],
  },
  {
    id: 5, code: "CP", name: "Cuidado Personal", description: "Belleza, cuidado e higiene", isActive: true,
    subcategories: [
      { id: 11, categoryId: 5, code: "01", name: "Skincare", description: "Cremas, protectores", currentSequence: 178, isActive: true },
      { id: 12, categoryId: 5, code: "02", name: "Perfumería", description: "Perfumes y colonias", currentSequence: 92, isActive: true },
    ],
  },
];

export const products: Product[] = [
  { id: 1, netsuiteCode: "NS-EL-01-0234", legacyCode: null, sku: "AUD-BT-500X", ean: "7750123456789", name: "Audífono Bluetooth Sony WH-1000XM5", displayName: "Sony WH-1000XM5 Audífonos Inalámbricos", brand: "Sony", model: "WH-1000XM5", categoryName: "Electrónica", subcategoryName: "Audio y Video", status: "active", imageMainUrl: null, officialPrice: 1299.00, preferredSupplier: "Distribuidora Lima SAC", lastPriceUpdate: "2026-04-15", weightKg: 0.25, lengthCm: 22, widthCm: 18, heightCm: 8 },
  { id: 2, netsuiteCode: "NS-EL-02-0189", legacyCode: "LEGACY-0045", sku: "CHG-USB-C30W", ean: "7750234567890", name: "Cargador USB-C 30W Anker", displayName: "Anker Nano 30W Cargador Rápido USB-C", brand: "Anker", model: "Nano 30W", categoryName: "Electrónica", subcategoryName: "Accesorios Móviles", status: "active", imageMainUrl: null, officialPrice: 89.90, preferredSupplier: "Tech Solutions Peru SA", lastPriceUpdate: "2026-04-20", weightKg: 0.05, lengthCm: 5, widthCm: 3, heightCm: 3 },
  { id: 3, netsuiteCode: "NS-AL-01-0142", legacyCode: null, sku: "SNK-ORE-36P", ean: "7750345678901", name: "Oreo Original 36 Pack", displayName: "Galletas Oreo Original Pack Familiar", brand: "Oreo", model: "Original 36P", categoryName: "Alimentación", subcategoryName: "Snacks y Galletas", status: "active", imageMainUrl: null, officialPrice: 24.50, preferredSupplier: "Global Brands SAC", lastPriceUpdate: "2026-04-10", weightKg: 1.2, lengthCm: 30, widthCm: 20, heightCm: 15 },
  { id: 4, netsuiteCode: "NS-HG-01-0312", legacyCode: "LEGACY-1201", sku: "COC-LIC-750ML", ean: null, name: "Licuadora Oster Pro 750ml", displayName: "Oster Pro Licuadora 750ml 600W", brand: "Oster", model: "Pro 750", categoryName: "Hogar", subcategoryName: "Cocina", status: "active", imageMainUrl: null, officialPrice: 199.90, preferredSupplier: "Distribuidora Lima SAC", lastPriceUpdate: "2026-03-28", weightKg: 3.5, lengthCm: 40, widthCm: 20, heightCm: 20 },
  { id: 5, netsuiteCode: "NS-CP-01-0178", legacyCode: null, sku: "SK-CRM-50ML", ean: "7750456789012", name: "Crema Hidratante CeraVe 50ml", displayName: "CeraVe Crema Hidratante Facial 50ml", brand: "CeraVe", model: "Hydrating Cream", categoryName: "Cuidado Personal", subcategoryName: "Skincare", status: "active", imageMainUrl: null, officialPrice: 65.00, preferredSupplier: "Importaciones del Sur EIRL", lastPriceUpdate: "2026-04-22", weightKg: 0.08, lengthCm: 8, widthCm: 5, heightCm: 5 },
  { id: 6, netsuiteCode: "NS-DP-01-0045", legacyCode: null, sku: "FIT-MAT-6MM", ean: "7750567890123", name: "Mat de Yoga 6mm TPE", displayName: "Mat Yoga Premium TPE 6mm Antideslizante", brand: "FitPro", model: "TPE-6MM", categoryName: "Deportes", subcategoryName: "Fitness", status: "draft", imageMainUrl: null, officialPrice: 79.90, preferredSupplier: "Global Brands SAC", lastPriceUpdate: "2026-04-25", weightKg: 0.9, lengthCm: 183, widthCm: 61, heightCm: 0.6 },
  { id: 7, netsuiteCode: "NS-EL-03-0067", legacyCode: null, sku: "PC-SSD-1TB", ean: "7750678901234", name: "SSD Samsung 870 EVO 1TB", displayName: "Samsung 870 EVO SSD SATA 1TB", brand: "Samsung", model: "870 EVO 1TB", categoryName: "Electrónica", subcategoryName: "Computación", status: "active", imageMainUrl: null, officialPrice: 289.00, preferredSupplier: "Tech Solutions Peru SA", lastPriceUpdate: "2026-04-18", weightKg: 0.06, lengthCm: 10, widthCm: 7, heightCm: 0.7 },
  { id: 8, netsuiteCode: "NS-AL-02-0087", legacyCode: null, sku: "BEB-SJU-1L", ean: "7750789012345", name: "Jugo de Naranja Selva 1L", displayName: "Selva Jugo Natural de Naranja 1L", brand: "Selva", model: "Naranja 1L", categoryName: "Alimentación", subcategoryName: "Bebidas", status: "active", imageMainUrl: null, officialPrice: 7.50, preferredSupplier: "Distribuidora Lima SAC", lastPriceUpdate: "2026-04-05", weightKg: 1.05, lengthCm: 8, widthCm: 8, heightCm: 25 },
  { id: 9, netsuiteCode: "NS-HG-02-0098", legacyCode: null, sku: "DEC-VEL-SET3", ean: null, name: "Set de 3 Velas Aromáticas", displayName: "Set 3 Velas Aromáticas Lavanda/Vainilla/Canela", brand: "AromaHome", model: "Set-3V", categoryName: "Hogar", subcategoryName: "Decoración", status: "inactive", imageMainUrl: null, officialPrice: 45.00, preferredSupplier: "Importaciones del Sur EIRL", lastPriceUpdate: "2026-03-15", weightKg: 0.6, lengthCm: 20, widthCm: 15, heightCm: 10 },
  { id: 10, netsuiteCode: "NS-CP-02-0092", legacyCode: null, sku: "PERF-CK-100ML", ean: "7750890123456", name: "Calvin Klein CK One 100ml", displayName: "CK One EDT 100ml", brand: "Calvin Klein", model: "CK One 100ml", categoryName: "Cuidado Personal", subcategoryName: "Perfumería", status: "pending_confirmation", imageMainUrl: null, officialPrice: 185.00, preferredSupplier: "Global Brands SAC", lastPriceUpdate: "2026-04-27", weightKg: 0.35, lengthCm: 12, widthCm: 6, heightCm: 6 },
];

export const productPrices: Record<number, ProductPrice[]> = {
  1: [
    { id: 1, supplierName: "Distribuidora Lima SAC", price: 1299.00, priceWithTax: 1532.82, validFrom: "2026-04-01", validTo: null, isCurrent: true, isOfficial: true },
    { id: 2, supplierName: "Tech Solutions Peru SA", price: 1350.00, priceWithTax: 1593.00, validFrom: "2026-03-15", validTo: null, isCurrent: true, isOfficial: false },
    { id: 3, supplierName: "Distribuidora Lima SAC", price: 1399.00, priceWithTax: 1650.82, validFrom: "2026-01-01", validTo: "2026-03-31", isCurrent: false, isOfficial: false },
  ],
};

export const clients: Client[] = [
  { id: 1, name: "Tienda Ripley Web", type: "web_app", description: "Portal de canje Ripley Puntos Go", pointsConversionFactor: 12.85, isActive: true, categoriesCount: 24, hasOutputTemplate: true, contactEmail: "contacto@ripleyweb.pe", contactPhone: "+51 1 300-0000" },
  { id: 2, name: "NetSuite ERP", type: "erp", description: "Sistema ERP principal para importación de productos", pointsConversionFactor: null, isActive: true, categoriesCount: 0, hasOutputTemplate: true, contactEmail: "soporte@netsuite.local", contactPhone: "+51 1 400-1111" },
  { id: 3, name: "BBVA Beneficios", type: "web_app", description: "Catálogo de canje BBVA Continental", pointsConversionFactor: 8.50, isActive: true, categoriesCount: 18, hasOutputTemplate: true, contactEmail: "beneficios@bbva.pe", contactPhone: "+51 1 517-0000" },
  { id: 4, name: "Interbank Vamos", type: "web_app", description: "Programa de beneficios Interbank", pointsConversionFactor: 15.00, isActive: false, categoriesCount: 12, hasOutputTemplate: false, contactEmail: "servicios@interbank.pe", contactPhone: "+51 1 211-0000" },
];

export const clientCategories: ClientCategory[] = [
  { id: 1, clientId: 1, externalId: "CAT-101", name: "Tecnología", parentId: null, masterSubcategoryName: null, masterCategoryName: "Electrónica" },
  { id: 2, clientId: 1, externalId: "CAT-102", name: "Audio", parentId: 1, masterSubcategoryName: "Audio y Video", masterCategoryName: "Electrónica" },
  { id: 3, clientId: 1, externalId: "CAT-103", name: "Móviles y Accesorios", parentId: 1, masterSubcategoryName: "Accesorios Móviles", masterCategoryName: "Electrónica" },
  { id: 4, clientId: 1, externalId: "CAT-201", name: "Hogar y Cocina", parentId: null, masterSubcategoryName: null, masterCategoryName: "Hogar" },
  { id: 5, clientId: 1, externalId: "CAT-202", name: "Electrodomésticos", parentId: 4, masterSubcategoryName: "Cocina", masterCategoryName: "Hogar" },
  { id: 6, clientId: 1, externalId: "CAT-301", name: "Alimentación", parentId: null, masterSubcategoryName: null, masterCategoryName: "Alimentación" },
];

export const exportJobs: ExportJob[] = [
  { id: 1, clientName: "Tienda Ripley Web", fileName: "ripley_catalogo_20260427.xlsx", totalProducts: 156, status: "completed", generatedBy: "Ana García", createdAt: "2026-04-27 10:30", completedAt: "2026-04-27 10:32" },
  { id: 2, clientName: "NetSuite ERP", fileName: "netsuite_import_20260425.csv", totalProducts: 42, status: "completed", generatedBy: "Carlos Mendoza", createdAt: "2026-04-25 14:15", completedAt: "2026-04-25 14:16" },
  { id: 3, clientName: "BBVA Beneficios", fileName: "bbva_catalogo_20260424.xlsx", totalProducts: 89, status: "completed", generatedBy: "Ana García", createdAt: "2026-04-24 09:00", completedAt: "2026-04-24 09:03" },
  { id: 4, clientName: "Tienda Ripley Web", fileName: "ripley_catalogo_20260428.xlsx", totalProducts: 0, status: "processing", generatedBy: "Carlos Mendoza", createdAt: "2026-04-28 08:45", completedAt: null },
];

export const appUsers: AppUser[] = [
  { id: 1, username: "admin", email: "admin@promotick.pe", fullName: "Administrador Sistema", roleName: "Administrador", isActive: true, lastLogin: "2026-04-28 08:00" },
  { id: 2, username: "agarcia", email: "ana.garcia@promotick.pe", fullName: "Ana García López", roleName: "Ejecutivo", isActive: true, lastLogin: "2026-04-28 07:45" },
  { id: 3, username: "cmendoza", email: "carlos.mendoza@promotick.pe", fullName: "Carlos Mendoza Ruiz", roleName: "Ejecutivo", isActive: true, lastLogin: "2026-04-27 16:30" },
  { id: 4, username: "lrios", email: "lucia.rios@promotick.pe", fullName: "Lucía Ríos Vargas", roleName: "Visualizador", isActive: true, lastLogin: "2026-04-26 10:15" },
  { id: 5, username: "jlopez", email: "jorge.lopez@promotick.pe", fullName: "Jorge López Díaz", roleName: "Ejecutivo", isActive: false, lastLogin: "2026-03-10 14:00" },
];

export const roles: Role[] = [
  { id: 1, name: "Administrador", description: "Acceso total al sistema", isSystem: true, permissions: ["supplier.create", "supplier.edit", "supplier.delete", "upload.create", "upload.confirm", "product.create", "product.edit", "category.manage", "client.manage", "export.generate", "user.manage", "role.manage"] },
  { id: 2, name: "Ejecutivo", description: "Gestión de productos y cargas", isSystem: false, permissions: ["supplier.create", "supplier.edit", "upload.create", "upload.confirm", "product.create", "product.edit", "export.generate"] },
  { id: 3, name: "Visualizador", description: "Solo lectura del catálogo", isSystem: false, permissions: ["product.view", "export.view"] },
];

export const allPermissions = [
  { code: "supplier.create", name: "Crear proveedor", module: "Proveedores" },
  { code: "supplier.edit", name: "Editar proveedor", module: "Proveedores" },
  { code: "supplier.delete", name: "Eliminar proveedor", module: "Proveedores" },
  { code: "upload.create", name: "Cargar archivo", module: "Cargas" },
  { code: "upload.confirm", name: "Confirmar lote", module: "Cargas" },
  { code: "product.view", name: "Ver productos", module: "Productos" },
  { code: "product.create", name: "Crear producto", module: "Productos" },
  { code: "product.edit", name: "Editar producto", module: "Productos" },
  { code: "category.manage", name: "Gestionar categorías", module: "Categorías" },
  { code: "client.manage", name: "Gestionar clientes", module: "Clientes" },
  { code: "export.generate", name: "Generar exportación", module: "Exportaciones" },
  { code: "export.view", name: "Ver exportaciones", module: "Exportaciones" },
  { code: "user.manage", name: "Gestionar usuarios", module: "Administración" },
  { code: "role.manage", name: "Gestionar roles", module: "Administración" },
];

export const sampleUploadRows: UploadRow[] = [
  { rowNumber: 1, sku: "PARLANTE-BT-100", name: "Parlante Bluetooth JBL Flip 6", brand: "JBL", price: "S/ 349.90", category: "Electrónica", status: "new" },
  { rowNumber: 2, sku: "AUD-BT-500X", name: "Audifono Bluetooth Sony WH1000XM5", brand: "Sony", price: "S/ 1,350.00", category: "Electrónica", status: "duplicate", duplicateOf: "NS-EL-01-0234", similarityScore: 0.95 },
  { rowNumber: 3, sku: "MOUSE-LOG-G502", name: "Mouse Gaming Logitech G502 Hero", brand: "Logitech", price: "S/ 189.00", category: "Electrónica", status: "new" },
  { rowNumber: 4, sku: "KB-MEC-K70", name: "Teclado Mecánico Corsair K70 RGB", brand: "Corsair", price: "259.90", category: "Electrónica", status: "new" },
  { rowNumber: 5, sku: "CHG-USB-C30W", name: "Cargador USB C 30W Anker Nano", brand: "Anker", price: "S/ 95.00", category: "Electrónica", status: "duplicate", duplicateOf: "NS-EL-02-0189", similarityScore: 0.88 },
  { rowNumber: 6, sku: "CAM-WEB-C920", name: "Webcam Logitech C920 HD Pro", brand: "Logitech", price: "S/ 249.00", category: "Electrónica", status: "new" },
  { rowNumber: 7, sku: "HUB-USB-7P", name: "Hub USB 3.0 7 Puertos", brand: "Ugreen", price: "75.50", category: "", status: "error" },
  { rowNumber: 8, sku: "TAB-SAM-A9", name: "Tablet Samsung Galaxy Tab A9", brand: "Samsung", price: "S/ 699.00", category: "Electrónica", status: "new" },
];

export const sampleColumnMappings: ColumnMapping[] = [
  { sourceColumn: "CODIGO", targetField: "sku", confidence: 0.95, aiSuggested: true },
  { sourceColumn: "PRODUCTO", targetField: "name", confidence: 0.98, aiSuggested: true },
  { sourceColumn: "MARCA", targetField: "brand", confidence: 0.99, aiSuggested: true },
  { sourceColumn: "PRECIO UNIT.", targetField: "price", confidence: 0.92, aiSuggested: true },
  { sourceColumn: "DESCRIPCION", targetField: "long_description", confidence: 0.90, aiSuggested: true },
  { sourceColumn: "CATEGORIA", targetField: "category_name", confidence: 0.85, aiSuggested: true },
  { sourceColumn: "PESO (KG)", targetField: "weight_kg", confidence: 0.97, aiSuggested: true },
  { sourceColumn: "COD BARRAS", targetField: "ean", confidence: 0.93, aiSuggested: true },
];

export const targetFields = [
  { value: "sku", label: "SKU" },
  { value: "ean", label: "EAN / Código de Barras" },
  { value: "mpn", label: "MPN (Código Fabricante)" },
  { value: "name", label: "Nombre Interno" },
  { value: "display_name", label: "Nombre Comercial" },
  { value: "brand", label: "Marca" },
  { value: "model", label: "Modelo" },
  { value: "long_description", label: "Descripción Larga" },
  { value: "purchase_description", label: "Descripción de Compra" },
  { value: "sale_description", label: "Descripción de Venta" },
  { value: "price", label: "Precio" },
  { value: "price_with_tax", label: "Precio con IGV" },
  { value: "category_name", label: "Categoría" },
  { value: "subcategory_name", label: "Subcategoría" },
  { value: "weight_kg", label: "Peso (kg)" },
  { value: "length_cm", label: "Largo (cm)" },
  { value: "width_cm", label: "Ancho (cm)" },
  { value: "height_cm", label: "Alto (cm)" },
  { value: "image_main_url", label: "Imagen Principal (URL)" },
  { value: "specifications", label: "Especificaciones (JSON)" },
  { value: "---", label: "— No mapear —" },
];

export const dashboardStats = {
  totalProducts: 19842,
  activeProducts: 17205,
  pendingReview: 38,
  drafts: 156,
  duplicatesDetected: 12,
  uploadsThisMonth: 14,
  totalSuppliers: 5,
  totalClients: 4,
  recentActivity: [
    { action: "Carga confirmada", detail: "Global Brands SAC — 45 productos", user: "Ana García", time: "Hace 1 hora" },
    { action: "Exportación generada", detail: "Tienda Ripley Web — 156 productos", user: "Ana García", time: "Hace 2 horas" },
    { action: "Proveedor actualizado", detail: "Tech Solutions Peru SA — email", user: "Carlos Mendoza", time: "Hace 5 horas" },
    { action: "Nueva categoría", detail: "Mascotas (MS)", user: "Admin", time: "Ayer 16:30" },
    { action: "Carga confirmada", detail: "Distribuidora Lima SAC — 23 productos", user: "Carlos Mendoza", time: "Ayer 14:15" },
    { action: "Exportación generada", detail: "NetSuite ERP — 42 productos", user: "Carlos Mendoza", time: "Ayer 14:16" },
    { action: "Precio actualizado", detail: "NS-EL-01-0234 — S/ 1,299.00", user: "Ana García", time: "Hace 3 días" },
    { action: "Duplicado resuelto", detail: "SKU AUD-BT-500X — fusionado", user: "Ana García", time: "Hace 3 días" },
  ],
  productsByCategory: [
    { name: "Electrónica", count: 5840 },
    { name: "Hogar", count: 4210 },
    { name: "Alimentación", count: 3950 },
    { name: "Cuidado Personal", count: 3120 },
    { name: "Deportes", count: 2722 },
  ],
  uploadsBySupplier: [
    { name: "Global Brands SAC", count: 31 },
    { name: "Distribuidora Lima SAC", count: 23 },
    { name: "Importaciones del Sur", count: 15 },
    { name: "Tech Solutions Peru", count: 8 },
    { name: "Proveedora Nacional", count: 5 },
  ],
};
