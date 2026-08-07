import { LoginForm } from "@cxshop/ui";
export const metadata = { title: "Customer login" };
export default function Login() { return <LoginForm portal="store" title="Customer Login" description="Access your shopping account with your registered credentials." destination="/account" />; }
