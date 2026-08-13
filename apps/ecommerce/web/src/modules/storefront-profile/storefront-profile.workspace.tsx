import { useEffect, useState } from "react";
import { Button } from "@cxshop/ui/components/button";
import { Card } from "@cxshop/ui/components/card";
import { WorkspacePage } from "@cxshop/ui/workspace/page";
import { toast } from "sonner";
import { StorefrontProfileForm } from "./storefront-profile.form";
import { useStorefrontProfile } from "./storefront-profile.hooks";
import { storefrontProfileSchema } from "./storefront-profile.schema";
import type { StorefrontProfile } from "./storefront-profile.types";

const empty: StorefrontProfile = {
  aboutUs: "",
  copyrightText: "",
  instagramUrl: "",
  linkedinUrl: "",
  poweredByText: "",
  tagline: "",
  xUrl: ""
};

export function StorefrontProfileWorkspace() {
  const { profile, save } = useStorefrontProfile();
  const [value, setValue] = useState(empty);
  const [darkPreview, setDarkPreview] = useState(true);
  useEffect(() => {
    if (profile.data) setValue(profile.data);
  }, [profile.data]);
  function submit() {
    const parsed = storefrontProfileSchema.safeParse(value);
    if (!parsed.success)
      return toast.error(parsed.error.issues[0]?.message ?? "Check the storefront profile.");
    save.mutate(parsed.data, {
      onError: (error) => toast.error(error.message),
      onSuccess: () => toast.success("Storefront profile saved.")
    });
  }
  return (
    <WorkspacePage
      title="Storefront Profile"
      description="Set the white-label message and footer details shown with the Application Company brand."
    >
      <div className="grid gap-5">
        <Card title="Profile and footer">
          <StorefrontProfileForm onChange={setValue} value={value} />
        </Card>
        <Card title="Footer preview">
          <FooterPreview dark={darkPreview} profile={value} />
        </Card>
        <div className="flex justify-end">
          <Button disabled={profile.isLoading || save.isPending} onClick={submit}>
            {save.isPending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </div>
      <div
        className="fixed bottom-5 right-5 z-30 flex items-center gap-1 rounded-md border bg-background p-1 shadow-sm"
        aria-label="Preview tone"
      >
        <Button
          onClick={() => setDarkPreview(false)}
          size="sm"
          variant={darkPreview ? "ghost" : "default"}
        >
          Light
        </Button>
        <Button
          onClick={() => setDarkPreview(true)}
          size="sm"
          variant={darkPreview ? "default" : "ghost"}
        >
          Dark
        </Button>
      </div>
    </WorkspacePage>
  );
}

function FooterPreview({ dark, profile }: { dark: boolean; profile: StorefrontProfile }) {
  return (
    <div
      className={`grid gap-3 rounded-md p-6 ${dark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-950"}`}
    >
      <strong>Application Company</strong>
      <span>{profile.tagline || "Your company tagline"}</span>
      <p className="max-w-2xl text-sm opacity-80">
        {profile.aboutUs || "Your About Us text will appear here."}
      </p>
      <div className="flex justify-between gap-4 border-t border-current/20 pt-3 text-sm">
        <span>{profile.copyrightText || "Copyright instructions"}</span>
        <span>{profile.poweredByText}</span>
      </div>
    </div>
  );
}
