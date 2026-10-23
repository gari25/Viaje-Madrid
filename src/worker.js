const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const allowed=new Set(["kateryn2030@gmail.com","mariangelperez.asesor74@gmail.com"]);
function b64url(s){return Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0))}
async function identity(req,env){
 const token=req.headers.get("Cf-Access-Jwt-Assertion");
 if(!token||!env.ACCESS_TEAM_DOMAIN||!env.ACCESS_AUD)return null;
 const parts=token.split(".");if(parts.length!==3)return null;
 let header,payload;try{header=JSON.parse(new TextDecoder().decode(b64url(parts[0])));payload=JSON.parse(new TextDecoder().decode(b64url(parts[1])))}catch{return null}
 const domain=env.ACCESS_TEAM_DOMAIN.replace(/^https?:\/\//,"").replace(/\/$/,"");
 if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/i.test(domain))return null;
 if(header.alg!=="RS256"||!header.kid||payload.iss!=="https://"+domain||!(Array.isArray(payload.aud)?payload.aud.includes(env.ACCESS_AUD):payload.aud===env.ACCESS_AUD)||!payload.exp||payload.exp<=Date.now()/1000||(payload.nbf&&payload.nbf>Date.now()/1000))return null;
 const keys=await fetch("https://"+domain+"/cdn-cgi/access/certs").then(r=>r.ok?r.json():null).catch(()=>null);
 const jwk=keys?.keys?.find(k=>k.kid===header.kid&&k.kty==="RSA");if(!jwk)return null;
 const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
 const valid=await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,b64url(parts[2]),new TextEncoder().encode(parts[0]+"."+parts[1]));
 const email=String(payload.email||"").toLowerCase();return valid&&allowed.has(email)?email:null;
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(!url.pathname.startsWith("/api/"))return env.ASSETS.fetch(request);
 if(!env.DB)return json({error:"D1 no configurado"},503);
 let email;try{email=await identity(request,env)}catch{return json({error:"No se pudo verificar identidad"},401)}
 if(!email)return json({error:"No autorizado"},401);
 if(url.pathname!=="/api/shared/costs")return json({error:"No encontrado"},404);
 if(request.method==="GET"){
   const row=await env.DB.prepare("SELECT json_value,revision,updated_by,updated_at FROM shared_state WHERE state_key=?").bind("costs").first();
   return json(row?{data:JSON.parse(row.json_value),revision:row.revision,updatedBy:row.updated_by,updatedAt:row.updated_at}:{data:{},revision:0});
 }
 if(request.method!=="PUT")return json({error:"Método no permitido"},405);
 let body;try{body=await request.json()}catch{return json({error:"JSON inválido"},400)}
 if(!body||!Number.isInteger(body.revision)||body.revision<0||!body.data||typeof body.data!=="object"||Array.isArray(body.data))return json({error:"Datos inválidos"},400);
 const value=JSON.stringify(body.data);if(value.length>200000)return json({error:"Datos demasiado grandes"},413);
 const rev=body.revision;
 const statement=rev===0?
  env.DB.prepare("INSERT OR IGNORE INTO shared_state(state_key,json_value,revision,updated_by) VALUES('costs',?,1,?)").bind(value,email):
  env.DB.prepare("UPDATE shared_state SET json_value=?,revision=revision+1,updated_by=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE state_key='costs' AND revision=?").bind(value,email,rev);
 const result=await statement.run();
 if(result.meta.changes!==1)return json({error:"conflict",message:"Otra persona guardó cambios. Recarga antes de guardar."},409);
 await env.DB.prepare("INSERT INTO change_log(state_key,revision,actor) VALUES('costs',?,?)").bind(rev+1,email).run();
 return json({ok:true,revision:rev+1});
}};
