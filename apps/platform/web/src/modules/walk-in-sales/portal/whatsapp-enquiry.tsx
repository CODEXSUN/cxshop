"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";

export function WhatsAppEnquiry({ productId, productName, variants }: { productId: string; productName: string; variants: { id: string; name: string }[] }) {
  const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const body = { requestId: crypto.randomUUID(), productId, variantId: values.variantId || undefined, customerName: values.customerName, customerPhone: values.customerPhone, quantity: Number(values.quantity), note: values.note, consent: values.consent === "on" };
    try {
      const response = await fetch("/api/v1/store/enquiries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json() as { whatsappUrl?: string; item?: { reference?: string } };
      if (!response.ok || !data.whatsappUrl) return setMessage("The enquiry could not be saved. Check the details and try again.");
      setMessage(`Enquiry ${data.item?.reference ?? "saved"}. Opening WhatsApp…`);
      window.location.assign(data.whatsappUrl);
    } catch { setMessage("The store API is unavailable. Please try again."); } finally { setLoading(false); }
  }
  return <section className="enquiry-card"><div><MessageCircle size={22}/><span><strong>Enquire on WhatsApp</strong><small>No online checkout. The store confirms every order manually.</small></span></div><form onSubmit={submit}><div className="enquiry-fields"><label>Name<input name="customerName" autoComplete="name" required minLength={2}/></label><label>WhatsApp number<input name="customerPhone" inputMode="tel" placeholder="919876543210" required pattern="\+?[0-9]{8,15}"/></label><label>Configuration<select name="variantId" defaultValue={variants[0]?.id ?? ""}>{variants.map(variant => <option key={variant.id} value={variant.id}>{variant.name}</option>)}</select></label><label>Quantity<input name="quantity" type="number" min="1" max="20" defaultValue="1" required/></label></div><label>What do you need?<textarea name="note" maxLength={1000} placeholder={`Ask about ${productName}, compatibility, availability, or installation.`}/></label><label className="enquiry-consent"><input name="consent" type="checkbox" required/>I agree that CXShop can store these details and contact me about this enquiry.</label><button disabled={loading} type="submit"><MessageCircle size={18}/>{loading ? "Saving enquiry…" : "Save and open WhatsApp"}</button>{message && <p role="status">{message}</p>}</form></section>;
}
