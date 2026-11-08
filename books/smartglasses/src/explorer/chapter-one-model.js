// Original teaching geometry. Positions, materials and part divisions are illustrative.
export function buildChapterOneModel(T, group, variant) {
  const objects=[];
  const colors=variant==='display'?{shell:0xb9bcb0,metal:0x929b8c,lens:0x78948a}:variant==='ar'?{shell:0x344437,metal:0x8a977a,lens:0x708a78}:{shell:0x232d25,metal:0xa8ac8b,lens:0x7c8260};
  const shell={color:colors.shell,metalness:.25,roughness:.28,clearcoat:.9,clearcoatRoughness:.2};
  const metal={color:colors.metal,metalness:.8,roughness:.27};
  const rubber={color:0x171f18,metalness:.05,roughness:.75};
  function part(id,geo,pos,material,offset=[0,0,0],options={}){
    const m=new T.Mesh(geo,new T.MeshPhysicalMaterial({...material,transparent:true}));
    m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;
    m.userData={id,home:new T.Vector3(...pos),offset:new T.Vector3(...offset),baseOpacity:material.opacity??1,...options};
    group.add(m);objects.push(m);return m;
  }
  function roundedBox(w,h,d,r=.05){
    const shape=new T.Shape();const x=-w/2,y=-h/2;
    shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);
    shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);
    shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
    const g=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:8});g.translate(0,0,-d/2);return g;
  }
  const box=(id,size,pos,mat,offset,options)=>part(id,roundedBox(...size,Math.min(size[0],size[1])*.22),pos,mat,offset,options);
  function tube(id,points,r,mat,offset,options){return part(id,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,10,false),[0,0,0],mat,offset,options);}
  function cylinder(id,r,depth,pos,mat,offset,options){const m=part(id,new T.CylinderGeometry(r,r,depth,40),pos,mat,offset,options);m.rotation.x=Math.PI/2;return m;}
  function lensPath(scale=1){
    const shape=new T.Shape();
    shape.moveTo(-1.08*scale,.50*scale);
    shape.bezierCurveTo(-1.16*scale,.72*scale,-.92*scale,.81*scale,-.53*scale,.81*scale);
    shape.bezierCurveTo(.12*scale,.83*scale,.65*scale,.77*scale,1.02*scale,.61*scale);
    shape.bezierCurveTo(1.12*scale,.56*scale,1.11*scale,.40*scale,1.06*scale,.14*scale);
    shape.lineTo(.92*scale,-.47*scale);
    shape.bezierCurveTo(.84*scale,-.76*scale,.55*scale,-.80*scale,.17*scale,-.80*scale);
    shape.bezierCurveTo(-.39*scale,-.79*scale,-.87*scale,-.73*scale,-1.01*scale,-.41*scale);
    shape.bezierCurveTo(-1.07*scale,-.22*scale,-1.12*scale,.27*scale,-1.08*scale,.50*scale);
    return shape;
  }
  for(const side of [-1,1]){
    const center=side*1.34;
    const rim=lensPath(1);const hole=new T.Path(lensPath(.88).getPoints(32).reverse());rim.holes.push(hole);
    part('frame',new T.ExtrudeGeometry(rim,{depth:variant==='ar'?.17:.13,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:3,curveSegments:32}),[center,0,1.35],shell,[side*.13,-.05,.35],{shell:true});
    const lens=part('frame',new T.ExtrudeGeometry(lensPath(.88),{depth:.022,bevelEnabled:true,bevelSize:.01,bevelThickness:.01,bevelSegments:2,curveSegments:32}),[center,0,1.37],{color:colors.lens,metalness:.12,roughness:.13,transmission:.32,thickness:.08,ior:1.48,opacity:variant==='camera'?.69:.48,clearcoat:1,side:T.DoubleSide},[side*.13,-.05,.63],{lens:true});
    lens.material.depthWrite=false;
    // Curved temple arms, hinge plates and ear tips.
    box('frame',[.24,.32,.44],[side*2.53,.40,1.14],shell,[side*.25,.10,0],{shell:true});
    const hinge=box('frame',[.04,.22,.30],[side*2.66,.39,1.17],metal,[side*.25,.10,0]);hinge.rotation.y=side*.1;
    box('frame',[.27,variant==='ar'?.42:.35,2.80],[side*2.56,.33,-.36],shell,[side*.68,.05,-.12],{shell:true});
    tube('frame',[[side*2.56,.33,-1.75],[side*2.54,.25,-2.22],[side*2.43,.08,-2.77],[side*2.29,-.14,-3.1]],.125,rubber,[side*.68,.05,-.12],{shell:true});
    box('frame',[.28,.045,2.65],[side*2.56,.51,-.35],{color:colors.metal,metalness:.75,roughness:.37},[side*.68,.05,-.12],{shell:true});
    for(let i=0;i<2;i++){
      const screw=cylinder('frame',.038,.018,[side*(2.34+i*.15),.53,1.53],metal,[side*.13,-.05,.35]);
      const slot=box('frame',[.037,.007,.004],[side*(2.34+i*.15),.53,1.543],rubber,[side*.13,-.05,.35]);slot.rotation.z=.4;
    }
    const nose=part('frame',new T.SphereGeometry(.1,16,12),[side*.39,-.18,1.13],{color:0x9aa18a,roughness:.6,opacity:.55},[side*.1,0,.1]);nose.scale.set(.65,1.6,.7);
    for(let i=0;i<7;i++){
      const vent=part('speaker',new T.SphereGeometry(.022,10,8),[side*2.708,.28,-.88-i*.075],rubber,[side*.80,-.35,-.1]);vent.scale.z=1.5;
    }
    box('speaker',[.10,.19,.64],[side*2.52,.32,-1.12],{color:0x4b5743,metalness:.65,roughness:.45},[side*.8,-.35,-.1],{internal:true});
    cylinder('mic',.027,.012,[side*2.23,.51,1.53],rubber,[side*.25,.45,.6]);
  }
  tube('frame',[[-.34,.37,1.40],[-.18,.48,1.39],[0,.51,1.36],[.18,.48,1.39],[.34,.37,1.40]],.085,shell,[0,0,.35],{shell:true});
  // Left temple PCB, copper pads, processor package and passives.
  const pcbOffset=[-.95,.70,-.05];
  box('soc',[.23,.11,1.70],[-2.56,.37,-.22],{color:0x284e3b,metalness:.28,roughness:.60},pcbOffset,{internal:true});
  box('soc',[.18,.06,.38],[-2.56,.46,-.05],{color:0x151c18,metalness:.2,roughness:.50},pcbOffset,{internal:true});
  for(let i=0;i<8;i++)for(const side of [-1,1]){
    box('soc',[.035,.012,.025],[-2.56+side*.103,.45,-.20+i*.045],{color:0xc0af78,metalness:.8,roughness:.3},pcbOffset,{internal:true});
  }
  for(let i=0;i<4;i++)box('soc',[.09,.05,.09],[-2.56,.45,-.65+i*.13],{color:i%2?0xb0a781:0x292e26,metalness:.4,roughness:.5},pcbOffset,{internal:true});
  const powerOffset=[.95,.65,-.15];
  box('battery',[.205,.235,1.60],[2.56,.34,-.40],{color:0xc1c3ac,metalness:.65,roughness:.36},powerOffset,{internal:true});
  box('battery',[.21,.025,.20],[2.56,.47,-.40],{color:0x5d6950,roughness:.5},powerOffset,{internal:true});
  for(let i=0;i<3;i++)box('battery',[.15,.005,.016],[2.56,.49,-.55+i*.15],{color:0x77836a,roughness:.5},powerOffset,{internal:true});
  tube('antenna',[[2.57,.49,-1.32],[2.57,.49,-1.48],[2.52,.49,-1.48],[2.52,.49,-1.67],[2.60,.49,-1.67],[2.60,.49,-1.82]],.013,{color:0xbda375,metalness:.85,roughness:.3},[.8,.4,-.5],{internal:true});
  if(variant==='camera'||variant==='ar'){
    const locations=variant==='ar'?[-2.22,2.22]:[-2.22];
    for(const x of locations){
      const offset=[Math.sign(x)*.32,.4,.80];
      cylinder('camera',.16,.08,[x,.23,1.53],{color:0x111a17,metalness:.5,roughness:.3},offset);
      cylinder('camera',.124,.014,[x,.23,1.58],{color:0x86927e,metalness:.9,roughness:.25},offset);
      cylinder('camera',.104,.018,[x,.23,1.59],{color:0x18292d,metalness:.5,roughness:.08,clearcoat:1},offset);
      cylinder('camera',.058,.020,[x,.23,1.605],{color:0x223b43,metalness:.65,roughness:.06,clearcoat:1},offset);
      cylinder('camera',.024,.021,[x,.23,1.61],{color:0x0a1419,roughness:.1},offset);
      cylinder('camera',.019,.005,[x-.035,.27,1.625],{color:0x92b8b3,metalness:.8,roughness:.1},offset);
    }
    cylinder('camera',.024,.008,[-1.93,.22,1.52],{color:0xe3bb79,emissive:0x7c4a17,emissiveIntensity:.4,roughness:.3},[-.32,.4,.8]);
  }
  if(variant==='display'||variant==='ar'){
    for(const side of [-1,1]){
      const offset=[side*.35,.85,.7];
      box('display',[.18,.21,.40],[side*2.32,.44,1.15],{color:0x6a877b,metalness:.6,roughness:.25},offset,{internal:true});
      const optic=box('display',[.33,.28,.006],[side*1.74,.38,1.43],{color:0x86c5ac,metalness:.3,roughness:.1,opacity:.30,emissive:0x244f3c,emissiveIntensity:.25},[side*.1,.15,.58],{optic:true});optic.material.depthWrite=false;
      for(let i=0;i<9;i++)box('display',[.27,.003,.005],[side*1.74,.28+i*.025,1.44],{color:0xabcdbc,metalness:.45,roughness:.2,opacity:.40},[side*.1,.15,.58],{optic:true});
      tube('display',[[side*2.27,.43,1.42],[side*2.10,.43,1.43],[side*1.86,.39,1.44]],.009,{color:0x9bc4ab,emissive:0x4c9771,emissiveIntensity:.3,opacity:.5},[side*.1,.15,.58],{optic:true});
    }
  }
  if(variant==='ar'){
    box('imu',[.28,.08,.22],[0,.50,1.17],{color:0x57654e,metalness:.5,roughness:.4},[0,1.0,.15],{internal:true});
    for(const x of [-.14,.14])cylinder('imu',.025,.014,[x,.50,1.43],{color:0x181e18,roughness:.2},[0,1.0,.15]);
  }
  return objects;
}
