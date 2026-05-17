"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Company = {
  id: number;
  name: string;
  logo?: string;
  industry?: string;
  location?: string;
  size?: string;
  description?: string;
  website?: string;
  linkedin?: string;
};

export default function CompanyPage() {
  const params = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/companies/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setCompany(data.company);
        setLoading(false);
      })
      .catch(() => {
        setError("Yüklənmə xətası");
        setLoading(false);
      });
  }, [params?.id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">Yüklənir...</div>
  );

  if (error || !company) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-red-500">{error || "Şirkət tapılmadı"}</p>
      <Link href="/companies" className="text-blue-500 hover:underline">← Geri qayıt</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/companies" className="text-blue-500 hover:underline text-sm mb-6 inline-block">
          ← Bütün şirkətlər
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-4xl">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-full h-full object-contain rounded-xl" />
              ) : "🏢"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-gray-500">{company.industry || "Technology"}</p>
            </div>
          </div>

          {company.description && (
            <p className="text-gray-600 mb-6">{company.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            {company.location && <div>📍 <strong>Yer:</strong> {company.location}</div>}
            {company.size && <div>👥 <strong>Ölçü:</strong> {company.size} işçi</div>}
            {company.website && (
              <div>🌐 <strong>Sayt:</strong>{" "}
                <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                  {company.website}
                </a>
              </div>
            )}
            {company.linkedin && (
              <div>💼 <strong>LinkedIn:</strong>{" "}
                <a href={company.linkedin} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                  Profilə bax
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}