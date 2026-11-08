const $=id=>document.getElementById(id);
const params=new URLSearchParams(location.search);
let studio,variant='camera',xray=false,exploded=false,config;
let selected='camera';const hotspotButtons=new Map();
const definitions={
  frame:{name:'镜框与镜腿',title:'镜架：佩戴结构，也是系统的空间',copy:'镜框支撑镜片，镜腿容纳部分电子模块。外形接近普通眼镜，并不意味着它们采用相同的配置。',source:'04',label:'镜架'},
  camera:{name:'摄像头',title:'摄像头：记录镜头朝向的世界',copy:'第一视角接近佩戴者的位置，但不等于人眼的视线，也不意味着系统知道你在注视哪里。',source:'05',label:'图像入口'},
  mic:{name:'麦克风',title:'麦克风：把声音带入系统',copy:'能采集语音不等于能够回答所有问题，语音交互还需要处理、软件与权限共同配合。',source:'05',label:'语音输入'},
  speaker:{name:'扬声器',title:'扬声器：耳边有声音，眼前未必有画面',copy:'开放式听音通过声音传递信息。它与显示是不同的输出方式，聆听效果还会受到环境与佩戴位置的影响。',source:'05',label:'声音输出'},
  display:{name:'显示光学',title:'显示光学：产生图像，再把光送入眼睛',copy:'微显示器与光学组件一起形成近眼显示。看见数字画面，并不代表系统已经理解房间或具有空间定位能力。',source:'06',label:'显示光学'},
  imu:{name:'运动与空间感知',title:'空间感知：数字标记为什么能留在桌边',copy:'运动与视觉信息、位置估计、标定和画面更新需要持续配合。单独一颗传感器不会自动带来完整的空间 AR。',source:'07',label:'运动感知'},
  soc:{name:'处理器与存储',title:'处理器：本地做什么，交给外部做什么',copy:'眼镜上的计算资源受到体积、电池与散热限制。手机和云端可能分担任务，具体分工依系统设计而定。',source:'08',label:'计算模块'},
  battery:{name:'电池与供电',title:'电池：轻巧外形背后的资源边界',copy:'把更多任务放在镜架里，也意味着供电、发热与重量的取舍。系统能否持续运行，要看整机与外部设备的协同。',source:'08',label:'供电模块'},
  antenna:{name:'无线连接',title:'连接：镜架之外，还有参与工作的系统',copy:'眼镜与手机连上，不等于在线服务已经可用。手机、互联网、账户和权限都可能影响任务是否完成。',source:'08',label:'无线连接'}
};
const capabilityNames={audio:'声音',camera:'摄像',display:'显示',spatial:'空间定位'};
const shapes={camera:'<circle cx="54" cy="58" r="5" fill="currentColor"/><circle cx="54" cy="58" r="2" fill="#182219"/>',display:'<path d="M69 53h26v20H69zm66 0h26v20h-26z" stroke="#d9b777" opacity=".6"/>',ar:'<circle cx="54" cy="58" r="4"/><circle cx="177" cy="58" r="4"/><path d="M69 53h26v20H69zm66 0h26v20h-26z" stroke="#d9b777" opacity=".6"/>'};
function miniGlasses(id){return `<svg viewBox="0 0 230 105" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M45 46l15-25 38 3m87 22-15-25-38 3" opacity=".45"/><path d="M48 48c15-6 44-6 57 0l-5 31c-11 7-33 7-43 0zm77 0c15-6 44-6 57 0l-9 31c-11 7-33 7-43 0z"/><path d="M105 53c6-4 14-4 20 0M47 48l-7-1m143 1 7-1"/>${shapes[id]}</svg>`;}
function selectComponent(id){
  const detail=definitions[id];if(!detail)return;
  selected=id;$('component-title').textContent=detail.title;$('component-copy').textContent=detail.copy;
  $('component-source').href='../ch01/'+detail.source+'.html';
  studio?.setSelection(id);
  for(const [key,b] of hotspotButtons)b.setAttribute('aria-pressed',String(key===id));
}
function setVariant(id){
  if(!config)return;
  const data=config.variants.find(v=>v.id===id);if(!data)return;
  variant=id;$('variant-title').textContent=data.name;$('variant-summary').textContent=data.summary;$('model-number').textContent=data.number;
  for(const button of document.querySelectorAll('[data-variant]'))button.setAttribute('aria-pressed',String(button.dataset.variant===id));
  studio?.setVariant(id);
  const desired=xray?'soc':id==='display'?'display':'camera';selectComponent(desired);
  const url=new URL(location.href);url.searchParams.set('variant',id);history.replaceState(null,'',url);
}
function projectHotspots(positions){
  for(const [id,b] of hotspotButtons){if(!positions[id])b.hidden=true;}
  const bounds=$('studio-canvas').getBoundingClientRect();
  for(const [id,p] of Object.entries(positions)){
    let b=hotspotButtons.get(id);
    if(!b){
      b=document.createElement('button');b.className='hotspot';b.type='button';
      b.setAttribute('aria-label','了解'+definitions[id].name);
      const dot=document.createElement('i');const label=document.createElement('span');label.textContent=definitions[id].label;b.append(dot,label);
      b.onclick=()=>selectComponent(id);hotspotButtons.set(id,b);$('hotspots').append(b);
    }
    b.hidden=!p.visible;
    b.style.left=Math.max(40,Math.min(bounds.width-65,p.x))+'px';
    b.style.top=Math.max(75,Math.min(bounds.height-100,p.y))+'px';
    b.setAttribute('aria-pressed',String(id===selected));
  }
}
function renderCards(){
  $('type-cards').replaceChildren(...config.variants.map(v=>{
    const b=document.createElement('button');b.type='button';b.className='type-card';b.dataset.variant=v.id;b.setAttribute('aria-pressed',String(v.id===variant));
    b.innerHTML=`<span class="card-top"><span>TYPE ${v.number}</span><b>↗</b></span>${miniGlasses(v.id)}<h3>${v.name}</h3><p class="tagline">${v.tagline}</p><p class="description">${v.description}</p><div class="capabilities">${Object.entries(v.capabilities).map(([key,present])=>`<span class="${present?'':'off'}"><i></i>${capabilityNames[key]}<span class="sr-only">：${present?'具备':'未配置'}</span></span>`).join('')}</div>`;
    b.onclick=()=>setVariant(v.id);return b;
  }));
  for(const b of document.querySelectorAll('.variant-switch button'))b.onclick=()=>setVariant(b.dataset.variant);
}
const scenarios={
  listen:{variant:'camera',category:'音频摄像组合',copy:'在支持消息播报并获得权限的条件下，手机与眼镜配合把信息送到耳边。此组合没有显示器。'},
  watch:{variant:'display',category:'近眼显示组合',copy:'在连接相应主机的教学场景中，光学组件把显示图像送到眼前。虚拟屏幕可见，不等于眼镜已经具备环境追踪。'},
  anchor:{variant:'ar',category:'空间 AR 教学组合',copy:'假设环境追踪有效，数字标记与桌边位置建立对应；移动后仍需持续更新。追踪失败时，位置关系可能不再可靠。'}
};
for(const b of document.querySelectorAll('button[data-scene]'))b.onclick=()=>{
  const scene=scenarios[b.dataset.scene];setVariant(scene.variant);
  $('scene-window').dataset.scene=b.dataset.scene;$('scene-category').textContent=scene.category;$('scene-copy').textContent=scene.copy;
  for(const tab of document.querySelectorAll('button[data-scene]'))if(tab.tagName==='BUTTON')tab.setAttribute('aria-pressed',String(tab===b));
};
$('xray').onclick=()=>{
  xray=!xray;$('xray').setAttribute('aria-pressed',String(xray));studio?.setXray(xray);
  $('stage-mode').textContent=xray?'组件透视':exploded?'分层观察':'整机观察';selectComponent(xray?'soc':variant==='display'?'display':'camera');
};
$('explode').onclick=()=>{
  exploded=!exploded;$('explode').setAttribute('aria-pressed',String(exploded));studio?.setExploded(exploded);
  $('stage-mode').textContent=exploded?'分层观察':xray?'组件透视':'整机观察';
};
$('reset').onclick=()=>studio?.reset();
$('network-toggle').onclick=()=>{
  const online=$('network-toggle').getAttribute('aria-checked')!=='true';
  $('network-toggle').setAttribute('aria-checked',String(online));$('network-label').textContent=online?'网络已连接':'互联网已断开';
  $('network-diagram').classList.toggle('offline',!online);
  $('network-result').textContent=online?'此示例的在线解释链路可用；结果仍需核验。':'此示例的云端解释暂不可用；本地功能是否可用，仍需按具体型号核对。';
};
function readingCards(sections){
  $('reading-grid').replaceChildren(...sections.map(s=>{
    const a=document.createElement('a');a.className='reading-card';a.href='../'+s.href;
    const number=document.createElement('span');number.textContent=s.id;
    const title=document.createElement('h3');title.textContent=s.title.replace(/^\d+\.\d+\s*/, '');
    const arrow=document.createElement('b');arrow.textContent='↗';a.append(number,title,arrow);return a;
  }));
}
try{
  const responses=await Promise.all([fetch('./chapter-one-data.json',{cache:'no-cache'}),fetch('./book.json',{cache:'no-cache'})]);
  if(responses.some(r=>!r.ok))throw Error('学习内容未能加载');
  const [data,book]=await Promise.all(responses.map(r=>r.json()));config=data;renderCards();readingCards(book.chapters.find(c=>c.id==='ch1').sections);
  try{
    const {createStudio}=await import('./chapter-one-viewer.js?v=1.0');
    studio=createStudio($('studio-canvas'),{onSelect:selectComponent,onProject:projectHotspots,onFailure:()=>{
      $('stage-mode').textContent='三维视图暂不可用；仍可使用下方分类与阅读入口';
    }});
  }catch(error){
    $('studio-canvas').innerHTML='<div class="model-fallback">'+miniGlasses('camera')+'<p>三维视图暂不可用。下方类型比较、场景和原文仍可使用。</p></div>';
    console.warn('Chapter one studio unavailable',error);
    $('xray').disabled=true;$('explode').disabled=true;$('reset').disabled=true;
  }
  const fromSection={'1.3':'display','1.4':'ar'}[params.get('section')];
  const desired=params.get('variant')||fromSection||'camera';
  setVariant(config.variants.some(v=>v.id===desired)?desired:'camera');
}catch(error){
  $('stage-mode').textContent=error.message+'，可返回书中继续阅读';
}
