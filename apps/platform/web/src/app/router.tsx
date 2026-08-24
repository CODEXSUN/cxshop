import { createRootRoute, createRoute, createRouter, useParams } from "@tanstack/react-router";
import { lazy } from "react";
import { TenantSiteTemplate } from "../public/tenant-site/templates/tenant-site.template";

const SaDesk = lazy(() =>
  import("../desks/sa/SaDesk").then((module) => ({ default: module.SaDesk }))
);
const BackOfficeDesk = lazy(() =>
  import("../desks/tenant/AppDesk").then((module) => ({ default: module.AppDesk }))
);
const BillingPrintRoute = lazy(() =>
  import("../desks/tenant/BillingPrintRoute").then((module) => ({
    default: module.BillingPrintRoute
  }))
);
const HealthPage = lazy(() =>
  import("../public/health/HealthPage").then((module) => ({ default: module.HealthPage }))
);
const StorefrontPage = lazy(() =>
  import("@cxshop/ecommerce-web/modules/storefront").then((module) => ({
    default: module.StorefrontPage
  }))
);
const TenantWorkspacePage = lazy(() =>
  import("../public/tenant-site/pages/workspace.page").then((module) => ({
    default: module.TenantWorkspacePage
  }))
);
const TenantFeaturesPage = lazy(() =>
  import("../public/tenant-site/pages/features.page").then((module) => ({
    default: module.TenantFeaturesPage
  }))
);
const TenantSecurityPage = lazy(() =>
  import("../public/tenant-site/pages/security.page").then((module) => ({
    default: module.TenantSecurityPage
  }))
);
const PublicBlogPage = lazy(() =>
  import("@cxshop/blogs-web/modules/public-blog").then((module) => ({
    default: module.PublicBlogPage
  }))
);
const PublicArticlePage = lazy(() =>
  import("@cxshop/blogs-web/modules/public-blog").then((module) => ({
    default: module.PublicArticlePage
  }))
);
const TenantUpdatesPage = lazy(() =>
  import("../public/tenant-site/pages/updates.page").then((module) => ({
    default: module.TenantUpdatesPage
  }))
);
const TenantAboutPage = lazy(() =>
  import("../public/tenant-site/pages/about.page").then((module) => ({
    default: module.TenantAboutPage
  }))
);
const TenantContactPage = lazy(() =>
  import("../public/tenant-site/pages/contact.page").then((module) => ({
    default: module.TenantContactPage
  }))
);
const TenantTeamPage = lazy(() =>
  import("../public/tenant-site/pages/team.page").then((module) => ({
    default: module.TenantTeamPage
  }))
);
const TenantShippingPage = lazy(() =>
  import("../public/tenant-site/pages/shipping.page").then((module) => ({
    default: module.TenantShippingPage
  }))
);
const TenantReturnsPage = lazy(() =>
  import("../public/tenant-site/pages/returns.page").then((module) => ({
    default: module.TenantReturnsPage
  }))
);
const TenantCookiesPage = lazy(() =>
  import("../public/tenant-site/pages/cookies.page").then((module) => ({
    default: module.TenantCookiesPage
  }))
);
const TenantPrivacyPage = lazy(() =>
  import("../public/tenant-site/pages/privacy.page").then((module) => ({
    default: module.TenantPrivacyPage
  }))
);
const TenantTermsPage = lazy(() =>
  import("../public/tenant-site/pages/terms.page").then((module) => ({
    default: module.TenantTermsPage
  }))
);
const LoginPage = lazy(() =>
  import("../public/login/LoginPage").then((module) => ({ default: module.LoginPage }))
);
const SessionRefreshPage = lazy(() =>
  import("../public/session-refresh").then((module) => ({ default: module.SessionRefreshPage }))
);
const ForgotPasswordPage = lazy(() =>
  import("../public/password-recovery").then((module) => ({
    default: module.ForgotPasswordPage
  }))
);
const ResetPasswordPage = lazy(() =>
  import("../public/password-recovery").then((module) => ({
    default: module.ResetPasswordPage
  }))
);
const rootRoute = createRootRoute();

const homeRoute = createRoute({
  component: StorefrontPage,
  getParentRoute: () => rootRoute,
  path: "/"
});

const shopRoute = createRoute({
  component: StorefrontPage,
  getParentRoute: () => rootRoute,
  path: "/shop"
});

const searchRoute = createRoute({
  component: StorefrontPage,
  getParentRoute: () => rootRoute,
  path: "/search"
});

const cartRoute = createRoute({
  component: StorefrontPage,
  getParentRoute: () => rootRoute,
  path: "/cart"
});

const shopCategoryRoute = createRoute({
  component: StorefrontPage,
  getParentRoute: () => rootRoute,
  path: "/shop/category/$category"
});

const shopProductRoute = createRoute({
  component: StorefrontPage,
  getParentRoute: () => rootRoute,
  path: "/shop/product/$slug"
});

const workspaceRoute = createRoute({
  component: TenantWorkspacePage,
  getParentRoute: () => rootRoute,
  path: "/workspace"
});

const featuresRoute = createRoute({
  component: TenantFeaturesPage,
  getParentRoute: () => rootRoute,
  path: "/features"
});

const securityRoute = createRoute({
  component: TenantSecurityPage,
  getParentRoute: () => rootRoute,
  path: "/security"
});

const blogRoute = createRoute({
  component: PublicBlogRoute,
  getParentRoute: () => rootRoute,
  path: "/blog"
});

function PublicBlogRoute() {
  return (
    <TenantSiteTemplate activePage="blog" pageTitle="Blog">
      <PublicBlogPage />
    </TenantSiteTemplate>
  );
}

const blogArticleRoute = createRoute({
  component: BlogArticleRoute,
  getParentRoute: () => rootRoute,
  path: "/blog/$slug"
});

function BlogArticleRoute() {
  const { slug } = useParams({ from: "/blog/$slug" });
  return (
    <TenantSiteTemplate activePage="blog" manageDocumentTitle={false}>
      <PublicArticlePage slug={slug} />
    </TenantSiteTemplate>
  );
}

const updatesRoute = createRoute({
  component: TenantUpdatesPage,
  getParentRoute: () => rootRoute,
  path: "/updates"
});

const aboutRoute = createRoute({
  component: TenantAboutPage,
  getParentRoute: () => rootRoute,
  path: "/about"
});

const contactRoute = createRoute({
  component: TenantContactPage,
  getParentRoute: () => rootRoute,
  path: "/contact"
});
const teamRoute = createRoute({
  component: TenantTeamPage,
  getParentRoute: () => rootRoute,
  path: "/team"
});
const shippingRoute = createRoute({
  component: TenantShippingPage,
  getParentRoute: () => rootRoute,
  path: "/shipping"
});
const returnsRoute = createRoute({
  component: TenantReturnsPage,
  getParentRoute: () => rootRoute,
  path: "/returns"
});
const cookiesRoute = createRoute({
  component: TenantCookiesPage,
  getParentRoute: () => rootRoute,
  path: "/cookies"
});

const privacyRoute = createRoute({
  component: TenantPrivacyPage,
  getParentRoute: () => rootRoute,
  path: "/privacy"
});

const termsRoute = createRoute({
  component: TenantTermsPage,
  getParentRoute: () => rootRoute,
  path: "/terms"
});

const healthRoute = createRoute({
  component: HealthPage,
  getParentRoute: () => rootRoute,
  path: "/status"
});

const saLoginRoute = createRoute({
  component: () => <LoginPage desk="sa" title="Super Admin Login" />,
  getParentRoute: () => rootRoute,
  path: "/sa/login"
});

const saRefreshRoute = createRoute({
  component: SessionRefreshPage,
  getParentRoute: () => rootRoute,
  path: "/sa/refresh"
});

const adminLoginRoute = createRoute({
  component: () => <LoginPage desk="admin" title="Back Office Login" />,
  getParentRoute: () => rootRoute,
  path: "/admin/login"
});

const forgotPasswordRoute = createRoute({
  component: ForgotPasswordPage,
  getParentRoute: () => rootRoute,
  path: "/forgot-password"
});

const resetPasswordRoute = createRoute({
  component: ResetPasswordPage,
  getParentRoute: () => rootRoute,
  path: "/reset-password"
});

const saSplatRoute = createRoute({
  component: SaDesk,
  getParentRoute: () => rootRoute,
  path: "/sa/$"
});

const adminRoute = createRoute({
  component: BackOfficeDesk,
  getParentRoute: () => rootRoute,
  path: "/admin/$"
});

const quotationPrintRoute = createRoute({
  component: () => <BillingPrintRoute document="quotation" />,
  getParentRoute: () => rootRoute,
  path: "/admin/billing/quotation/print"
});

const salesPrintRoute = createRoute({
  component: () => <BillingPrintRoute document="sales" />,
  getParentRoute: () => rootRoute,
  path: "/admin/billing/sales/print"
});

const purchasePrintRoute = createRoute({
  component: () => <BillingPrintRoute document="purchase" />,
  getParentRoute: () => rootRoute,
  path: "/admin/billing/purchase/print"
});

const exportSalesPrintRoute = createRoute({
  component: () => <BillingPrintRoute document="export-sales" />,
  getParentRoute: () => rootRoute,
  path: "/admin/billing/export-sales/print"
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  shopRoute,
  searchRoute,
  cartRoute,
  shopCategoryRoute,
  shopProductRoute,
  workspaceRoute,
  featuresRoute,
  securityRoute,
  blogRoute,
  blogArticleRoute,
  updatesRoute,
  aboutRoute,
  contactRoute,
  teamRoute,
  shippingRoute,
  returnsRoute,
  cookiesRoute,
  privacyRoute,
  termsRoute,
  healthRoute,
  saLoginRoute,
  saRefreshRoute,
  adminLoginRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  saSplatRoute,
  adminRoute,
  quotationPrintRoute,
  salesPrintRoute,
  purchasePrintRoute,
  exportSalesPrintRoute
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
