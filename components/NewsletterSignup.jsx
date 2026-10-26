"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [subscribed, setSubscribed] = useState(false);
  return <form className="newsletter-band-form" onSubmit={event => { event.preventDefault(); setSubscribed(true); }}><input type="email" required placeholder="Enter email"/><button>{subscribed ? "Subscribed ✓" : "Subscribe Now"}</button><small>{subscribed ? "Thanks for joining JashaMart." : "By signing up, you agree to our privacy policy."}</small></form>;
}
