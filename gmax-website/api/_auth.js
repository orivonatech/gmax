const crypto=require('crypto');
const COOKIE='gmax_admin_session';
function secret(){return process.env.SESSION_SECRET||''}
function sign(value){return crypto.createHmac('sha256',secret()).update(value).digest('hex')}
function makeSession(){const payload=Buffer.from(JSON.stringify({u:process.env.ADMIN_USERNAME||'admin',exp:Date.now()+8*60*60*1000})).toString('base64url');return payload+'.'+sign(payload)}
function parseCookie(header){const m=(header||'').match(new RegExp('(?:^|; )'+COOKIE+'=([^;]+)'));return m?decodeURIComponent(m[1]):null}
function validSession(req){if(!secret()||!process.env.ADMIN_USERNAME||!process.env.ADMIN_PASSWORD)return false;const raw=parseCookie(req.headers.cookie);if(!raw)return false;const [payload,sig]=raw.split('.');if(!payload||!sig)return false;const a=Buffer.from(sig),b=Buffer.from(sign(payload));if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return false;try{return JSON.parse(Buffer.from(payload,'base64url').toString()).exp>Date.now()}catch(e){return false}}
function cookie(value,maxAge){return COOKIE+'='+encodeURIComponent(value)+'; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age='+maxAge}
function json(res,status,body,headers={}){res.statusCode=status;Object.entries(headers).forEach(([k,v])=>res.setHeader(k,v));res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store, max-age=0');res.setHeader('X-Content-Type-Options','nosniff');res.end(JSON.stringify(body))}
function originOk(req){const origin=req.headers.origin;if(!origin)return true;return origin==='https://'+req.headers.host||origin==='http://'+req.headers.host}
module.exports={makeSession,validSession,cookie,json,originOk};