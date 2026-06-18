import React from 'react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-full bg-[var(--color-bg)] dark:bg-gray-900 border-r border-[var(--color-border)] dark:border-gray-700 p-4">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">AstraRead</h2>
      <nav className="flex flex-col space-y-2">
        <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100">Dashboard</Link>
        <Link href="/reading" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">Reading</Link>
        <Link href="/grammar" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">Grammar</Link>
        <Link href="/rc" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">CAT RC</Link>
        <Link href="/speaking" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">Speaking</Link>
        <Link href="/progress" className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">Progress</Link>
      </nav>
    </aside>
  );
}
