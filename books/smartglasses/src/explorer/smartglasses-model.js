export function buildSmartglassesModel(THREE, group, variant, available) {
 const meshes=[];
 function part(id,geometry,pos,color,offset=[0,1,0],rotation){const m=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,metalness:.35,roughness:.35,transparent:true}));m.userData={id,home:new THREE.Vector3(...pos),offset:new THREE.Vector3(...offset)};m.position.copy(m.userData.home);if(rotation)m.rotation.set(...rotation);m.visible=available(variant).some(c=>c.id===id);group.add(m);meshes.push(m);return m;}
 const box=(id,size,pos,color,offset)=>part(id,new THREE.BoxGeometry(...size),pos,color,offset);
 const lensShape=new THREE.Shape();lensShape.moveTo(-.9,.4);lensShape.quadraticCurveTo(-1,.68,-.7,.7);lensShape.lineTo(.7,.7);lensShape.quadraticCurveTo(1,.65,.92,.3);lensShape.lineTo(.78,-.38);lensShape.quadraticCurveTo(.7,-.65,.4,-.64);lensShape.lineTo(-.5,-.64);lensShape.quadraticCurveTo(-.9,-.6,-.9,-.2);lensShape.closePath();
 for(const side of [-1,1]){
  const x=side*1.14;const outline=new THREE.Shape(lensShape.getPoints());outline.holes.push(new THREE.Path(lensShape.getPoints().map(p=>new THREE.Vector2(p.x*.84,p.y*.79))));
  part('frame',new THREE.ExtrudeGeometry(outline,{depth:.18,bevelEnabled:true,bevelSize:.04,bevelThickness:.04,bevelSegments:3,steps:1}),[x,0,.9],0x25372f,[side*.15,-.4,0]);
  const lens=part('frame',new THREE.ShapeGeometry(lensShape),[x,0,.98],0xa8bcae,[side*.15,-.4,.05]);lens.material.side=THREE.DoubleSide;lens.userData.baseOpacity=.18;lens.material.depthWrite=false;
  box('frame',[.18,.28,2.9],[side*2.12,.35,-.55],0x26372e,[side*.4,-.4,0]);
  box('speaker',[.23,.13,.6],[side*2.12,.50,-1.0],0x7f8c77,[side*1.0,.8,-.2]);
  part('mic',new THREE.SphereGeometry(.065,16,12),[side*1.92,.52,1.04],0x343a30,[side*.7,.5,.7]);
  if(variant!=='camera'){
   const optic=box('display',[1.38,.84,.045],[x,.05,1.08],0x80d7bb,[side*.25,.7,1.1]);
   optic.userData.baseOpacity=.28;optic.material.depthWrite=false;
   box('display',[.25,.22,.38],[side*1.97,.47,.78],0x70a89a,[side*.5,1.1,.65]);
  }
 }
 box('frame',[.65,.14,.2],[0,.34,.95],0x25372f,[0,-.4,0]);
 part('camera',new THREE.CylinderGeometry(.16,.16,.23,24),[-1.91,.33,1.15],0x35576b,[-.7,.6,1.3],[Math.PI/2,0,0]);
 part('camera',new THREE.CylinderGeometry(.095,.095,.24,24),[-1.91,.33,1.17],0x132c40,[-.7,.6,1.3],[Math.PI/2,0,0]);
 box('soc',[.36,.1,.66],[-2.13,.52,.05],0x47846b,[-1.3,1.3,0]);
 box('battery',[.28,.18,1.15],[2.13,.55,-.38],0xb5a371,[1.35,1.0,-.3]);
 box('antenna',[.06,.06,.9],[2.17,.57,-1.48],0xc49955,[1.2,.5,-.8]);
 box('imu',[.25,.13,.25],[0,.50,.96],0x7884ac,[0,1.6,.5]);
 return meshes;
}
