const {json,originOk}=require('./_auth');
const REPO=()=>process.env.GITHUB_REPO||'orivonatech/gmax',BRANCH=()=>process.env.GITHUB_BRANCH||'main',PATH='gmax-website/data/analytics.json';
const ALLOWED=['page_view','whatsapp_click','phone_click','email_click','cta_click','contact_form_submit'];
const recent=new Map();
function clientKey(req){return String(req.headers['x-forwarded-for']||req.headers['x-real-ip']||'unknown').split(',')[0].trim().slice(0,80)}
function throttled(req,event){const k=clientKey(req)+':'+event,now=Date.now(),last=recent.get(k)||0;if(now-last<300)return true;recent.set(k,now);if(recent.size>2000)for(const [key,time] of recent)if(now-time>3600000)recent.delete(key);return false}
async function gh(url,opts={}){const r=await fetch(url,{...opts,headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'GMAX-Analytics','Content-Type':'application/json'}});const d=await r.json();if(!r.ok)throw Error(d.message||'GitHub request failed');return d}
function clean(v,max){return String(v||'').slice(0,max)}
function dayKey(v){const d=new Date(v||Date.now());return isNaN(d)?new Date().toISOString().slice(0,10):d.toISOString().slice(0,10)}
module.exports=async function(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});if(!originOk(req))return json(res,403,{error:'Invalid origin'});if(throttled(req))return json(res,429,{error:'Too many analytics events. Please try again shortly.'});if(!process.env.GITHUB_TOKEN)return json(res,500,{error:'Analytics storage is not configured'});
 try{
  const b=typeof req.body==='string'?JSON.parse(req.body):(req.body||{}),event=clean(b.event,40),page=clean(b.page,200)||'/',source=clean(b.source,300),session=clean(b.sessionId,120);
  if(!ALLOWED.includes(event))return json(res,400,{error:'Unsupported analytics event'});if(throttled(req,event))return json(res,429,{error:'Too many analytics events. Please try again shortly.'});
  const now=new Date().toISOString(),key=dayKey(now);let file=await gh('https://api.github.com/repos/'+REPO()+'/contents/'+PATH+'?ref='+encodeURIComponent(BRANCH())),data=JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));
  function record(target){const d=target.days[key]||(target.days[key]={views:0,sessions:[],events:{},pages:{},sources:{},updatedAt:null});d.updatedAt=now;d.events=d.events||{};d.pages=d.pages||{};d.sources=d.sources||{};d.sessions=Array.isArray(d.sessions)?d.sessions:[];if(event==='page_view'){d.views=Number(d.views)||0;d.views++;if(session&&!d.sessions.includes(session))d.sessions.push(session);if(d.sessions.length>1000)d.sessions=d.sessions.slice(-1000);d.pages[page]=(d.pages[page]||0)+1}else d.events[event]=(d.events[event]||0)+1;if(source)d.sources[source]=(d.sources[source]||0)+1;target.updatedAt=now}
  record(data);
  let saved=false;for(let attempt=0;attempt<2&&!saved;attempt++){try{await gh('https://api.github.com/repos/'+REPO()+'/contents/'+PATH,{method:'PUT',body:JSON.stringify({message:'analytics: record '+event,content:Buffer.from(JSON.stringify(data,null,2)+'\n').toString('base64'),branch:BRANCH(),sha:file.sha})});saved=true}catch(e){if(attempt===1)throw e;file=await gh('https://api.github.com/repos/'+REPO()+'/contents/'+PATH+'?ref='+encodeURIComponent(BRANCH()));data=JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));record(data)}}
  return json(res,200,{ok:true});
 }catch(e){return json(res,500,{error:'Analytics event could not be recorded'})}
};