import {createHash} from 'node:crypto';
export function createLeadHandler(path,{fetchImpl=fetch,environment=process.env}={}) {
  return async function handler(req,res) {
    res.setHeader('Cache-Control','no-store');
    if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed.'});}
    const forwardedHost=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim();
    let origin;try{origin=new URL(req.headers.origin);}catch{return res.status(403).json({error:'Please submit from the Green Drift website.'});}
    if(origin.host!==forwardedHost||!['https:','http:'].includes(origin.protocol))return res.status(403).json({error:'Please submit from the Green Drift website.'});
    if(!String(req.headers['content-type']||'').includes('application/json'))return res.status(415).json({error:'Invalid request format.'});
    let body;try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{return res.status(400).json({error:'Invalid enquiry.'});}
    if(!body||Array.isArray(body)||typeof body!=='object')return res.status(400).json({error:'Invalid enquiry.'});
    const serialized=JSON.stringify(body);if(Buffer.byteLength(serialized)>12000)return res.status(413).json({error:'Request is too large.'});
    if(!environment.LEAD_PROXY_KEY)return res.status(503).json({error:'Enquiry service is temporarily unavailable. Please call +91 81091 05582.'});
    try{
      const backend=new URL(environment.LEAD_BACKEND_URL||'https://green-drift-mobility.knitoctet8.chatgpt.site');
      if(backend.protocol!=='https:')throw new Error('Invalid backend');
      const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim();
      const clientHash=createHash('sha256').update(ip).digest('hex');
      const response=await fetchImpl(new URL(path,backend),{method:'POST',headers:{'Content-Type':'application/json','Origin':backend.origin,'X-GreenDrift-Proxy-Key':environment.LEAD_PROXY_KEY,'X-GreenDrift-Client':clientHash},body:serialized,redirect:'error',signal:AbortSignal.timeout(12000)});
      const data=await response.json();
      if(typeof data?.reference==='string'&&response.ok)return res.status(response.status).json({reference:data.reference});
      return res.status(response.ok?502:response.status).json({error:typeof data?.error==='string'?data.error:'We couldn’t save your enquiry. Please try again.'});
    }catch{return res.status(502).json({error:'We couldn’t reach the enquiry service. Please try again or call +91 81091 05582.'});}
  };
}
