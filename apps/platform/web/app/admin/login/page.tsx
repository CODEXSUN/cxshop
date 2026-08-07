import { LoginForm } from "@cxshop/ui";
export const metadata = { title: "Administrator login", robots: { index: false } };
export default function Login() { return <LoginForm portal="admin" title="Staff Admin Login" description="Use your admin email and password for this desk." destination="/admin" />; }
