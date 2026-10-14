import Link from "next/link";
import { notFound } from "next/navigation";
import { PageTitle, StoreLayout } from "../../../components/StoreChrome";

const stories = {
  "getting-to-know-the-makers": { label: "THE OPEN SHOP EDIT", title: "Getting to know the makers behind your finds", intro: "A marketplace is more than a collection of products. It's a chance to discover the people, workshops, and thoughtful decisions behind what you bring home.", body: "We built Open Shop to make independent stores easier to explore. Each seller has their own point of view, from the materials they choose to the small details that make a product useful. When you shop with them, you support a real business and help good work find its next home." },
  "small-things-for-slow-mornings": { label: "LITTLE MOMENTS", title: "Small things for slower mornings", intro: "A softer start doesn't need a complete routine. Sometimes it's just a few useful things you love using.", body: "A comfortable layer, a favorite mug, and a little space to ease into the day can make a difference. Browse home goods and clothing from the independent stores on Open Shop and find pieces that feel right for your own mornings." },
  "choosing-a-gift-with-a-story": { label: "GIFT NOTES", title: "Choosing a gift with a story", intro: "The most memorable gifts are often useful, personal, and chosen with care.", body: "Look for something that fits the person you have in mind, then take a moment to learn about the shop behind it. A handmade piece or an everyday essential from a small store can carry a little more meaning than something picked at random." }
};

export function generateStaticParams() { return Object.keys(stories).map(slug => ({ slug })); }

export default async function JournalStoryPage({ params }) {
  const { slug } = await params;
  const story = stories[slug];
  if (!story) notFound();
  return <main><StoreLayout><div className="content-narrow journal-story"><Link className="breadcrumbs" href="/journal">← The Open Shop journal</Link><span className="eyebrow">{story.label}</span><h1>{story.title}</h1><p className="story-intro">{story.intro}</p><div className="story-art">✦</div><p>{story.body}</p><p>Discover thoughtful finds and the independent stores behind them in the <Link href="/shop">Open Shop marketplace</Link>.</p><Link className="button-primary" href="/journal">More stories</Link></div></StoreLayout></main>;
}
