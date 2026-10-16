import Link from "next/link";
import AuthForm from "../../components/AuthForm";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return <main className="auth-page"><section className="auth-card">
    <Link className="wordmark" href="/">Open Shop</Link>
    <span className="eyebrow">JOIN OPEN SHOP</span>
    <h1>Create your account</h1>
    <p>Your role is assigned automatically when your account is created.</p>
    <AuthForm mode="signup"/>
    <p className="auth-switch">Already registered? <Link href="/login">Sign in</Link></p>
  </section></main>;
}
