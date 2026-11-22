import {neon} from '@neondatabase/serverless';import {readFileSync} from 'node:fs';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';import {createMarketplace} from '../lib/marketplace.js';
const sql=neon(process.env.DATABASE_URL),prefix='qa'+Date.now();const rewrite=s=>s.replaceAll('market_',prefix+'_');
const db=(strings,...args)=>sql.query(strings.map((s,i)=>rewrite(s)+(i<args.length?'$'+(i+1):'')).join(''),args);
const sent=[];const h=createMarketplace({db,environment:{...process.env,LEAD_PROXY_KEY:'isolated-integration-test-only',NODE_ENV:'test'},sendEmail:async p=>{sent.push(p);}});
async function call(action,body,cookie=''){const req={query:{action},method:body?'POST':'GET',headers:{origin:'http://localhost:4173','content-type':'application/json',cookie,'x-forwarded-for':'127.0.0.1'},body};const res={headers:{},code:200,setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(data){this.data=data;return this}};await h(req,res);return res;}
async function login(email){assert.equal((await call('send-code',{email})).code,200);const code=sent.at(-1).text.match(/\b\d{6}\b/)[0];const r=await call('verify-code',{email,code});assert.equal(r.code,200,JSON.stringify(r.data));assert.equal((await call('verify-code',{email,code})).code,400);return r.headers['Set-Cookie'].split(';')[0];}
try{
for(const statement of readFileSync(new URL('./market-schema.sql',import.meta.url),'utf8').split(';').map(s=>s.trim()).filter(Boolean))await sql.query(rewrite(statement));
const admin=await login('contact@greendrift.in'),seller=await login('seller@example.com'),buyer=await login('buyer@example.com');
assert.equal((await call('admin',null,buyer)).code,403);
assert.equal((await call('apply',{business:'QA Parts',name:'QA Seller',phone:'0000000000',city:'Test City',description:'Integration test application, isolated tables.',consent:true},seller)).code,201);
let s=(await call('me',null,seller)).data.seller;assert.equal(s.status,'pending');
const p={title:'QA EV Controller',category:'Motors & Controllers',description:'Integration test listing in isolated tables only.',price:850,stock:4,brand:'QA',compatibility:'48V test'};
assert.equal((await call('product',p,seller)).code,403);
assert.equal((await call('review',{type:'seller',id:s.id,status:'approved',note:'QA'},buyer)).code,403);
assert.equal((await call('review',{type:'seller',id:s.id,status:'approved',note:'QA'},admin)).code,200);
assert.equal((await call('product',p,seller)).code,200);
assert.equal((await call('catalog')).data.products.length,0);
let product=(await call('admin',null,admin)).data.products[0];
assert.equal((await call('review',{type:'product',id:product.id,status:'approved'},admin)).code,200);
assert.equal((await call('catalog')).data.products.length,1);
assert.equal((await call('product',{...p,id:product.id},buyer)).code,403);
let order={product_id:product.id,quantity:2,name:'QA Buyer',phone:'0000000000',address:'QA isolated test address',consent:true,requestId:randomUUID()};
let o=await call('request-order',order,buyer);assert.equal(o.code,201,JSON.stringify(o.data));assert.equal((await call('request-order',order,buyer)).data.id,o.data.id);assert.equal((await call('orders',null,buyer)).data.orders.length,1);assert.equal((await call('orders',null,seller)).data.orders.length,0);
assert.equal((await call('order-status',{id:o.data.id,status:'delivered'},seller)).code,409);
assert.equal((await call('order-status',{id:o.data.id,status:'accepted'},seller)).code,200);
assert.equal((await call('product',{...p,id:product.id},seller)).code,200);assert.equal((await call('catalog')).data.products.length,0);
assert.equal((await call('logout',{},seller)).code,200);assert.equal((await call('me',null,seller)).data.user,null);
console.log('PASS: OTP single-use, seller approval, product moderation, account isolation, order idempotency, transitions, resubmission and logout.');
}finally{
for(const table of ['audit','orders','products','sellers','sessions','codes','limits','users'])await sql.query('DROP TABLE IF EXISTS '+prefix+'_'+table);
console.log('Isolated test tables removed. No marketplace listings or accounts seeded.');
}
