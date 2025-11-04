/// <reference types="react" />
/// <reference types="react-dom" />

// Minimal Vite env typing to satisfy tsc without relying on 'vite/client'
interface ImportMetaEnv {
  // Access any VITE_ variable as string or undefined
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

