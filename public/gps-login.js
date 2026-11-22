const form=document.querySelector('#gps-login-form');
const support=document.querySelector('#portal-support');
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  support.hidden=false;
  document.body.classList.add('portal-support-active');
  document.querySelector('#client-id').setAttribute('aria-invalid','true');
  document.querySelector('#client-password').value='';
  document.querySelector('#portal-login-error').focus({preventScroll:true});
  support.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
});
form.addEventListener('input',()=>{support.hidden=true;document.body.classList.remove('portal-support-active');document.querySelector('#client-id').removeAttribute('aria-invalid');});
form.addEventListener('focusin',()=>document.body.classList.add('is-typing'));
form.addEventListener('focusout',()=>{requestAnimationFrame(()=>{if(!form.contains(document.activeElement))document.body.classList.remove('is-typing');});});
document.addEventListener('visibilitychange',()=>{document.querySelectorAll('.fusion *, .portal-mini-energy *').forEach(el=>{el.style.animationPlayState=document.hidden?'paused':'';});});
