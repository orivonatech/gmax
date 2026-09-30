const {validSession,json,originOk}=require('./_auth');
const REPO=()=>process.env.GITHUB_REPO||'orivonatech/gmax';
const BRANCH=()=>process.env.GITHUB_BRANCH||'main';
const PATH='gmax-website/data/content.json';
async function gh(url){const r=await fetch(url,{headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'GMAX-Admin'}});const d=await r.json();if(!r.ok)throw Error(d.message||'GitHub request failed');return d}
module.exports=async function(req,res){
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 if(!validSession(req)||!originOk(req))return json(res,403,{error:'Unauthorized'});
 if(!process.env.GITHUB_TOKEN)return json(res,500,{error:'GITHUB_TOKEN is not configured'});
 try{
  const u='https://api.github.com/repos/'+REPO()+'/commits?path='+encodeURIComponent(PATH)+'&sha='+encodeURIComponent(BRANCH())+'&per_page=30';
  const commits=await gh(u);
  const versions=commits.map(c=>({sha:c.sha,date:c.commit?.author?.date||c.commit?.committer?.date||null,message:c.commit?.message||'',author:c.commit?.author?.name||c.author?.login||'Admin'}));
  return json(res,200,{ok:true,versions});
 }catch(e){return json(res,500,{error:e.message||'Could not load version history'})}
};
