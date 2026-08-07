import { LoginForm } from "@cxshop/ui";
export const metadata = { title: "Super administrator login", robots: { index: false } };
export default function Login() { return <LoginForm portal="sa" title="Super Admin Login" description="Use your super admin email and password for this desk." destination="/sa" />; }
