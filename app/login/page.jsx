import Link from "next/link";
import AuthForm from "../../components/AuthForm";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  return <main className="auth-page"><section className="auth-card">
    <Link className="wordmark" href="/">Open Shop</Link>
    <span className="eyebrow">WELCOME BACK</span>
    <h1>Sign in to Open Shop</h1>
    <p>Access your account and orders.</p>
    <AuthForm mode="login" next={params?.next}/>
    <p className="auth-switch">New to Open Shop? <Link href="/signup">Create an account</Link></p>
  </section></main>;
}
