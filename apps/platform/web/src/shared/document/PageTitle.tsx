import { useEffect } from "react";
let companyName = "";
let currentPageTitle = "Dashboard";

export function setPlatformDocumentTitle(pageTitle: string) {
  currentPageTitle = pageTitle;
  document.title = companyName ? `${companyName} | ${pageTitle}` : pageTitle;
}

const pageTitles: Record<string, string> = {
  "/": "Storefront",
  "/admin": "Back Office",
  "/admin/login": "Back Office Login",
  "/sa": "Super Admin Desk",
  "/sa/login": "Super Admin Login",
  "/status": "Status",
  "/workspace": "Dashboard"
};

function resolvePageTitle(pathname: string) {
  if (pathname.startsWith("/sa/") && pathname !== "/sa/login") {
    return pathname === "/sa/task-manager" ? "Task Manager" : "Super Admin Desk";
  }
  if (pathname.startsWith("/admin/")) {
    return "Back Office";
  }
  return pageTitles[pathname] ?? "Dashboard";
}

export function PageTitle() {
  useEffect(() => {
    void loadCompanyName().then((value) => {
      companyName = value;
      setPlatformDocumentTitle(currentPageTitle);
    });
    const updateTitle = () => {
      if (
        window.location.pathname.startsWith("/admin/") &&
        window.location.pathname !== "/admin/login"
      ) {
        return;
      }
      setPlatformDocumentTitle(resolvePageTitle(window.location.pathname));
    };

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function pushState(...args) {
      originalPushState.apply(this, args);
      updateTitle();
    };

    window.history.replaceState = function replaceState(...args) {
      originalReplaceState.apply(this, args);
      updateTitle();
    };

    window.addEventListener("popstate", updateTitle);
    updateTitle();

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", updateTitle);
    };
  }, []);

  return null;
}

async function loadCompanyName() {
  try {
    const response = await fetch("/api/platform/public/company-branding", {
      credentials: "same-origin",
      headers: { Accept: "application/json" }
    });
    const body = (await response.json()) as { data?: { brandName?: string } };
    return response.ok ? (body.data?.brandName?.trim() ?? "") : "";
  } catch {
    return "";
  }
}
