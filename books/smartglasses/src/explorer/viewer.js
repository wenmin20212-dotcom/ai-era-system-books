import * as THREE from './vendor/three.module.js';

// The viewer owns interaction and rendering; model geometry is injected by the book.
export function createViewer(container, {buildModel, available, onSelect}) {
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.setAttribute('aria-label','智能眼镜三维教学模型，可拖动旋转；组件也可通过下方按钮选择');
  container.append(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(38,1,.1,100);
  scene.add(new THREE.HemisphereLight(0xffffff,0x869c79,3));
  const light=new THREE.DirectionalLight(0xffffff,4);
  light.position.set(3,8,5);scene.add(light);
  const group=new THREE.Group();scene.add(group);
  let meshes=[], angle=-.3, tilt=.5, distance=10, drag=null;
  let spread=0, targetSpread=0, selected='frame', relevant=new Set();
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const canvas=renderer.domElement;
  canvas.addEventListener('pointerdown',e=>{
    drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag)return;
    angle+=(e.clientX-drag.x)*.008;
    tilt=Math.max(-.5,Math.min(1.3,tilt+(e.clientY-drag.y)*.006));
    drag.x=e.clientX;drag.y=e.clientY;
  });
  canvas.addEventListener('pointerup',e=>{
    if(drag&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<5){
      const r=canvas.getBoundingClientRect();const ray=new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);
      const hit=ray.intersectObjects(meshes.filter(m=>m.visible))[0];
      if(hit)onSelect(hit.object.userData.id);
    }
    drag=null;
  });
  canvas.addEventListener('pointercancel',()=>drag=null);
  canvas.addEventListener('wheel',e=>{
    e.preventDefault();distance=Math.max(6,Math.min(17,distance+e.deltaY*.008));
  },{passive:false});
  const resize=new ResizeObserver(()=>{
    const {width,height}=container.getBoundingClientRect();
    renderer.setSize(width,height);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();
  });resize.observe(container);
  function highlight(){
    for(const m of meshes){
      m.material.opacity=(m.userData.baseOpacity??1)*(m.userData.id===selected?1:relevant.has(m.userData.id)?.85:.22);
      m.material.emissive.setHex(m.userData.id===selected?0x164d2a:0);
    }
  }
  renderer.setAnimationLoop(()=>{
    spread=reduceMotion.matches?targetSpread:spread+(targetSpread-spread)*.07;
    group.rotation.set(tilt,angle,0);
    for(const m of meshes)m.position.copy(m.userData.home).addScaledVector(m.userData.offset,spread);
    camera.position.set(0,1,distance);camera.lookAt(0,0,-.3);renderer.render(scene,camera);
  });
  return {
    setVariant(variant){
      for(const m of meshes){group.remove(m);m.geometry.dispose();m.material.dispose();}
      meshes=buildModel(THREE,group,variant,available);highlight();
    },
    setSpread(value){targetSpread=value;},
    select(id,ids){selected=id;relevant=new Set(ids);highlight();},
    reset(){angle=-.3;tilt=.5;distance=10;},
    dispose(){resize.disconnect();renderer.setAnimationLoop(null);for(const m of meshes){m.geometry.dispose();m.material.dispose();}renderer.dispose();}
  };
}
