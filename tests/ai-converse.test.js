import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcileConversation} from '../server/ai.js';

const rooms=[
 {label:'Elders',adults:0,elders:2,children:0,separate:false},
 {label:'Family 1',adults:2,elders:0,children:2,separate:false},
 {label:'Family 2',adults:2,elders:0,children:2,separate:false},
 {label:'Solo adult',adults:1,elders:0,children:0,separate:true}
];
const previous={adults:5,elders:2,children:4,rooms};

test('a party correction asks for room reconciliation and rejects invalid separate-room flags',()=>{
 const model={reply:'What activity mix would you like?',preferences:{...previous,children:3,rooms:rooms.map((room,index)=>({
  ...room,children:index===2?1:room.children,separate:true
 }))}};
 const output=reconcileConversation(previous,model);
 assert.equal(output.preferences.children,3);
 assert.deepEqual(output.preferences.rooms.map(room=>room.children),[0,2,2,0]);
 assert.deepEqual(output.preferences.rooms.map(room=>room.separate),[false,false,false,true]);
 assert.match(output.reply,/How should the room groups now be allocated/);
 assert.doesNotMatch(output.reply,/working lift|INR 10000/i);
});

test('a follow-up room allocation is retained while invalid separate flags are cleared',()=>{
 const corrected=rooms.map((room,index)=>({...room,children:index===2?1:room.children,separate:true}));
 const output=reconcileConversation({...previous,children:3},{reply:'The room groups are noted.',preferences:{...previous,children:3,rooms:corrected}});
 assert.deepEqual(output.preferences.rooms.map(room=>room.children),[0,2,1,0]);
 assert.deepEqual(output.preferences.rooms.map(room=>room.separate),[false,false,false,true]);
 assert.equal(output.reply,'The room groups are noted.');
});
