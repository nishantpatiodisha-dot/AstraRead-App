"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit2, AlertCircle, CheckCircle2 } from "lucide-react";

type ArticleListRow = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  paragraphCount: number;
  analysisComplete: boolean;
};

export default function AdminArticlesDashboard() {
  const [articles, setArticles] = useState<ArticleListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/admin/articles");
      if (!res.ok) throw new Error("Failed to load articles");
      const data = await res.json();
      setArticles(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/articles/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete article");
      setArticles(articles.filter((a) => a.slug !== slug));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Deep Reading Articles</h1>
          <p className="text-[var(--color-text-subtle)]">Manage your imported deep reading content.</p>
        </div>
        <Link
          href="/admin/import"
          className="bg-emerald-600 hover:bg-emerald-700 shadow-lg text-white font-medium py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2 text-sm"
        >
          <Plus size={16} /> Import New
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">{error}</div>}

      <div className="bg-[var(--color-bg)] rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-subtle)] border-b text-[var(--color-text-subtle)] font-semibold uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Paragraphs</th>
              <th className="px-6 py-4">Analysis</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-subtle)]">
                  Loading articles...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="text-stone-400 mb-2 flex justify-center">
                    <BookOpenText size={32} />
                  </div>
                  <p className="text-[var(--color-text-subtle)] font-medium">No articles imported yet</p>
                  <Link href="/admin/import" className="text-emerald-600 font-medium hover:underline mt-2 inline-block">
                    Import your first article
                  </Link>
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-[var(--color-bg-hover)] transition-colors">
                  <td className="px-6 py-4 font-medium text-[var(--color-text)]">
                    {article.title}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-subtle)]">{article.paragraphCount}</td>
                  <td className="px-6 py-4">
                    {article.analysisComplete ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 size={14} /> Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                        <AlertCircle size={14} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[var(--color-text-subtle)]">
                    {new Date(article.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      {/* Note: Edit links to a future edit route, but currently it's just import. 
                          For full editing we'd need to load the data into the import form. */}
                      <button
                        onClick={() => handleDelete(article.slug, article.title)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50"
                        title="Delete article"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Quick component so I don't need to import lucide icons individually
import { BookOpenText } from "lucide-react";
