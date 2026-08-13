import { Input } from "@cxshop/ui/components/input";
import { Label } from "@cxshop/ui/components/label";
import { Textarea } from "@cxshop/ui/components/textarea";
import type { StorefrontProfile } from "./storefront-profile.types";

export function StorefrontProfileForm({
  value,
  onChange
}: {
  value: StorefrontProfile;
  onChange: (value: StorefrontProfile) => void;
}) {
  const field = (key: keyof StorefrontProfile) => ({
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [key]: event.target.value }),
    value: value[key]
  });
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
      <div className="grid gap-5 md:grid-cols-3">
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
      </div>
    </div>
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
