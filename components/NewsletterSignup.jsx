"use client";

import { useState } from "react";

export default function NewsletterSignup() {
  const [subscribed, setSubscribed] = useState(false);
  return <form className="newsletter-band-form" onSubmit={event => { event.preventDefault(); setSubscribed(true); }}><input type="email" required placeholder="Your email address"/><button>{subscribed ? "You're on the list ✓" : "Sign me up →"}</button><small>{subscribed ? "Thanks for joining the JashaMart edit." : "By signing up, you agree to our privacy policy."}</small></form>;
}
