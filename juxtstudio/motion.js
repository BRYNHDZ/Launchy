/* Juxt Studio v13 motion. Vanilla JS, transform/opacity/clip-path only. */
(function(){
  var d=document,root=d.documentElement,w=window;
  var still=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
  function mask(el,inline){
    if(!el||el.querySelector('.mi'))return;
    var o=d.createElement('span');o.className='mk'+(inline?' il':'');
    var i=d.createElement('span');i.className='mi';
    while(el.firstChild)i.appendChild(el.firstChild);
    o.appendChild(i);el.appendChild(o);
  }
  function wrap(el,cls){var x=d.createElement('div');x.className=cls;el.parentNode.insertBefore(x,el);x.appendChild(el);return x}

  /* header: backdrop after scrolling, hide going down, show going up */
  var hdr=d.querySelector('.hdr'),lastY=w.scrollY;
  function onHdr(){var y=w.scrollY;
    hdr.classList.toggle('solid',y>60);
    if(y>lastY+6&&y>320)hdr.classList.add('away');else if(y<lastY-6||y<320)hdr.classList.remove('away');
    lastY=y}
  w.addEventListener('scroll',onHdr,{passive:true});onHdr();

  if(still){$('.reveal').forEach(function(e){e.classList.add('in')});return}
  if(!root.classList.contains('mo'))return;

  /* ---- markup for masks / layers ---- */
  $('.sec-head').forEach(function(h){mask(h.querySelector('.num'),1);mask(h.querySelector('.label'),1)});
  $('.b-row').forEach(function(r){
    var p=r.querySelector('.b-photo');p.classList.add('wipe');
    mask(r.querySelector('h3'));
    $('.b-text .num,.b-role,.b-line,.b-text .link',r).forEach(function(e){e.classList.add('u')});
  });
  var copy=d.querySelector('.studio .copy');
  if(copy){$('.mono,p,dl',copy).forEach(function(e){e.classList.add('u')});mask(copy.querySelector('h2'))}
  var fig=d.querySelector('.studio-photo');
  if(fig){var im=fig.querySelector('img');var px=wrap(im,'px');wrap(px,'wipe')}
  var vis=d.querySelector('.visit');
  if(vis){mask(vis.querySelector('.addr'));vis.querySelector('.link').classList.add('u');$('.hours li',vis).forEach(function(e){e.classList.add('u')})}
  $('.ftr .top>div,.ftr .small').forEach(function(e){e.classList.add('u')});
  var ft=d.querySelector('.ftr .wrap');if(ft)ft.classList.add('reveal');
  /* stagger within each block, in document order */
  $('.reveal').forEach(function(r){
    var k=0;$('.mi,.u,.wipe',r).forEach(function(e){
      if(e.classList.contains('mi')&&e.closest('.wipe'))return;
      e.style.setProperty('--d',(k++*0.075).toFixed(3)+'s')});
  });

  /* ---- hero intro: headline split into real lines, then masked slide-up ---- */
  var h1=d.querySelector('.hero h1'),orig=h1.innerHTML;
  mask(d.querySelector('.hero .label'),1);
  function split(){
    var words=h1.textContent.trim().split(/\s+/);
    h1.innerHTML=words.map(function(x){return '<span class="w" style="display:inline-block">'+x+'</span>'}).join(' ');
    var lines=[],top=null;
    $('.w',h1).forEach(function(s){if(s.offsetTop!==top){lines.push([]);top=s.offsetTop}lines[lines.length-1].push(s.textContent)});
    h1.innerHTML=lines.map(function(l,i){return '<span class="mk"><span class="mi" style="--d:'+(0.45+i*0.13).toFixed(2)+'s">'+l.join(' ')+'</span></span>'}).join('');
    h1.classList.add('split');
    d.querySelector('.hero .label .mi').style.setProperty('--d','.3s');
    requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('go')})});
    /* put the plain text back once it has landed so it reflows normally on resize */
    setTimeout(function(){h1.innerHTML=orig},0.45e3+lines.length*130+1500);
  }
  var started=false;function start(){if(started)return;started=true;split()}
  if(d.fonts&&d.fonts.ready){d.fonts.ready.then(start)}setTimeout(start,600);

  /* ---- scroll reveals ---- */
  var els=$('.reveal');
  if(!('IntersectionObserver' in w)){els.forEach(function(e){e.classList.add('in')})}
  else{
    var io=new IntersectionObserver(function(es){
      var n=0;
      es.filter(function(e){return e.isIntersecting}).sort(function(a,b){return a.boundingClientRect.left-b.boundingClientRect.left||a.boundingClientRect.top-b.boundingClientRect.top})
        .forEach(function(e){
          if(e.target.classList.contains('b-row'))e.target.style.setProperty('--b',(n++*0.14).toFixed(2)+'s');
          e.target.classList.add('in');io.unobserve(e.target)});
    },{rootMargin:'0px 0px -12% 0px',threshold:0.05});
    els.forEach(function(e){io.observe(e)});
  }

  /* ---- light parallax (rAF, only while on screen) ---- */
  var hm=d.querySelector('.hero-media'),ht=d.querySelector('.hero-text'),spx=d.querySelector('.studio-photo .px img');
  var mob=w.matchMedia('(max-width: 959px)'),ticking=false;
  function px(){
    ticking=false;var y=w.scrollY,vh=w.innerHeight,k=mob.matches?0.12:0.22;
    if(y<vh*1.2){hm.style.transform='translate3d(0,'+(y*k).toFixed(1)+'px,0)';
      if(!mob.matches){ht.style.transform='translate3d(0,'+(y*-0.06).toFixed(1)+'px,0)';ht.style.opacity=Math.max(0,1-y/(vh*0.75)).toFixed(3)}}
    if(spx){var r=spx.parentNode.getBoundingClientRect();
      if(r.bottom>0&&r.top<vh){var p=(r.top+r.height/2-vh/2)/vh;spx.style.setProperty('--py',(p*-(mob.matches?18:36)).toFixed(1)+'px')}}
  }
  w.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(px)}},{passive:true});
  w.addEventListener('resize',px);px();
})();
