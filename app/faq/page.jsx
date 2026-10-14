"use client";

import { PageTitle, StoreLayout } from "../../components/StoreChrome";
import { useStorefrontConfig } from "../../components/useStorefrontConfig";

export default function FAQPage() {
  const { faq } = useStorefrontConfig();
  return <main><StoreLayout><PageTitle eyebrow={faq.eyebrow} title={faq.title} description={faq.description}/><div className="content-narrow">{faq.questions.map(([question, answer], index) => <section className="faq-item" key={`${question}-${index}`}><h2>{question}</h2><p>{answer}</p></section>)}</div></StoreLayout></main>;
}
