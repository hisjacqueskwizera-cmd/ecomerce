import Link from "next/link";

export default function NotFound() {
  return <main className="page-surface"><div className="shell"><div className="empty-state"><span>⌕</span><h1>Page not found</h1><p>The page may have moved, or the link might be out of date.</p><Link className="button-primary" href="/">Back to JashaMart</Link></div></div></main>;
}
