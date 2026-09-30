declare module "npm:@supabase/supabase-js@2" {
  export function createClient(url: string, key: string): any;
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

declare const crypto: Crypto;
