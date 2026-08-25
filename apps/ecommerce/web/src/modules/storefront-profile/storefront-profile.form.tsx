import { Button } from "@cxshop/ui/components/button";
import { Input } from "@cxshop/ui/components/input";
import { Label } from "@cxshop/ui/components/label";
import { Textarea } from "@cxshop/ui/components/textarea";
import type { StorefrontProfile } from "./storefront-profile.types";

export function StorefrontProfileForm({
  value,
  onChange,
  mode = "profile"
}: {
  value: StorefrontProfile;
  onChange: (value: StorefrontProfile) => void;
  mode?: "profile" | "service-banner" | "trusted-strip";
}) {
  const field = (key: Exclude<keyof StorefrontProfile, "paymentMethods">) => ({
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [key]: event.target.value }),
    value: value[key]
  });
  if (mode === "trusted-strip") {
    return (
      <div className="grid gap-5">
        <Field label="Eyebrow">
          <Input maxLength={120} {...field("trustedEyebrow")} />
        </Field>
        <Field label="Heading">
          <Input maxLength={240} {...field("trustedTitle")} />
        </Field>
        <Field label="Description">
          <Textarea className="min-h-24" maxLength={500} {...field("trustedDescription")} />
        </Field>
        <Field label="Proof points (one per line)">
          <Textarea className="min-h-28" maxLength={1000} {...field("trustedProofPoints")} />
        </Field>
      </div>
    );
  }
  if (mode === "service-banner") {
    return (
      <div className="grid gap-5">
        <Field label="Eyebrow">
          <Input maxLength={120} {...field("serviceEyebrow")} />
        </Field>
        <Field label="Heading">
          <Input maxLength={240} {...field("serviceTitle")} />
        </Field>
        <Field label="Description">
          <Textarea className="min-h-24" maxLength={500} {...field("serviceDescription")} />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Action label">
            <Input maxLength={120} {...field("serviceActionLabel")} />
          </Field>
          <Field label="Action URL">
            <Input maxLength={500} placeholder="/support" {...field("serviceActionUrl")} />
          </Field>
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-5">
      <Field label="Tagline">
        <Input
          maxLength={240}
          placeholder="A short promise shown with your company identity"
          {...field("tagline")}
        />
      </Field>
      <Field label="About us">
        <Textarea
          className="min-h-28"
          maxLength={2000}
          placeholder="Tell customers what your company does and why it matters."
          {...field("aboutUs")}
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Copyright text">
          <Input maxLength={240} placeholder="All rights reserved." {...field("copyrightText")} />
        </Field>
        <Field label="Powered by text">
          <Input
            maxLength={240}
            placeholder="Optional platform or partner credit"
            {...field("poweredByText")}
          />
        </Field>
      </div>
      <PaymentMethodsEditor value={value} onChange={onChange} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Facebook">
          <Input inputMode="url" placeholder="https://facebook.com/..." {...field("facebookUrl")} />
        </Field>
        <Field label="LinkedIn">
          <Input
            inputMode="url"
            placeholder="https://linkedin.com/company/..."
            {...field("linkedinUrl")}
          />
        </Field>
        <Field label="Instagram">
          <Input
            inputMode="url"
            placeholder="https://instagram.com/..."
            {...field("instagramUrl")}
          />
        </Field>
        <Field label="X">
          <Input inputMode="url" placeholder="https://x.com/..." {...field("xUrl")} />
        </Field>
        <Field label="YouTube">
          <Input inputMode="url" placeholder="https://youtube.com/@..." {...field("youtubeUrl")} />
        </Field>
        <Field label="WhatsApp">
          <Input inputMode="url" placeholder="https://wa.me/919..." {...field("whatsappUrl")} />
        </Field>
        <Field label="Threads">
          <Input inputMode="url" placeholder="https://threads.net/@..." {...field("threadsUrl")} />
        </Field>
      </div>
    </div>
  );
}

function PaymentMethodsEditor({
  value,
  onChange
}: {
  value: StorefrontProfile;
  onChange: (value: StorefrontProfile) => void;
}) {
  const update = (index: number, key: "logoUrl" | "name", fieldValue: string) => {
    const paymentMethods = value.paymentMethods.map((method, methodIndex) =>
      methodIndex === index ? { ...method, [key]: fieldValue } : method
    );
    onChange({ ...value, paymentMethods });
  };
  return (
    <section className="grid gap-3" aria-labelledby="storefront-payment-methods-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid gap-1">
          <Label id="storefront-payment-methods-heading">Supported payment types</Label>
          <p className="text-sm text-muted-foreground">
            Add the name and logo shown in the storefront footer. Row order is preserved.
          </p>
        </div>
        <Button
          disabled={value.paymentMethods.length >= 12}
          onClick={() =>
            onChange({
              ...value,
              paymentMethods: [...value.paymentMethods, { logoUrl: "", name: "" }]
            })
          }
          size="sm"
          type="button"
          variant="outline"
        >
          Add payment type
        </Button>
      </div>
      <div className="grid gap-3">
        {value.paymentMethods.map((method, index) => (
          <div
            className="grid items-end gap-3 rounded-md border p-3 md:grid-cols-[72px_minmax(160px,0.7fr)_minmax(240px,1.3fr)_auto]"
            key={index}
          >
            <div className="flex h-11 w-[72px] items-center justify-center overflow-hidden rounded-md border bg-white p-2">
              {method.logoUrl ? (
                <img
                  alt={`${method.name || "Payment method"} logo preview`}
                  className="max-h-full max-w-full object-contain"
                  src={method.logoUrl}
                />
              ) : (
                <span className="text-xs text-slate-500">Logo</span>
              )}
            </div>
            <Field label="Name">
              <Input
                maxLength={80}
                onChange={(event) => update(index, "name", event.target.value)}
                placeholder="VISA"
                value={method.name}
              />
            </Field>
            <Field label="Logo URL">
              <Input
                inputMode="url"
                maxLength={500}
                onChange={(event) => update(index, "logoUrl", event.target.value)}
                placeholder="https://example.com/visa.svg"
                value={method.logoUrl}
              />
            </Field>
            <Button
              aria-label={`Remove ${method.name || "payment type"}`}
              onClick={() =>
                onChange({
                  ...value,
                  paymentMethods: value.paymentMethods.filter(
                    (_, methodIndex) => methodIndex !== index
                  )
                })
              }
              type="button"
              variant="outline"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
