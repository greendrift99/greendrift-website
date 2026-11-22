const login=document.querySelector('#portal-login');
const support=document.querySelector('#portal-support');
login.addEventListener('click',()=>{support.hidden=false;document.body.classList.add('portal-support-active');login.textContent='Connect with support';support.focus({preventScroll:true});support.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});});
