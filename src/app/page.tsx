"use client";

import { useState } from "react";
import UrlInput from "@/components/url-input";
import BookInfoCard from "@/components/book-info-card";
import PageRangeSelector from "@/components/page-range-selector";
import DownloadButton from "@/components/download-button";

interface BookInfo {
  title: string;
  totalPages: number;
  pageUrls: string[];
  platform: string;
  id1: string;
  id2: string;
}

export default function Home() {
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  function handleBookInfo(info: BookInfo) {
    setBookInfo(info);
    setFromPage(1);
    setToPage(info.totalPages);
    setError(null);
  }

  function handleError(msg: string) {
    setError(msg);
    setBookInfo(null);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            FlipBook Downloader
          </h1>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
            Download AnyFlip or FlipHTML5 books as PDF with custom page ranges
          </p>
        </header>

        <div className="flex flex-col gap-6">
          <UrlInput onBookInfo={handleBookInfo} onError={handleError} />

          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {bookInfo && (
            <>
              <BookInfoCard
                title={bookInfo.title}
                totalPages={bookInfo.totalPages}
                platform={bookInfo.platform}
              />

              <PageRangeSelector
                totalPages={bookInfo.totalPages}
                fromPage={fromPage}
                toPage={toPage}
                onFromChange={setFromPage}
                onToChange={setToPage}
              />

              <DownloadButton
                title={bookInfo.title}
                pageUrls={bookInfo.pageUrls}
                fromPage={fromPage}
                toPage={toPage}
              />

              <button
                onClick={() => {
                  setBookInfo(null);
                  setError(null);
                }}
                className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                Download a different book
              </button>
            </>
          )}
        </div>

        <footer className="mt-16 text-center text-xs text-zinc-400 dark:text-zinc-600">
          <p>Only download books you have permission to download.</p>
        </footer>
      </div>
    </div>
  );
}
