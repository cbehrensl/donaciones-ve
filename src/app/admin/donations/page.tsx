import { getAllDonationLinks } from "./actions";
import { AdminDonationsClient } from "./AdminDonationsClient";

export const revalidate = 0; // Don't cache admin page

export default async function AdminDonationsPage() {
  const links = await getAllDonationLinks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Links de Donaciones</h1>
          <p className="text-gray-600 mt-2">
            Administra los links de donaciones que se muestran en la página principal.
          </p>
        </div>
      </div>

      <AdminDonationsClient initialLinks={links} />
    </div>
  );
}
