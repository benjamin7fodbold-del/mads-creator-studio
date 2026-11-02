import { appearance } from '../server/appearance.mjs';
import appearanceJS from '../client/appearance.js?raw';
import videoBrief from "../client/video-brief.js?raw";
import serviceWorker from "../client/sw.js?raw";
import appIcons from "../server/app-icons.json";
import { workspace, workspaceIdentity } from "../server/workspace.mjs";
import focusClock from "../client/focus-clock.js?raw";
import html from "../client/index.html?raw";
import css from "../client/style.css?raw";
import js from "../client/app.js?raw";
import { planner } from "../server/planner.mjs";
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

const worker = {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const path = new URL(request.url).pathname;
    if (path === '/manifest.webmanifest') return Response.json({id:'/',name:'Creator Studio',short_name:'Creator Studio',lang:'da',start_url:'/',scope:'/',display:'standalone',background_color:'#141216',theme_color:'#141216',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any maskable'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]},{headers:{'Content-Type':'application/manifest+json','Cache-Control':'no-cache'}});
    if (path === '/sw.js') return new Response(serviceWorker,{headers:{'Content-Type':'text/javascript','Cache-Control':'no-cache','Service-Worker-Allowed':'/'}});
    if (path in appIcons) {const data=atob(appIcons[path as keyof typeof appIcons]);return new Response(Uint8Array.from(data,c=>c.charCodeAt(0)),{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=86400'}})}
    if (path === '/api/appearance') return appearance(request, env);
    if (path === '/appearance.js') return new Response(appearanceJS,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-cache'}});
    if (path === '/api/workspace') return workspace(request, env);
    if (path.startsWith('/api/plan')) {
      const identity=workspaceIdentity(request,env);
      if (!identity || identity.role==='patrick') return Response.json({error:'AI-planlægning er kun til Mads.'},{status:403,headers:{'Cache-Control':'no-store'}});
      return planner(request, env);
    }
    const assets: Record<string, [string, string]> = {'/':[html,'text/html; charset=utf-8'], '/style.css':[css,'text/css; charset=utf-8'], '/app.js':[js,'text/javascript; charset=utf-8'], '/focus-clock.js':[focusClock,'text/javascript; charset=utf-8'], '/video-brief.js':[videoBrief,'text/javascript; charset=utf-8']};
    if (assets[path] && ['GET','HEAD'].includes(request.method)) return new Response(request.method === 'HEAD' ? null : assets[path][0], {headers:{'Content-Type': assets[path][1], 'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
};

export default worker;
