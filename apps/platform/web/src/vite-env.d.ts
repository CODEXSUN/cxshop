/// <reference types="vite/client" />

interface Window {
  __CXSHOP_RUNTIME_CONFIG__: Readonly<Record<string, string>>;
}

declare const __APP_VERSION__: string;
