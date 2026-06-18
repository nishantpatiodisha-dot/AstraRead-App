const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/app/reading/components/ReadingLibraryClient.tsx',
  'src/app/reading/components/ArticleCard.tsx',
  'src/app/grammar/components/GrammarPracticeClient.tsx',
  'src/app/grammar/page.tsx',
  'src/app/dashboard/components/Sidebar.tsx',
  'src/app/admin/import/page.tsx',
  'src/app/admin/import-rc/page.tsx'
];

const replacements = [
  { regex: /\bbg-white\b/g, replacement: 'bg-[var(--color-bg)]' },
  { regex: /\bborder-stone-200\b/g, replacement: 'border-[var(--color-border)]' },
  { regex: /\bborder-gray-200\b/g, replacement: 'border-[var(--color-border)]' },
  { regex: /\btext-stone-950\b/g, replacement: 'text-[var(--color-text)]' },
  { regex: /\btext-stone-900\b/g, replacement: 'text-[var(--color-text)]' },
  { regex: /\btext-stone-800\b/g, replacement: 'text-[var(--color-text)]' },
  { regex: /\btext-stone-700\b/g, replacement: 'text-[var(--color-text-subtle)]' },
  { regex: /\btext-stone-600\b/g, replacement: 'text-[var(--color-text-subtle)]' },
  { regex: /\btext-stone-500\b/g, replacement: 'text-[var(--color-text-subtle)]' },
  { regex: /\bbg-stone-50\b/g, replacement: 'bg-[var(--color-bg-subtle)]' },
  { regex: /\bbg-stone-100\b/g, replacement: 'bg-[var(--color-bg-subtle)]' },
  { regex: /\bbg-\[#f4f6f0\]\b/g, replacement: 'bg-[var(--color-bg)]' },
  { regex: /\bbg-\[#fbfcf8\]\b/g, replacement: 'bg-[var(--color-bg)]' },
];

for (const relPath of filesToUpdate) {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${relPath}, does not exist.`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  for (const r of replacements) {
    content = content.replace(r.regex, r.replacement);
  }
  fs.writeFileSync(fullPath, content);
  console.log(`Updated ${relPath}`);
}
