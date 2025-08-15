// app/current-affairs/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";

type Article = {
  title:   string;
  link:    string;
  pubDate: string;
  source:  string;
};

export default function CurrentAffairsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError]       = useState<string | null>(null);
  const [page, setPage]         = useState(1);

  const perPage = 15;

  useEffect(() => {
    async function fetchRSS() {
      try {
        const rssUrl   = "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en";
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
          rssUrl
        )}`;

        const res     = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Network error: ${res.status}`);
        const xmlText = await res.text();

        const parser = new DOMParser();
        const doc    = parser.parseFromString(xmlText, "application/xml");
        const items  = Array.from(doc.querySelectorAll("item"));

        const parsed: Article[] = items.map(item => ({
          title:   item.querySelector("title")?.textContent?.trim() || "No title",
          link:    item.querySelector("link")?.textContent?.trim()  || "#",
          pubDate: item.querySelector("pubDate")?.textContent?.trim() || "",
          source:  item.querySelector("source")?.textContent?.trim()  || "Google News",
        }));

        setArticles(parsed);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load current affairs");
      }
    }

    fetchRSS();
  }, []);

  const totalPages = useMemo(
    () => Math.ceil(articles.length / perPage),
    [articles]
  );

  const paginated = useMemo(
    () =>
      articles.slice(
        (page - 1) * perPage,
        (page - 1) * perPage + perPage
      ),
    [articles, page]
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Today’s India Current Affairs
      </h1>

      {error && (
        <div className="p-4 mb-4 rounded bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {!error && articles.length === 0 && (
        <p className="text-center text-gray-600">Loading latest headlines…</p>
      )}

      <ul className="space-y-6">
        {paginated.map((a, i) => (
          <li key={i} className="border-b pb-4">
            <a
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-semibold text-blue-600 hover:underline"
            >
              {a.title}
            </a>
            <div className="flex items-center mt-1 text-sm text-gray-500 space-x-2">
              <span>{new Date(a.pubDate).toLocaleString()}</span>
              <span>•</span>
              <span>{a.source}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination controls */}
      {articles.length > perPage && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`
              px-3 py-1 rounded
              ${page === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"}
            `}
          >
            Previous
          </button>

          {/* page numbers */}
          <div className="space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`
                  px-2 py-1 rounded
                  ${num === page
                    ? "bg-blue-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
                `}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`
              px-3 py-1 rounded
              ${page === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"}
            `}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
