const {validSession,json,originOk}=require('./_auth');
const REPO=()=>process.env.GITHUB_REPO||'orivonatech/gmax',BRANCH=()=>process.env.GITHUB_BRANCH||'main',APATH='gmax-website/data/analytics.json',LPATH='gmax-website/data/leads.json';
async function gh(url){const r=await fetch(url,{headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'GMAX-Admin'}});const d=await r.json();if(!r.ok)throw Error(d.message||'GitHub request failed');return d}
function key(d){return d.toISOString().slice(0,10)}function add(a,b){Object.entries(b||{}).forEach(([k,v])=>a[k]=(a[k]||0)+(Number(v)||0))}
module.exports=async function(req,res){
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});if(!validSession(req)||!originOk(req))return json(res,403,{error:'Unauthorized'});if(!process.env.GITHUB_TOKEN)return json(res,500,{error:'GITHUB_TOKEN is not configured'});
 try{
  const u=new URL(req.url,'https://gmax.local'),days=Math.min(Math.max(Number(u.searchParams.get('days')||30),1),3650),end=new Date(),start=new Date(end);start.setUTCDate(start.getUTCDate()-(days-1));const from=key(start),to=key(end);
  const af=await gh('https://api.github.com/repos/'+REPO()+'/contents/'+APATH+'?ref='+encodeURIComponent(BRANCH())),data=JSON.parse(Buffer.from(af.content,'base64').toString('utf8'));
  let views=0,approxSessions=0;const events={},pages={},sources={},daily=[];
  Object.entries(data.days||{}).forEach(([k,d])=>{if(k<from||k>to)return;const v=Number(d.views)||0,s=Array.isArray(d.sessions)?d.sessions.length:0;views+=v;approxSessions+=s;add(events,d.events);add(pages,d.pages);add(sources,d.sources);daily.push({date:k,views:v,sessions:s,events:d.events||{}})});
  daily.sort((a,b)=>a.date.localeCompare(b.date));
  let leads=0,newLeads=0,closedLeads=0;const leadSources={};
  try{const lf=await gh('https://api.github.com/repos/'+REPO()+'/contents/'+LPATH+'?ref='+encodeURIComponent(BRANCH())),ld=JSON.parse(Buffer.from(lf.content,'base64').toString('utf8'));(ld.leads||[]).forEach(l=>{const d=new Date(l.createdAt);if(isNaN(d)||key(d)<from||key(d)>to)return;leads++;if(l.status==='New')newLeads++;if(l.status==='Closed')closedLeads++;const s=String(l.source||'Website contact form');leadSources[s]=(leadSources[s]||0)+1})}catch(_){}
  const topPages=Object.entries(pages).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([page,count])=>({page,count})),topSources=Object.entries(sources).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([source,count])=>({source,count}));
  return json(res,200,{ok:true,range:{from,to,days},summary:{views,approxSessions,leads,newLeads,closedLeads,leadConversionPercent:views?Math.round(leads/views*10000)/100:0},events,pages:topPages,sources:topSources,leadSources,daily});
 }catch(e){return json(res,500,{error:e.message||'Could not load analytics'})}
};