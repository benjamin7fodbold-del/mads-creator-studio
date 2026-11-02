declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}

interface ImportMetaEnv { readonly DEV: boolean }
