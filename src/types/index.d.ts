// This file can be used for global type declarations.
interface ImportMetaEnv {
  readonly VITE_VAPID_PUBLIC_KEY: string;
  // Add other environment variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}