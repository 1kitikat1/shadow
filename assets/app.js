const reveal = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("visible"); reveal.unobserve(e.target); }});
},{threshold:.12});
document.querySelectorAll(".feature,.large-game,.download-card,.section-title").forEach(e=>{
  e.classList.add("reveal"); reveal.observe(e);
});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{
  const href=a.getAttribute("href");
  if(!href||href==="#")return;
  const el=document.querySelector(href); if(el){e.preventDefault();el.scrollIntoView({behavior:"smooth"});}
}));

/* Последний релиз лаунчера: подставляем версию и точную ссылку на ассеты.
   Если API недоступен — остаются статичные href (releases/latest/download/...). */
fetch("https://api.github.com/repos/1kitikat1/Launch/releases/latest", {headers:{Accept:"application/vnd.github+json"}})
  .then(r=>r.ok?r.json():null)
  .then(rel=>{
    if(!rel) return;
    const tag=rel.tag_name||"";
    if(tag) document.querySelectorAll("[data-version]").forEach(e=>e.textContent=tag);
    const assets=rel.assets||[];
    const setup=assets.find(a=>a.name==="NemesisSetup.exe");
    if(setup) document.querySelectorAll("[data-download]").forEach(a=>a.href=setup.browser_download_url);
    const zip=assets.find(a=>a.name&&a.name.endsWith(".zip"));
    if(zip) document.querySelectorAll("[data-portable]").forEach(a=>a.href=zip.browser_download_url);
  })
  .catch(()=>{});
