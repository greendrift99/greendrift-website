import {Resend} from 'resend';

const recipient='contact@greendrift.in';
const fields=['name','phone','email','interest','opportunity','message','notes','source'];
export async function notifyLead({reference,path,lead},{environment=process.env,send,logger=console}={}) {
  if(!environment.RESEND_API_KEY||!environment.RESEND_EMAIL_DOMAIN){
    logger.error('lead_email_unconfigured',{reference});return false;
  }
  const type=path==='/api/investor-leads'?'Investment enquiry':'Contact enquiry';
  const lines=[`New Green Drift ${type.toLowerCase()}`,`Reference: ${reference}`,''];
  for(const field of fields)if(typeof lead[field]==='string')lines.push(`${field}: ${lead[field].slice(0,2000)}`);
  if(lead.scenario&&typeof lead.scenario==='object'){
    lines.push('','Investment scenario (visitor estimates, not guaranteed):');
    for(const field of ['model','count','unitCost','payoutModel','setup','monthlyRevenue','sharePercent']){
      const value=lead.scenario[field];
      if(['string','number'].includes(typeof value))lines.push(`${field}: ${String(value).slice(0,200)}`);
    }
  }
  const payload={from:`Green Drift Leads <leads@${environment.RESEND_EMAIL_DOMAIN}>`,to:[recipient],subject:`Green Drift | ${type} | ${reference}`,text:lines.join('\n')};
  if(typeof lead.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email))payload.replyTo=lead.email;
  const deliver=send||((payload,options)=>new Resend(environment.RESEND_API_KEY).emails.send(payload,options));
  for(let attempt=0;attempt<2;attempt++){
    try{
      const result=await deliver(payload,{idempotencyKey:`lead-${reference}`,signal:AbortSignal.timeout(3000)});
      if(!result.error){logger.info('lead_email_sent',{reference,emailId:result.data?.id});return true;}
      if(result.error.statusCode&&result.error.statusCode<500&&result.error.statusCode!==429)break;
    }catch{ /* Retry temporary transport failures using the same idempotency key. */ }
  }
  logger.error('lead_email_failed',{reference});return false;
}
