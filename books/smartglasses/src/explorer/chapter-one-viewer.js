import * as T from './vendor/three.module.js';
import {buildChapterOneModel} from './chapter-one-model.js?v=1.0';

export function createStudio(container,{onSelect,onProject,onFailure}){
  const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x101512,0);
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.28;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-label','智能眼镜精细教学模型，可拖动旋转，通过标记选择组件');
  container.append(renderer.domElement);
  const scene=new T.Scene();const camera=new T.PerspectiveCamera(34,1,.1,100);
  const model=new T.Group();scene.add(model);
  scene.add(new T.HemisphereLight(0xf0f0d3,0x26372c,2.2));
  const key=new T.DirectionalLight(0xffeed3,4.5);key.position.set(-3,7,6);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.bias=-.001;scene.add(key);
  const fill=new T.DirectionalLight(0xa7c7ba,2.5);fill.position.set(6,2,0);scene.add(fill);
  const rim=new T.DirectionalLight(0xe8c78c,4);rim.position.set(-2,3,-5);scene.add(rim);
  // Procedural studio reflections; no external textures or model downloads.
  const room=new T.Scene();room.background=new T.Color(0x353c31);
  for(const [x,y,z,w,h,intensity] of [[0,5,0,8,4,5],[-5,1,0,2,7,3],[5,2,-3,3,6,4],[0,1,6,7,2,2]]){
    const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color().setScalar(intensity),side:T.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);room.add(p);
  }
  const pmrem=new T.PMREMGenerator(renderer);const environment=pmrem.fromScene(room,.1);scene.environment=environment.texture;
  room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});pmrem.dispose();
  const ground=new T.Mesh(new T.PlaneGeometry(35,35),new T.ShadowMaterial({opacity:.20}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.65;ground.receiveShadow=true;scene.add(ground);
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  let objects=[],variant='camera',selected='camera',xray=false,exploded=false,spread=0;
  let angle=-.34,tilt=.33,distance=12.8,drag=null,auto=true,lastTime=0,disposed=false;
  let active=true;
  const visibility=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;},{rootMargin:'150px'});visibility.observe(container);
  let width=1,height=1;const ray=new T.Raycaster();const canvas=renderer.domElement;
  const opacity=new Map();
  function clear(){for(const m of objects){model.remove(m);m.geometry.dispose();m.material.dispose();}objects=[];opacity.clear();}
  function setVariant(value){variant=value;clear();objects=buildChapterOneModel(T,model,value);for(const m of objects)opacity.set(m,m.userData.internal?0:m.userData.baseOpacity);}
  function setSelection(id){selected=id;}
  const resize=new ResizeObserver(()=>{
    const bounds=container.getBoundingClientRect();width=bounds.width;height=bounds.height;
    renderer.setSize(width,height);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();
  });resize.observe(container);
  canvas.addEventListener('pointerdown',e=>{auto=false;drag={x:e.clientX,y:e.clientY,firstX:e.clientX,firstY:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;angle+=(e.clientX-drag.x)*.008;tilt=Math.max(-.5,Math.min(1.1,tilt+(e.clientY-drag.y)*.005));drag.x=e.clientX;drag.y=e.clientY;});
  canvas.addEventListener('pointerup',e=>{
    if(drag&&Math.hypot(e.clientX-drag.firstX,e.clientY-drag.firstY)<5){
      const r=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
      const hit=ray.intersectObjects(objects.filter(m=>m.visible&&m.material.opacity>.2))[0];if(hit)onSelect(hit.object.userData.id);
    }drag=null;
  });
  canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();auto=false;distance=Math.max(9,Math.min(19,distance+e.deltaY*.015));},{passive:false});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();onFailure?.();});
  const labels={camera:new T.Vector3(-2.22,.23,1.67),speaker:new T.Vector3(2.56,.28,-1.1),display:new T.Vector3(-1.74,.4,1.45),imu:new T.Vector3(0,.53,1.2),soc:new T.Vector3(-2.56,.47,-.1),battery:new T.Vector3(2.56,.45,-.4),mic:new T.Vector3(2.23,.51,1.53)};
  let lastProjection=0;
  renderer.setAnimationLoop(time=>{
    if(disposed)return;
    if(!active){lastTime=time;return;}
    const dt=Math.min((time-lastTime)/1000||.016,.06);lastTime=time;
    if(auto&&!reduceMotion.matches)angle+=dt*.018;
    spread=reduceMotion.matches?(exploded?1:0):T.MathUtils.damp(spread,exploded?1:0,6,dt);
    model.rotation.set(tilt,angle,-.025);
    model.position.y=reduceMotion.matches?0:Math.sin(time*.0007)*.045;
    for(const m of objects){
      m.position.copy(m.userData.home).addScaledVector(m.userData.offset,spread);
      let target=m.userData.baseOpacity;
      if(m.userData.internal)target=(xray||exploded)?m.userData.baseOpacity:0;
      if(xray&&m.userData.shell)target=.12;
      if(xray&&m.userData.lens)target=.14;
      const value=reduceMotion.matches?target:T.MathUtils.damp(opacity.get(m)??0,target,7,dt);opacity.set(m,value);
      m.material.opacity=value;m.visible=value>.015;
      m.material.depthWrite=value>.90;
      m.material.emissive.setHex(m.userData.id===selected&&!m.userData.shell?0x1d2113:0);
      m.material.emissiveIntensity=m.userData.id===selected?.22:0;
    }
    camera.position.set(0,.45,distance*(camera.aspect<1?1.15:1));camera.lookAt(0,0,-.45);
    renderer.render(scene,camera);
    if(time-lastProjection>35){
      lastProjection=time;model.updateMatrixWorld();const positions={};
      const ids=xray||exploded?['soc','battery',...(variant==='ar'?['imu']:[])]:variant==='camera'?['camera','speaker']:variant==='display'?['display','speaker']:['camera','display','imu'];
      for(const id of ids){
        const point=labels[id].clone();if(exploded){const o=objects.find(o=>o.userData.id===id);if(o)point.addScaledVector(o.userData.offset,spread);}
        point.applyMatrix4(model.matrixWorld).project(camera);
        positions[id]={x:(point.x*.5+.5)*width,y:(-.5*point.y+.5)*height,visible:point.z<1};
      }
      onProject(positions);
    }
  });
  setVariant('camera');
  return {setVariant,setSelection,setXray(value){xray=value;},setExploded(value){exploded=value;},reset(){angle=-.34;tilt=.33;distance=12.8;auto=true;},dispose(){disposed=true;visibility.disconnect();resize.disconnect();renderer.setAnimationLoop(null);clear();environment.dispose();ground.geometry.dispose();ground.material.dispose();renderer.dispose();}};
}
