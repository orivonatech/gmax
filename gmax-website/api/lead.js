const {json,originOk}=require('./_auth');
const REPO=()=>process.env.GITHUB_REPO||'orivonatech/gmax';const BRANCH=()=>process.env.GITHUB_BRANCH||'main';const PATH='gmax-website/data/leads.json';
const recent=new Map();
function clientKey(req){return String(req.headers['x-forwarded-for']||req.headers['x-real-ip']||'unknown').split(',')[0].trim().slice(0,80)}
function throttled(req){const k=clientKey(req),now=Date.now(),last=recent.get(k)||0;if(now-last<15000)return true;recent.set(k,now);if(recent.size>2000)for(const [key,time] of recent)if(now-time>3600000)recent.delete(key);return false}
async function gh(url,opts={}){const r=await fetch(url,{...opts,headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'GMAX-Website','Content-Type':'application/json'}});const d=await r.json();if(!r.ok)throw Error(d.message||'GitHub request failed');return d}
module.exports=async function(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!originOk(req))return json(res,403,{error:'Invalid origin'});
 if(!process.env.GITHUB_TOKEN)return json(res,500,{error:'Lead storage is not configured'});
 try{
  const b=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
  if(String(b.website||'').trim())return json(res,200,{ok:true,message:'Thank you. Your message has been received.'});
  if(throttled(req))return json(res,429,{error:'Please wait a few seconds before sending another message.'});
  const name=String(b.name||'').trim(),email=String(b.email||'').trim(),phone=String(b.phone||'').trim(),message=String(b.message||'').trim(),source=String(b.source||'Website contact form').trim().slice(0,300),landingPage=String(b.landingPage||'').trim().slice(0,200),referrer=String(b.referrer||'').trim().slice(0,500);
  if(!name||!email||!message)return json(res,400,{error:'Name, email and message are required'});
  if(name.length>120||email.length>160||phone.length>40||message.length>3000)return json(res,400,{error:'One or more fields are too long'});
  if(!/^\S+@\S+\.\S+$/.test(email))return json(res,400,{error:'Please enter a valid email address'});
  let file;for(let attempt=0;attempt<3;attempt++){try{file=await gh('https://api.github.com/repos/'+REPO()+'/contents/'+PATH+'?ref='+encodeURIComponent(BRANCH()));break}catch(e){if(attempt===2)throw e;await new Promise(r=>setTimeout(r,250*(attempt+1)))}}
  const lead={id:'lead-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),name,email,phone,message,status:'New',source:source||'Website contact form',landingPage,referrer,createdAt:new Date().toISOString()};
  let saved=false;
  for(let attempt=0;attempt<2&&!saved;attempt++){
   const data=JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));if(!Array.isArray(data.leads))data.leads=[];
   data.leads.unshift(lead);data.updatedAt=lead.createdAt;if(data.leads.length>500)data.leads=data.leads.slice(0,500);
   try{await gh('https://api.github.com/repos/'+REPO()+'/contents/'+PATH,{method:'PUT',body:JSON.stringify({message:'lead: add website contact submission',content:Buffer.from(JSON.stringify(data,null,2)+'\n').toString('base64'),branch:BRANCH(),sha:file.sha})});saved=true}catch(e){if(attempt===1)throw e;file=await gh('https://api.github.com/repos/'+REPO()+'/contents/'+PATH+'?ref='+encodeURIComponent(BRANCH()))}
  }
  return json(res,200,{ok:true,message:'Thank you. Your message has been received.'});
 }catch(e){return json(res,500,{error:'We could not submit your message right now.'})}
};