"use client";

import { useEffect, useState } from "react";
import { defaultStorefrontConfig, mergeStorefrontConfig, STOREFRONT_CONFIG_KEY } from "../../../lib/storefront-config";
import { readStored } from "../../../lib/admin-data";
import { updateStorefrontConfig } from "../../../components/useStorefrontConfig";

const sectionNames = {
  departments: "Departments and categories",
  popular: "Popular products",
  promotions: "Promotion cards",
  newArrivals: "New arrivals",
  stores: "Featured stores",
  bestSellers: "Best sellers",
  benefits: "Shopping benefits",
  newsletter: "Newsletter signup",
};

export default function AdminStorefrontPage() {
  const [config, setConfig] = useState(defaultStorefrontConfig);
  const [saved, setSaved] = useState(false);
  useEffect(() => setConfig(mergeStorefrontConfig(readStored(STOREFRONT_CONFIG_KEY, defaultStorefrontConfig))), []);
  function setValue(group, key, value) {
    setConfig(current => ({ ...current, [group]: { ...current[group], [key]: value } }));
    setSaved(false);
  }
  function updateSection(id, key, value) {
    setConfig(current => ({ ...current, home: { ...current.home, sections: { ...current.home.sections, [id]: { ...current.home.sections[id], [key]: value } } } }));
    setSaved(false);
  }
  function save(event) {
    event.preventDefault();
    try { setConfig(updateStorefrontConfig(config)); setSaved(true); }
    catch { setSaved(false); window.alert("Storefront content could not be saved in this browser. Try shortening the content."); }
  }
  function updateNav(index, key, value) {
    const nav = config.chrome.nav.map((item, i) => i === index ? { ...item, [key]: value } : item);
    setValue("chrome", "nav", nav);
  }
  function updateFaq(index, key, value) {
    const questions = config.faq.questions.map((item, i) => i === index ? item.map((part, j) => j === key ? value : part) : item);
    setValue("faq", "questions", questions);
  }
  return <>
    <div className="admin-page-heading"><div><h1>Storefront content</h1><p>Manage shared navigation, homepage sections, customer information, and FAQs.</p></div><button className="admin-primary" onClick={save}>Save storefront</button></div>
    {saved && <div className="storefront-save-note">✓ Storefront content saved and published to this browser.</div>}
    <form className="storefront-manager" onSubmit={save}>
      <section className="admin-card"><div className="admin-card-title"><div><h2>Store header and footer</h2><p>Set shared brand text and choose which navigation links appear.</p></div></div><div className="admin-form-grid storefront-fields">
        <label className="admin-field">Header tagline<input value={config.chrome.tagline} onChange={e => setValue("chrome", "tagline", e.target.value)}/></label>
        <label className="admin-field wide">Footer description<input value={config.chrome.footerDescription} onChange={e => setValue("chrome", "footerDescription", e.target.value)}/></label>
        <label className="admin-field">Newsletter heading<input value={config.chrome.newsletterTitle} onChange={e => setValue("chrome", "newsletterTitle", e.target.value)}/></label>
        <label className="admin-field">Newsletter description<input value={config.chrome.newsletterText} onChange={e => setValue("chrome", "newsletterText", e.target.value)}/></label>
        <div className="storefront-toggles wide">{[["showHeader", "Show storefront header"], ["showNavigation", "Show department and quick navigation"], ["showFooter", "Show storefront footer"]].map(([key, label]) => <label key={key}><input type="checkbox" checked={config.chrome[key]} onChange={e => setValue("chrome", key, e.target.checked)}/>{label}</label>)}</div>
      </div><div className="storefront-nav-editor">{config.chrome.nav.map((item, index) => <div className="storefront-nav-row" key={`${item.href}-${index}`}><label className="admin-field">Navigation label<input value={item.label} onChange={e => updateNav(index, "label", e.target.value)}/></label><label className="admin-field">Link destination<input value={item.href} onChange={e => updateNav(index, "href", e.target.value)}/></label><label className="storefront-inline-check"><input type="checkbox" checked={item.active} onChange={e => updateNav(index, "active", e.target.checked)}/>Visible</label></div>)}</div></section>

      <section className="admin-card"><div className="admin-card-title"><div><h2>Homepage</h2><p>Edit the main message and control the visibility and headings of homepage components.</p></div></div><div className="admin-form-grid storefront-fields">
        <label className="admin-field wide">Hero heading<input value={config.home.heroTitle} onChange={e => setValue("home", "heroTitle", e.target.value)} placeholder="Use a new line for the second line"/></label>
        <label className="admin-field wide">Hero description<textarea value={config.home.heroText} onChange={e => setValue("home", "heroText", e.target.value)}/></label>
      </div><div className="storefront-section-list">{Object.entries(sectionNames).map(([id, name]) => {
        const section = config.home.sections[id];
        const hasCopy = id !== "benefits";
        return <article className="storefront-section-row" key={id}><label className="storefront-inline-check"><input type="checkbox" checked={section.active} onChange={e => updateSection(id, "active", e.target.checked)}/><b>{name}</b></label>{hasCopy && <div className="admin-form-grid"><label className="admin-field">Eyebrow<input value={section.eyebrow || ""} onChange={e => updateSection(id, "eyebrow", e.target.value)}/></label><label className="admin-field">Heading<input value={section.title || ""} onChange={e => updateSection(id, "title", e.target.value)}/></label>{id === "promotions" && <label className="admin-field wide">Description<input value={section.text || ""} onChange={e => updateSection(id, "text", e.target.value)}/></label>}</div>}</article>;
      })}</div></section>

      <section className="admin-card"><div className="admin-card-title"><div><h2>Contact page</h2><p>Update the customer support heading and contact details.</p></div></div><div className="admin-form-grid storefront-fields">
        {[["eyebrow", "Eyebrow"], ["title", "Page title"], ["description", "Introduction"], ["heading", "Support heading"], ["email", "Support email"], ["phone", "Support phone"]].map(([key, label]) => <label className="admin-field" key={key}>{label}<input value={config.contact[key]} onChange={e => setValue("contact", key, e.target.value)}/></label>)}
      </div></section>

      <section className="admin-card"><div className="admin-card-title"><div><h2>Shipping and returns page</h2><p>Manage the customer-facing policy headings and descriptions.</p></div></div><div className="admin-form-grid storefront-fields">
        {[["eyebrow", "Eyebrow"], ["title", "Page title"], ["description", "Introduction"], ["deliveryTitle", "Delivery heading"], ["deliveryText", "Delivery details"], ["estimateTitle", "Shipping estimate heading"], ["estimateText", "Shipping estimate details"], ["returnsTitle", "Returns heading"], ["returnsText", "Returns details"]].map(([key, label]) => <label className={`admin-field ${key.endsWith("Text") || key === "description" ? "wide" : ""}`} key={key}>{label}{key.endsWith("Text") || key === "description" ? <textarea value={config.shipping[key]} onChange={e => setValue("shipping", key, e.target.value)}/> : <input value={config.shipping[key]} onChange={e => setValue("shipping", key, e.target.value)}/>}</label>)}
      </div></section>

      <section className="admin-card"><div className="admin-card-title"><div><h2>Help center FAQs</h2><p>Edit the questions and answers shown to storefront customers.</p></div><button type="button" className="admin-secondary" onClick={() => setValue("faq", "questions", [...config.faq.questions, ["New question", "Add an answer."]])}>＋ Add question</button></div><div className="admin-form-grid storefront-fields"><label className="admin-field">Eyebrow<input value={config.faq.eyebrow} onChange={e => setValue("faq", "eyebrow", e.target.value)}/></label><label className="admin-field">Page title<input value={config.faq.title} onChange={e => setValue("faq", "title", e.target.value)}/></label><label className="admin-field wide">Introduction<input value={config.faq.description} onChange={e => setValue("faq", "description", e.target.value)}/></label></div><div className="storefront-faq-editor">{config.faq.questions.map(([question, answer], index) => <div className="storefront-faq-row" key={`${index}-${question}`}><label className="admin-field">Question<input value={question} onChange={e => updateFaq(index, 0, e.target.value)}/></label><label className="admin-field">Answer<textarea value={answer} onChange={e => updateFaq(index, 1, e.target.value)}/></label><button type="button" className="admin-danger" onClick={() => setValue("faq", "questions", config.faq.questions.filter((_, i) => i !== index))}>Remove</button></div>)}</div></section>

      <div className="storefront-bottom-save"><button className="admin-primary">{saved ? "Saved" : "Save storefront changes"}</button></div>
    </form>
  </>;
}
