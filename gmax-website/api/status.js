const {validSession,json}=require('./_auth');
module.exports=async function(req,res){
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 if(!validSession(req))return json(res,401,{error:'Unauthorized'});
 if(!process.env.GITHUB_TOKEN)return json(res,500,{error:'GITHUB_TOKEN is not configured'});
 try{
  const repo=process.env.GITHUB_REPO||'orivonatech/gmax',branch=process.env.GITHUB_BRANCH||'main';
  const r=await fetch('https://api.github.com/repos/'+repo+'/contents/gmax-website/data/content.json?ref='+branch,{headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'GMAX-Admin'}});
  const d=await r.json();
  if(!r.ok)return json(res,502,{error:d.message||'GitHub content check failed'});
  const data=JSON.parse(Buffer.from(d.content||'','base64').toString('utf8'));
  return json(res,200,{ok:true,role:'Admin',updatedAt:data.updatedAt||null,status:data.status||'published'});
 }catch(e){return json(res,502,{error:e.message||'Could not verify published content with GitHub'});}
};
