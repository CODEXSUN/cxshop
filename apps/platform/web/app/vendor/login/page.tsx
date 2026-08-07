import { LoginForm } from "@cxshop/ui";
export const metadata = { title: "Vendor login", robots: { index: false } };
export default function Login() { return <LoginForm portal="vendor" title="Vendor Login" description="Use your approved vendor email and password for this desk." destination="/vendor" />; }
