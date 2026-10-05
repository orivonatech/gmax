const {validSession,json,originOk}=require('./_auth');
const REPO=()=>process.env.GITHUB_REPO||'orivonatech/gmax';const BRANCH=()=>process.env.GITHUB_BRANCH||'main';
const PATH='gmax-website/data/content.json';const BACKUP='gmax-website/data/content.backup.json';
async function gh(path,ref){const u='https://api.github.com/repos/'+REPO()+'/contents/'+path+(ref?'?ref='+encodeURIComponent(ref):'');const r=await fetch(u,{headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'GMAX-Admin'}});const d=await r.json();if(!r.ok)throw Error(d.message||'GitHub request failed');return d}
async function put(path,content,message,sha){const r=await fetch('https://api.github.com/repos/'+REPO()+'/contents/'+path,{method:'PUT',headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'GMAX-Admin','Content-Type':'application/json'},body:JSON.stringify({message,content:Buffer.from(content).toString('base64'),branch:BRANCH(),sha})});const d=await r.json();if(!r.ok)throw Error(d.message||'GitHub update failed');return d}
function validUrl(value){const raw=String(value||'').trim();if(!raw)return true;if(raw.startsWith('#')||raw.startsWith('/')||raw.startsWith('./')||raw.startsWith('../')||/^(mailto|tel):/i.test(raw))return true;try{const u=new URL(raw,'https://g-maxwebsite.vercel.app/');return u.protocol==='https:'||u.protocol==='http:'}catch(e){return false}}
function validate(d){if(!d||typeof d!=='object'||!d.homepage||!d.about||!Array.isArray(d.services)||!d.pricing||!Array.isArray(d.faq)||!d.contact||!Array.isArray(d.images))throw Error('Invalid historical content');if(JSON.stringify(d).length>250000)throw Error('Content is too large');const seo=d.site?.seo||{};const urls=[d.site?.logo,d.favicon,d.homepage?.heroImage,d.homepage?.heroButton?.url,...(d.homepage?.heroSlides||[]).map(x=>x?.url),...(d.homepage?.layout||[]).map(x=>x?.buttonUrl),...(d.services||[]).map(x=>x?.url),...(d.site?.nav||[]).map(x=>x?.url),...(d.site?.social||[]).map(x=>x?.url),seo.canonicalUrl,seo.ogImage];if(urls.some(v=>v&&!validUrl(v)))throw Error('Invalid historical website URL');return d}
module.exports=async function(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 if(!validSession(req)||!originOk(req))return json(res,403,{error:'Unauthorized'});
 if(!process.env.GITHUB_TOKEN)return json(res,500,{error:'GITHUB_TOKEN is not configured'});
 try{
  const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{}),sha=String(body.sha||'');
  if(!/^[0-9a-f]{7,64}$/i.test(sha))return json(res,400,{error:'A valid version is required'});
  const selected=await gh(PATH,sha),current=await gh(PATH),currentRaw=Buffer.from(current.content,'base64').toString('utf8');
  const selectedRaw=Buffer.from(selected.content,'base64').toString('utf8');const data=validate(JSON.parse(selectedRaw));
  data.status='published';data.updatedAt=new Date().toISOString();data.publishedBy='admin';data.version=Number(data.version||1)+1;
  let backup;try{backup=await gh(BACKUP)}catch(e){backup=null}
  if(backup)await put(BACKUP,currentRaw,'chore: backup before restoring G-MAX version',backup.sha);
  else await put(BACKUP,currentRaw,'chore: create G-MAX backup before restore');
  const nextRaw=JSON.stringify(data,null,2)+'\n';await put(PATH,nextRaw,'content: restore G-MAX published version',current.sha);
  return json(res,200,{ok:true,content:data,restoredFrom:sha,updatedAt:data.updatedAt});
 }catch(e){return json(res,500,{error:e.message||'Version restore failed'})}
};
