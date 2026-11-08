import {components,related,available} from './knowledge.js';
const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
let book,chapter,section,selected='frame',variant='camera',targetSpread=0,viewer;
const preferredVariants={display:'display',imu:'ar'};

function button(text,fn){
  const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;return b;
}
function sourceUrl(item){return new URL('../'+item.href,location.href).href;}
function relevantIds(){return [...new Set(chapter.sections.flatMap(s=>s.componentIds))];}
function updateUrl(){
  const url=new URL(location.href);
  url.searchParams.set('chapter',chapter.id);
  if(section)url.searchParams.set('section',section.id);
  url.searchParams.set('component',selected);url.searchParams.set('variant',variant);
  history.replaceState(null,'',url);
}
function setSpread(value){
  targetSpread=value;$('spread').value=Math.round(value*100);
  $('explode').textContent=value>0?'收拢结构':'展开结构';
  $('explode').setAttribute('aria-pressed',String(value>0));
  viewer?.setSpread(value);
}
function clearPrompt(){
  $('prompt-output').value='';$('copy').hidden=true;$('copy').textContent='复制上下文';
}
function read(s,scroll=true){
  section=s;$('reading-title').textContent=s.title;
  $('source-link').href=sourceUrl(s);
  $('reading-body').replaceChildren(...s.paragraphs.map(text=>{
    const p=document.createElement('p');p.textContent=text;return p;
  }));
  if(!s.paragraphs.length)$('reading-body').textContent='请通过上方链接阅读完整原文。';
  for(const b of $('sections').children)b.classList.toggle('current',b.dataset.section===s.id);
  clearPrompt();updateUrl();
  if(scroll)$('reader').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
function select(id){
  const c=available(variant).find(c=>c.id===id);
  if(!c)return;
  selected=id;$('model-selection').textContent='已选组件 · '+c.name;$('component-title').textContent=c.name;$('component-desc').textContent=c.desc;
  const links=chapter.sections.filter(s=>related(s,c));
  $('component-links').replaceChildren(...links.map(s=>button('↗ '+s.title,()=>read(s))));
  if(!links.length)$('component-links').textContent='本章未设置该组件的直接阅读关联，可切换章节继续探索。';
  $('component-list').replaceChildren(...available(variant).map(c=>{
    const b=button(c.name,()=>select(c.id));
    b.classList.toggle('selected',c.id===id);b.setAttribute('aria-pressed',String(c.id===id));return b;
  }));
  const hidden=relevantIds().filter(id=>!available(variant).some(c=>c.id===id));
  $('variant-hint').textContent=hidden.length
    ?'本章还涉及 '+hidden.map(id=>components.find(c=>c.id===id).name).join('、')+'，可切换眼镜类型查看。'
    :'当前类型可展示本章全部已关联组件。';
  viewer?.select(id,relevantIds());clearPrompt();updateUrl();
}
function setVariant(value,desired=selected){
  variant=value;$('variant').value=value;viewer?.setVariant(value);
  select(available(value).some(c=>c.id===desired)?desired:'frame');
}
function setChapter(index,sectionId){
  chapter=book.chapters[index];
  $('chapter-title').textContent=chapter.title;
  $('view-caption').textContent=chapter.title.split('：')[0];
  $('book-link').href=sourceUrl(chapter);
  [...$('chapters').children].forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-current',i===index?'page':'false');});
  $('chapter-intro').textContent=`${chapter.sections.length} 个小节 · 阅读原文与三维结构相互关联。`;
  $('sections').replaceChildren(...chapter.sections.map(s=>{
    const b=button(s.title,()=>{read(s);selectForSection(s);});b.dataset.section=s.id;return b;
  }));
  const s=chapter.sections.find(s=>s.id===sectionId)||chapter.sections[0];
  if(s)read(s,false);
  setSpread(index===0?0:.65);
  const focus=sectionId?s.componentIds[0]:chapter.focusComponentId;
  const required=preferredVariants[focus];
  if(required&&!available(variant).some(c=>c.id===focus))setVariant(required,focus);
  else select(available(variant).some(c=>c.id===focus)?focus:'frame');
}
function selectForSection(s){
  const primary=s.componentIds[0];
  if(!available(variant).some(c=>c.id===primary))setVariant(preferredVariants[primary]||'camera',primary);
  else select(primary);
}
$('variant').onchange=e=>setVariant(e.target.value);
$('spread').oninput=e=>setSpread(Number(e.target.value)/100);
$('explode').onclick=()=>setSpread(targetSpread>0?0:1);
$('reset').onclick=()=>viewer?.reset();
$('export').onclick=()=>{
  const mapping={schemaVersion:1,bookId:book.bookId,bookTitle:book.title,
    sourceSha256:book.sourceSha256,representation:book.representation,
    mappingStatus:book.mappingStatus,hardwareVerificationStatus:book.hardwareVerificationStatus,
    components:components.map(({terms,...component})=>component),
    chapters:book.chapters.map(c=>({id:c.id,title:c.title,href:c.href,
      sections:c.sections.map(({paragraphs,...s})=>s)}))};
  const url=URL.createObjectURL(new Blob([JSON.stringify(mapping,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=book.bookId+'-knowledge-map.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$('prompt').onclick=()=>{
  const c=components.find(c=>c.id===selected);
  const relatedSections=chapter.sections.filter(s=>related(s,c));
  const excerpts=[section,...relatedSections].filter((s,i,a)=>s&&a.findIndex(x=>x.id===s.id)===i).slice(0,2);
  $('prompt-output').value=`请依据以下书稿上下文回答，区分书稿事实、推论与待核验内容。三维模型为教学示意，不能当作具体型号拆解。\n\n书名：${book.title}\n章节：${chapter.title}\n组件：${c.name}\n类型：${$('variant').selectedOptions[0].text}\n书稿版本 SHA-256：${book.sourceSha256}\n\n${excerpts.map(s=>s.title+'\n来源：'+new URL(s.href,book.canonicalBase).href+'\n'+s.paragraphs.slice(0,3).join('\n')).join('\n\n')}\n\n问题：${$('question').value||'请解释该组件在本章中的作用，并提出一个可观察、可验证的问题。'}`;
  $('copy').hidden=false;
};
$('copy').onclick=async()=>{
  try{await navigator.clipboard.writeText($('prompt-output').value);$('copy').textContent='已复制';}
  catch{$('prompt-output').select();$('copy').textContent='请按 ⌘C 或 Ctrl+C 复制';}
};
try{
  const response=await fetch('./book.json');if(!response.ok)throw Error('书稿数据未载入');book=await response.json();
  document.title=book.title+' · SageWrite 三维知识探索';
  $('chapters').replaceChildren(...book.chapters.map((c,i)=>{
    const b=button('',()=>setChapter(i));
    const n=document.createElement('span');n.textContent=String(i).padStart(2,'0');
    b.append(n,document.createTextNode(c.title.replace(/^(序章|第.+?章)\s*/,'').split('：')[0]));return b;
  }));
  try{
    const [{createViewer},{buildSmartglassesModel}]=await Promise.all([import('./viewer.js'),import('./smartglasses-model.js')]);
    viewer=createViewer($('canvas'),{buildModel:buildSmartglassesModel,available,onSelect:select});
  }catch(error){
    $('canvas').textContent='三维视图暂不可用，仍可通过组件导航阅读知识。';
    console.warn('3D viewer unavailable:',error);
  }
  const initialVariant=['camera','display','ar'].includes(params.get('variant'))?params.get('variant'):'camera';
  variant=initialVariant;$('variant').value=variant;viewer?.setVariant(variant);
  let index=book.chapters.findIndex(c=>c.id===params.get('chapter'));if(index<0)index=0;
  // A section link can identify its chapter even if the chapter parameter is absent or stale.
  const requestedSection=params.get('section');
  const owner=book.chapters.findIndex(c=>c.sections.some(s=>s.id===requestedSection));if(owner>=0)index=owner;
  setChapter(index,requestedSection);
  const requestedComponent=params.get('component');
  if(available(variant).some(c=>c.id===requestedComponent))select(requestedComponent);
}catch(error){$('chapter-title').textContent='载入失败：'+error.message;}
