import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../src/explorer/vendor/three.module.js';
import {buildChapterOneModel} from '../src/explorer/chapter-one-model.js';

for (const variant of ['camera','display','ar']) {
  test(`${variant}: geometry is finite, selectable and separates internal components`,()=>{
    const group=new THREE.Group();const parts=buildChapterOneModel(THREE,group,variant);
    assert.ok(parts.length>70,'Detailed assembly should include lens, shell, hinges and module details');
    const ids=new Set(parts.map(p=>p.userData.id));
    assert.equal(ids.has('display'),variant!=='camera');
    assert.equal(ids.has('camera'),variant!=='display');
    assert.equal(ids.has('imu'),variant==='ar');
    assert.ok(parts.some(p=>p.userData.shell));
    assert.ok(parts.some(p=>p.userData.internal&&p.userData.id==='soc'));
    assert.ok(parts.some(p=>p.userData.internal&&p.userData.id==='battery'));
    for(const part of parts){
      assert.ok(part.userData.home.toArray().every(Number.isFinite));
      assert.ok(part.userData.offset.toArray().every(Number.isFinite));
      assert.ok(Array.from(part.geometry.attributes.position.array).every(Number.isFinite));
      part.geometry.dispose();part.material.dispose();
    }
  });
}
