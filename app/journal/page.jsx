import Link from "next/link";
import { PageTitle, StoreLayout } from "../../components/StoreChrome";

export const metadata = { title: "The Open Shop journal" };

const articles = [
  { slug: "getting-to-know-the-makers", date: "THE OPEN SHOP EDIT", title: "Getting to know the makers behind your finds", text: "The best part of a marketplace is often the person and the story behind a product.", icon: "✦" },
  { slug: "small-things-for-slow-mornings", date: "LITTLE MOMENTS", title: "Small things for slower mornings", text: "A few well-made everyday pieces can make the start of the day feel a little more considered.", icon: "☕" },
  { slug: "choosing-a-gift-with-a-story", date: "GIFT NOTES", title: "Choosing a gift with a story", text: "Find something useful, personal, and made with care at an independent shop.", icon: "🎁" }
];

export default function JournalPage() {
  return <main><StoreLayout><PageTitle eyebrow="STORIES, IDEAS & STORE SPOTLIGHTS" title="The Open Shop journal" description="Notes from our community of independent sellers and everyday finders."/><div className="journal-grid">{articles.map(article => <article className="journal-card" key={article.slug}><div className="journal-art">{article.icon}</div><div className="journal-info"><small>{article.date}</small><h2>{article.title}</h2><p>{article.text}</p><Link href={`/journal/${article.slug}`}>Read the story →</Link></div></article>)}</div></StoreLayout></main>;
}
