const {json,originOk}=require('./_auth');
const REPO=()=>process.env.GITHUB_REPO||'orivonatech/gmax';const BRANCH=()=>process.env.GITHUB_BRANCH||'main';const PATH='gmax-website/data/leads.json';
async function gh(url,opts={}){const r=await fetch(url,{...opts,headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'GMAX-Website','Content-Type':'application/json'}});const d=await r.json();if(!r.ok)throw Error(d.message||'GitHub request failed');return d}
module.exports=async function(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!originOk(req))return json(res,403,{error:'Invalid origin'});
 if(!process.env.GITHUB_TOKEN)return json(res,500,{error:'Lead storage is not configured'});
 try{
  const b=typeof req.body==='string'?JSON.parse(req.body):(req.body||{});
  const name=String(b.name||'').trim(),email=String(b.email||'').trim(),phone=String(b.phone||'').trim(),message=String(b.message||'').trim();
  if(!name||!email||!message)return json(res,400,{error:'Name, email and message are required'});
  if(name.length>120||email.length>160||phone.length>40||message.length>3000)return json(res,400,{error:'One or more fields are too long'});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json(res,400,{error:'Please enter a valid email address'});
  const file=await gh('https://api.github.com/repos/'+REPO()+'/contents/'+PATH+'?ref='+encodeURIComponent(BRANCH()));
  const data=JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));if(!Array.isArray(data.leads))data.leads=[];
  const lead={id:'lead-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),name,email,phone,message,status:'New',source:'Website contact form',createdAt:new Date().toISOString()};
  data.leads.unshift(lead);data.updatedAt=lead.createdAt;
  if(data.leads.length>500)data.leads=data.leads.slice(0,500);
  await gh('https://api.github.com/repos/'+REPO()+'/contents/'+PATH,{method:'PUT',body:JSON.stringify({message:'lead: add website contact submission',content:Buffer.from(JSON.stringify(data,null,2)+'\n').toString('base64'),branch:BRANCH(),sha:file.sha})});
  return json(res,200,{ok:true,message:'Thank you. Your message has been received.'});
 }catch(e){return json(res,500,{error:'We could not submit your message right now.'})}
};
