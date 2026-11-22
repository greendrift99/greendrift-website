const dropdown=document.querySelector('.service-dropdown');
if(dropdown){
 dropdown.querySelectorAll('.service-menu-grid>a>span:last-child').forEach(el=>{el.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';});
 const summary=dropdown.querySelector('summary'),nav=document.querySelector('nav'),mobile=matchMedia('(max-width:800px)');
 const backdrop=document.createElement('div');backdrop.className='service-backdrop';backdrop.hidden=true;backdrop.setAttribute('aria-hidden','true');document.body.append(backdrop);
 const footer=document.createElement('div');footer.className='service-menu-footer';footer.innerHTML='<span>Powering the electric ecosystem.</span><a href="/#call">Talk to our team →</a>';dropdown.querySelector('.service-mega').append(footer);
 function close(focus=false){dropdown.open=false;if(focus)summary.focus();}
 dropdown.addEventListener('toggle',()=>{summary.setAttribute('aria-expanded',String(dropdown.open));backdrop.hidden=!dropdown.open||mobile.matches;});
 summary.setAttribute('aria-expanded','false');
 document.addEventListener('click',e=>{if(!dropdown.contains(e.target))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&dropdown.open){e.preventDefault();close(true);}});
 document.addEventListener('focusin',e=>{if(!dropdown.contains(e.target))close();});
 dropdown.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{close();nav.classList.remove('open');document.querySelector('.menu')?.setAttribute('aria-expanded','false');}));
 document.querySelector('.menu')?.addEventListener('click',()=>{if(!nav.classList.contains('open'))close();});
 mobile.addEventListener('change',()=>close());
}
