const {validSession,json,originOk}=require('./_auth');
module.exports=async function(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
  if(!originOk(req)||!validSession(req))return json(res,401,{error:'Unauthorized'});
  let body={};
  try{body=typeof req.body==='string'?JSON.parse(req.body):(req.body||{})}catch(e){return json(res,400,{error:'Invalid request'})}
  const rawPath=String(body.path||'').replace(/^\/+/, '');
  const base64=String(body.contentBase64||'').replace(/^data:[^;]+;base64,/,'');
  if(!/^assets\/(logo|images)\/[A-Za-z0-9._-]+$/.test(rawPath))return json(res,400,{error:'Only logo and image files can be uploaded'});
  if(!/\.(svg|png|jpe?g|webp|gif|ico)$/i.test(rawPath))return json(res,400,{error:'Unsupported image format'});
  if(!base64||base64.length>3500000)return json(res,400,{error:'Image is missing or too large (maximum about 2.5 MB)'});
  const repo=process.env.GITHUB_REPO||'orivonatech/gmax',branch=process.env.GITHUB_BRANCH||'main';
  const api='https://api.github.com/repos/'+repo+'/contents/gmax-website/'+rawPath;
  const headers={Authorization:'Bearer '+process.env.GITHUB_TOKEN,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'GMAX-Admin','Content-Type':'application/json'};
  try{
    let sha;
    const current=await fetch(api+'?ref='+encodeURIComponent(branch),{headers});
    if(current.ok){const d=await current.json();sha=d.sha}
    const payload={message:'Update website media: '+rawPath,content:base64,branch};
    if(sha)payload.sha=sha;
    const r=await fetch(api,{method:'PUT',headers,body:JSON.stringify(payload)});
    const d=await r.json();
    if(!r.ok)throw Error(d.message||'GitHub upload failed');
    return json(res,200,{ok:true,path:rawPath,commitSha:d.commit?.sha||null});
  }catch(e){return json(res,500,{error:e.message||'Upload failed'})}
};