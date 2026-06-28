"use client";

import { DonationLink } from "@/lib/types";
import Image from "next/image";

export function DonationCard({ link }: { link: DonationLink }) {
  // Extract domain for favicon fallback
  let domain = "";
  try {
    const parsedUrl = new URL(link.url);
    domain = parsedUrl.hostname;
  } catch (e) {
    // Ignore invalid urls
  }

  const imageUrl = link.image_url || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-center items-center h-32 bg-gray-50 border-b border-gray-100 p-4">
        {imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={imageUrl} 
            alt={`Logo de ${link.title}`} 
            className="max-h-full max-w-full object-contain drop-shadow-sm"
          />
        ) : (
          <div className="text-gray-400 text-4xl">🫶</div>
        )}
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{link.title}</h3>
        <p className="text-sm text-gray-600 flex-grow line-clamp-3 mb-4">
          {link.description}
        </p>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200 mt-auto"
        >
          Ir a Donar
        </a>
      </div>
    </div>
  );
}
