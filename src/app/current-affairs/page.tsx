"use client";

import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X, Menu, Newspaper, Calendar, Globe } from "lucide-react";

type Article = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
};

export default function CurrentAffairsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const perPage = 15;

  useEffect(() => {
    async function fetchRSS() {
      const rssSources = [
        {
          name: "The Hindu",
          url: "https://www.thehindu.com/news/national/feeder/default.rss",
          proxy: "allorigins"
        },
        {
          name: "Google News India",
          url: "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
          proxy: "allorigins"
        },
        {
          name: "Google News India Top Stories",
          url: "https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRFZ4ZERBU0JXVnVMVWRDS0FBUAE?hl=en-IN&gl=IN&ceid=IN:en",
          proxy: "allorigins"
        },
        
        {
          name: "Times of India",
          url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
          proxy: "allorigins"
        },
        {
          name: "NDTV News",
          url: "https://feeds.feedburner.com/ndtvnews-india-news",
          proxy: "allorigins"
        },
        {
          name: "Indian Express",
          url: "https://indianexpress.com/feed/",
          proxy: "allorigins"
        },
        {
          name: "Google News World",
          url: "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
          proxy: "corsproxy"
        }
      ];

      const getProxyUrl = (url: string, proxyType: string) => {
        if (proxyType === "allorigins") {
          return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        } else if (proxyType === "corsproxy") {
          return `https://corsproxy.io/?${encodeURIComponent(url)}`;
        }
        return url;
      };

      for (let i = 0; i < rssSources.length; i++) {
        const source = rssSources[i];
        try {
          console.log(`Attempting to fetch from: ${source.name}`);
          const proxyUrl = getProxyUrl(source.url, source.proxy);
          
          const res = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/rss+xml, application/xml, text/xml'
            }
          });
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          
          const xmlText = await res.text();
          
          if (!xmlText || xmlText.length < 100) {
            throw new Error("Invalid response");
          }

          const parser = new DOMParser();
          const doc = parser.parseFromString(xmlText, "application/xml");
          
          const parserError = doc.querySelector("parsererror");
          if (parserError) {
            throw new Error("XML parsing error");
          }

          const items = Array.from(doc.querySelectorAll("item"));
          
          if (items.length === 0) {
            throw new Error("No articles found");
          }

          const parsed: Article[] = items.map((item) => ({
            title: item.querySelector("title")?.textContent?.trim() || "No title",
            link: item.querySelector("link")?.textContent?.trim() || "#",
            pubDate: item.querySelector("pubDate")?.textContent?.trim() || new Date().toISOString(),
            source: source.name,
            description: item.querySelector("description")?.textContent?.trim() || ""
          }));

          console.log(`Successfully fetched ${parsed.length} articles from ${source.name}`);
          setArticles(parsed);
          if (parsed.length > 0) {
            setSelectedArticle(parsed[0]);
          }
          setError(null);
          return;
          
        } catch (err: any) {
          console.error(`Failed to fetch from ${source.name}:`, err.message);
          
          if (i === rssSources.length - 1) {
            setError(`Failed to load news from all sources. Please try again later.`);
          }
        }
      }
    }

    fetchRSS();
  }, []);

  const totalPages = useMemo(() => Math.ceil(articles.length / perPage), [articles]);

  const paginated = useMemo(
    () => articles.slice((page - 1) * perPage, (page - 1) * perPage + perPage),
    [articles, page]
  );

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setIsMobileMenuOpen(false);
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm z-20">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
            title="Toggle Menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              India Current Affairs
            </h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Article List */}
        <aside
  className={`
    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
    fixed lg:relative
    top-[73px] lg:top-0
    inset-y-0 left-0
    w-full sm:w-96
    lg:w-96
    bg-white
    border-r border-gray-200
    transition-transform duration-300 ease-in-out
    z-30
    sm:mt-0
    mt-28
    md:mt-0
    flex flex-col
  `}
>

          {error && (
            <div className="m-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!error && articles.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading latest headlines…</p>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-2">
              {paginated.map((article, i) => (
                <button
                  key={i}
                  onClick={() => handleArticleClick(article)}
                  className={`
                    w-full text-left p-4 rounded-lg transition-all duration-200
                    ${
                      selectedArticle?.link === article.link
                        ? "bg-blue-50 border-2 border-blue-500 shadow-md"
                        : "bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md"
                    }
                  `}
                >
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {article.source}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(article.pubDate).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {articles.length > perPage && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`
                    flex items-center px-3 py-2 rounded-lg font-medium transition-all
                    ${
                      page === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    }
                  `}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`
                          w-8 h-8 rounded-lg font-medium transition-all
                          ${
                            pageNum === page
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                          }
                        `}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`
                    flex items-center px-3 py-2 rounded-lg font-medium transition-all
                    ${
                      page === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    }
                  `}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </aside>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Right Panel - Article Reader View */}
        <main className="flex-1 flex flex-col bg-white overflow-auto">
          {selectedArticle ? (
            <div className="flex-1">
              {/* Article Header Card */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200">
                <div className="max-w-4xl mx-auto p-6 md:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Newspaper className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">
                          {selectedArticle.source}
                        </span>
                      </div>
                      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                        {selectedArticle.title}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(selectedArticle.pubDate).toLocaleDateString("en-IN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <span>
                            {new Date(selectedArticle.pubDate).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                    title="Close Reader"
                      onClick={() => setSelectedArticle(null)}
                      className="lg:hidden p-2 hover:bg-white/50 rounded-lg transition-colors ml-4"
                    >
                      <X className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={selectedArticle.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Read Full Article
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedArticle.link)}
                      className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Article Content/Preview */}
              <div className="max-w-4xl mx-auto p-6 md:p-8">
                {selectedArticle.description && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600 inline-block">
                      Article Summary
                    </h2>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {stripHtml(selectedArticle.description)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Information Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Newspaper className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        How to Read This Article
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">
                        Due to website security policies, we can&apos;t display the full article directly. Click the &quot;Read Full Article&quot; button above to open it in a new tab and access the complete content on the original publisher&apos;s website.
                      </p>
                      <p className="text-gray-600 text-xs">
                        Source: {selectedArticle.source}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <a
                    href={selectedArticle.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">
                      Open in New Tab
                    </span>
                  </a>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedArticle.title,
                          url: selectedArticle.link
                        });
                      }
                    }}
                    className="flex items-center justify-center gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <Globe className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                    <span className="font-medium text-gray-700 group-hover:text-blue-600">
                      Share Article
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="text-center max-w-md px-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Newspaper className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  Select an Article
                </h3>
                <p className="text-gray-600 text-lg">
                  Choose any article from the list to view its details and read more
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}