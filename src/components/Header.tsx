import Link from "next/link";
import { Archive, Database, Newspaper, Radar, Star } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "今日", icon: Newspaper },
  { href: "/favorites", label: "收藏", icon: Star },
  { href: "/history", label: "历史", icon: Archive },
  { href: "/admin/sources", label: "信息源", icon: Database },
];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3.5" aria-label="Vibe Coding Daily 首页">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white shadow-sm">
            <Radar size={23} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-xl font-bold leading-tight text-slate-950 sm:text-2xl">
              Vibe Coding Daily
            </span>
            <span className="mt-1 block text-xs font-medium text-slate-500">AI 编程信息聚合</span>
          </span>
        </Link>

        <nav className="flex w-full items-center justify-between gap-1 sm:w-auto sm:justify-end" aria-label="主导航">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              className="inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-md px-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 sm:px-3"
            >
              <Icon size={17} aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
