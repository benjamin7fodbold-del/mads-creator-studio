import {workspaceIdentity} from './workspace.mjs';
export const defaultAppearance={workspace:'Mads’ workspace',accent:'#df303e',compact:false,labels:{today:'Min dag',week:'Min uge',ai:'Dagens anbefaling',timer:'Fokustimer',calendar:'Kalender',videos:'Alle videoer'}};
const reply=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export function cleanAppearance(value){if(!value||typeof value.workspace!=='string'||!value.workspace.trim()||value.workspace.length>60||!/^#[0-9a-f]{6}$/i.test(value.accent)||typeof value.compact!=='boolean'||!value.labels)return null;const labels={};for(const key of Object.keys(defaultAppearance.labels)){const text=value.labels[key];if(typeof text!=='string'||!text.trim()||text.length>35)return null;labels[key]=text.trim()}return {workspace:value.workspace.trim(),accent:value.accent,compact:value.compact,labels}}
export async function appearance(request,env){const user=workspaceIdentity(request,env);if(!user)return reply({error:'Ingen adgang.'},403);if(!env.DB)return reply({error:'Lagring er ikke tilgængelig.'},503);
if(request.method==='GET'){const row=await env.DB.prepare("SELECT value FROM studio_meta WHERE id='appearance'").first();return reply(row?JSON.parse(row.value):{version:0,settings:defaultAppearance})}
if(request.method!=='POST')return reply({error:'Metoden understøttes ikke.'},405);
if(!['admin','mads'].includes(user.role))return reply({error:'Kun Mads og ejeren kan redigere appens udseende.'},403);
if(request.headers.get('Origin')!==new URL(request.url).origin)return reply({error:'Ugyldig oprindelse.'},403);
if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply({error:'Forventede JSON.'},415);
let body;try{const raw=await request.text();if(raw.length>5000)return reply({error:'For mange data.'},413);body=JSON.parse(raw)}catch{return reply({error:'Ugyldige data.'},400)}
const settings=cleanAppearance(body.settings);if(!settings||!Number.isInteger(body.baseVersion)||body.baseVersion<0)return reply({error:'Kontrollér felterne.'},400);
const next=JSON.stringify({version:body.baseVersion+1,settings});let result;
if(body.baseVersion===0)result=await env.DB.prepare("INSERT INTO studio_meta(id,value) VALUES ('appearance',?) ON CONFLICT(id) DO NOTHING").bind(next).run();
else result=await env.DB.prepare("UPDATE studio_meta SET value=? WHERE id='appearance' AND json_extract(value,'$.version')=?").bind(next,body.baseVersion).run();
if(!result.meta.changes)return reply({error:'Udseendet er ændret af en anden. Din kladde er bevaret. Hent seneste version før du udgiver.'},409);
return reply(JSON.parse(next));}
