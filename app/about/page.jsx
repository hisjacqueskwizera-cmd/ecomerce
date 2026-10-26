import Link from "next/link";
import { Breadcrumbs, PageTitle, StoreLayout } from "../../components/StoreChrome";

export const metadata = {
  title: "About Us",
  description: "Learn about JashaMart, a marketplace for independent stores across Rwanda."
};

export default function AboutPage() {
  return <main>
    <StoreLayout>
      <Breadcrumbs items={[{ label: "About Us" }]}/>
      <PageTitle eyebrow="ABOUT JASHAMART" title="Local stores. Fresh finds." description="JashaMart brings independent Rwanda-based stores and shoppers together in one easy-to-use marketplace."/>
      <section className="grocery-about-copy">
        <h2>Made for the way we shop here</h2>
        <p>Discover useful products, meet the stores behind them, and shop with Rwanda-wide delivery information in one place.</p>
        <p>From everyday essentials to thoughtful finds, JashaMart helps shoppers connect with local businesses and makes it easier for independent sellers to reach more customers.</p>
        <Link className="button-primary" href="/shop">Explore the marketplace</Link>
      </section>
    </StoreLayout>
  </main>;
}
