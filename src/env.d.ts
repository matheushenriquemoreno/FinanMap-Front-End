declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
    URL_API: string | undefined;
    LOGIN_URL: string | undefined;
    MCP_ENABLED: string | undefined;
    MCP_WRITE_TOOLS_ENABLED: string | undefined;
  }
}
