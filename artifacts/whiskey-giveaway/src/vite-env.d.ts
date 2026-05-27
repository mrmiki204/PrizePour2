/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly VITE_PAYMENTS_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
