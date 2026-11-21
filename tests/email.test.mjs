import test from 'node:test';
import assert from 'node:assert/strict';
import {notifyLead} from '../lib/lead-email.js';
const environment={RESEND_API_KEY:'test',RESEND_EMAIL_DOMAIN:'mail.greendrift.in'};
const logger={info(){},error(){}};
const saved={reference:'GD-TEST',path:'/api/investor-leads',lead:{name:'Test',email:'test@example.com',phone:'123',scenario:{count:50,payoutModel:'revenue-sharing'},unwanted:'private'}};
test('notifications use fixed company recipient, reply-to and saved lead reference',async()=>{
 let payload,options;
 assert.equal(await notifyLead(saved,{environment,logger,send:async(p,o)=>{payload=p;options=o;return {data:{id:'email-test'}};}}),true);
 assert.deepEqual(payload.to,['contact@greendrift.in']);assert.equal(payload.replyTo,'test@example.com');
 assert.match(payload.text,/count: 50/);assert.ok(!payload.text.includes('private'));assert.equal(options.idempotencyKey,'lead-GD-TEST');
});
test('temporary failure retries idempotently; permanent failures remain observable',async()=>{
 let calls=0;
 assert.equal(await notifyLead(saved,{environment,logger,send:async()=>{calls++;return calls===1?{error:{statusCode:500}}:{data:{id:'ok'}};}}),true);assert.equal(calls,2);
 calls=0;assert.equal(await notifyLead(saved,{environment,logger,send:async()=>{calls++;return {error:{statusCode:403}};}}),false);assert.equal(calls,1);
});
