import Link from "next/link";
import AuthForm from "../../components/AuthForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const authMessage = params?.error === "confirmation"
    ? "That confirmation link is invalid or expired. Request a new sign-up email, then follow its link."
    : "";
  return <main className="auth-page"><section className="auth-card">
    <Link className="wordmark auth-wordmark" href="/" aria-label="JashaMart home"><img src="/images/jashamart-logo.png" alt="JashaMart"/></Link>
    <span className="eyebrow">WELCOME BACK</span>
    <h1>Sign in to JashaMart</h1>
    <p>Access your account and orders.</p>
    <AuthForm mode="login" next={params?.next} initialMessage={authMessage}/>
    <p className="auth-switch">New to JashaMart? <Link href="/signup">Create an account</Link></p>
  </section></main>;
}
