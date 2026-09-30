const {validSession,json,originOk}=require('./_auth');
const REPO=()=>process.env.GITHUB_REPO||'orivonatech/gmax';const BRANCH=()=>process.env.GITHUB_BRANCH||'main';const PATH='gmax-website/data/leads.json';
async function gh(url,opts={}){const r=await fetch(url,{...opts,headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'GMAX-Admin','Content-Type':'application/json'}});const d=await r.json();if(!r.ok)throw Error(d.message||'GitHub request failed');return d}
function clean(d){return (d.leads||[]).map(x=>({id:String(x.id||''),name:String(x.name||''),email:String(x.email||''),phone:String(x.phone||''),message:String(x.message||''),status:['New','Contacted','Closed'].includes(x.status)?x.status:'New',source:String(x.source||''),createdAt:x.createdAt||null}))}
module.exports=async function(req,res){
 if(!validSession(req)||!originOk(req))return json(res,403,{error:'Unauthorized'});
 try{
  const file=await gh('https://api.github.com/repos/'+REPO()+'/contents/'+PATH+'?ref='+encodeURIComponent(BRANCH()));
  const data=JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));
  if(req.method==='GET')return json(res,200,{ok:true,leads:clean(data)});
  if(req.method!=='PATCH')return json(res,405,{error:'Method not allowed'});
  const body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{}),id=String(body.id||''),status=String(body.status||'');
  if(!id||!['New','Contacted','Closed'].includes(status))return json(res,400,{error:'Valid lead and status are required'});
  const leads=clean(data),idx=leads.findIndex(x=>x.id===id);if(idx<0)return json(res,404,{error:'Lead not found'});
  leads[idx].status=status;data.leads=leads;data.updatedAt=new Date().toISOString();
  await gh('https://api.github.com/repos/'+REPO()+'/contents/'+PATH,{method:'PUT',body:JSON.stringify({message:'admin: update lead status',content:Buffer.from(JSON.stringify(data,null,2)+'\n').toString('base64'),branch:BRANCH(),sha:file.sha})});
  return json(res,200,{ok:true,lead:leads[idx]});
 }catch(e){return json(res,500,{error:e.message||'Lead operation failed'})}
};
