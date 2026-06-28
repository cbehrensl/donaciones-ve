"use client";

import { useState } from "react";
import { DonationLink } from "@/lib/types";
import { toggleDonationLinkStatus, saveDonationLink, deleteDonationLink } from "./actions";

export function AdminDonationsClient({ initialLinks }: { initialLinks: DonationLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLink, setCurrentLink] = useState<Partial<DonationLink>>({});
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setLinks(links.map(l => l.id === id ? { ...l, is_active: !currentStatus } : l));
      await toggleDonationLinkStatus(id, currentStatus);
    } catch (e) {
      alert("Error actualizando estado");
      // Revert on error (could be improved)
      setLinks(initialLinks);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este link?")) return;
    try {
      setLoading(true);
      await deleteDonationLink(id);
      setLinks(links.filter(l => l.id !== id));
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
    try {
      await saveDonationLink(formData);
      window.location.reload(); // Simple refresh to get latest data
    } catch (err) {
      alert("Error guardando");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button 
          onClick={() => {
            setCurrentLink({ is_active: true });
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
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
                  <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline truncate max-w-xs block">
                    {link.url}
                  </a>
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
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
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
                <input type="url" name="url" required defaultValue={currentLink.url || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="https://..." />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo / URL de Imagen (Opcional)</label>
                <input type="url" name="image_url" defaultValue={currentLink.image_url || ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" placeholder="Dejar en blanco para autocompletar" />
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
