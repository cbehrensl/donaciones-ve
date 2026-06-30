"use client";

import { useState } from "react";
import type { DonationLink, DonationLinkCategory } from "@/lib/types";

const LINK_CATEGORIES: {
  value: DonationLinkCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "money",
    label: "Donación de dinero",
    description: "Organizaciones donde aportar ayuda económica.",
  },
  {
    value: "psychological",
    label: "Ayuda psicológica",
    description: "Plataformas que ofrecen apoyo emocional o psicológico.",
  },
];

const CATEGORY_LABELS: Record<DonationLinkCategory, string> = {
  money: "Dinero",
  psychological: "Ayuda psicológica",
};

const COUNTRIES: { code: string; name: string }[] = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "CV", name: "Cabo Verde" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo (DRC)" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "Korea (North)" },
  { code: "KR", name: "Korea (South)" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "MK", name: "North Macedonia" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TV", name: "Tuvalu" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];
import {
  deleteDonationLink,
  getAllDonationLinks,
  type DonationAdminData,
  saveDonationLink,
  toggleDonationLinkStatus,
} from "./actions";

interface AdminDonationsClientProps {
  initialLinks: DonationLink[];
  token: string;
  initialAdminData: DonationAdminData;
}

export function AdminDonationsClient({
  initialLinks,
  token,
  initialAdminData,
}: AdminDonationsClientProps) {
  const [links, setLinks] = useState(initialLinks);
  const [adminData, setAdminData] = useState(initialAdminData);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLink, setCurrentLink] = useState<Partial<DonationLink>>({});
  const [loading, setLoading] = useState(false);

  async function refreshLinks() {
    const updated = await getAllDonationLinks(token);
    setLinks(updated);
    setAdminData({
      total: updated.length,
      active: updated.filter((link) => link.is_active).length,
      money: updated.filter((link) => link.category === "money").length,
      psychological: updated.filter((link) => link.category === "psychological").length,
    });
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setLinks(links.map(l => l.id === id ? { ...l, is_active: !currentStatus } : l));
      await toggleDonationLinkStatus(id, currentStatus, token);
      await refreshLinks();
    } catch (e) {
      alert("Error actualizando estado");
      // Revert on error (could be improved)
      await refreshLinks();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este link?")) return;
    try {
      setLoading(true);
      await deleteDonationLink(id, token);
      await refreshLinks();
    } catch (e) {
      alert("Error eliminando");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    try {
      await saveDonationLink(formData);
      await refreshLinks();
      setIsEditing(false);
      setCurrentLink({});
      setLoading(false);
    } catch (err) {
      alert("Error guardando");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">Total</p>
          <p className="text-2xl font-black text-zinc-900">{adminData.total}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Activos</p>
          <p className="text-2xl font-black text-emerald-900">{adminData.active}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">Dinero</p>
          <p className="text-2xl font-black text-amber-900">{adminData.money}</p>
        </div>
        <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-purple-700">Psicológica</p>
          <p className="text-2xl font-black text-purple-900">{adminData.psychological}</p>
        </div>
      </div>

      <div className="mb-6">
        <button 
          onClick={() => {
            setCurrentLink({ is_active: true, category: "money" });
            setIsEditing(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          + Agregar Nuevo Link
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{link.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      link.category === "psychological"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {CATEGORY_LABELS[link.category]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono font-bold text-gray-700">{link.country ?? "—"}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {link.url ? (
                    <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-blue-700 truncate max-w-xs block transition hover:text-blue-900">
                      {link.url}
                    </a>
                  ) : link.whatsapp_phone ? (
                    <a
                      href={`https://wa.me/${link.whatsapp_phone.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
                    >
                      WhatsApp {link.whatsapp_phone}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">Sin contacto</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => handleToggleStatus(link.id, link.is_active)}
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${link.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {link.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button onClick={() => { setCurrentLink(link); setIsEditing(true); }} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                  <button onClick={() => handleDelete(link.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No hay links registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{currentLink.id ? 'Editar Link' : 'Nuevo Link'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {currentLink.id && <input type="hidden" name="id" value={currentLink.id} />}
              <input type="hidden" name="token" value={token} />

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  name="category"
                  required
                  defaultValue={currentLink.category ?? "money"}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                >
                  {LINK_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {
                    LINK_CATEGORIES.find(
                      (category) => category.value === (currentLink.category ?? "money"),
                    )?.description
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input type="text" name="title" required defaultValue={currentLink.title || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea name="description" required rows={3} defaultValue={currentLink.description || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <input type="url" name="url" defaultValue={currentLink.url || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="https://..." />
                <p className="mt-1 text-xs text-gray-500">
                  Opcional si agregas un número de WhatsApp.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
                <input
                  type="tel"
                  name="whatsapp_phone"
                  defaultValue={currentLink.whatsapp_phone || ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  placeholder="+584121234567"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Agrega URL o WhatsApp. Si no hay URL, la tarjeta pública abrirá WhatsApp.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo / URL de Imagen (Opcional)</label>
                <input type="url" name="image_url" defaultValue={currentLink.image_url || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="Dejar en blanco para autocompletar" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">País <span className="text-red-500">*</span></label>
                <select
                  name="country"
                  required
                  defaultValue={currentLink.country ?? ""}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                >
                  <option value="" disabled>Selecciona un país</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" name="is_active" id="is_active" defaultChecked={currentLink.is_active ?? true} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">Activo</label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
