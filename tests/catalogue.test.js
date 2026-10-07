import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {catalogueSchema,eligibleActivities,activityFit} from '../server/catalogue.js';
import {readiness,acceptPlan,dates} from '../server/domain.js';

const catalogue=catalogueSchema.parse(JSON.parse(await readFile(new URL('../catalogue/catalogue.json',import.meta.url),'utf8')));
const p={origin:'Jaipur',destination:'Shimla',startDate:'2026-12-01',endDate:'2026-12-03',budgetINR:100000,travellerType:'family',adults:2,elders:1,children:1,rooms:[{label:'Family',adults:2,elders:0,children:1,separate:false},{label:'Elder',adults:0,elders:1,children:0,separate:false}],separateRoomAdults:0,accessibility:['Cannot use stairs'],maxTravelMinutes:90,interests:['Nature'],persona:'Meena Agarwal',activityMix:'nature',allowExcursions:false};
const raw={days:dates(p.startDate,p.endDate).map(date=>({date,activityIds:['rest']})),hotelIds:[catalogue.hotels[0].id]};
test('researched seed has sourced identities and no invented guest verification or prices',()=>{
 const ids=[...catalogue.hotels,...catalogue.activities].map(x=>x.id);assert.equal(new Set(ids).size,ids.length);
 for(const d of ['Shimla','Goa','Udaipur','Kochi','Tokyo','Singapore','Kathmandu']){
  assert.ok(catalogue.hotels.some(h=>h.destination===d),`${d} has at least one sourced hotel`);
  assert.ok(catalogue.activities.filter(a=>a.destination===d).length>=5,`${d} has at least five sourced places`);
 }
 for(const x of [...catalogue.hotels,...catalogue.activities])assert.ok(x.id.startsWith(x.destination.toLowerCase()+'_'));
 for(const h of catalogue.hotels){assert.match(h.sourceUrl,/^https:\/\//);assert.equal(h.prices.length,0);assert.ok(h.evidence.every(e=>e.label!=='Guest-verified'));}
 for(const a of catalogue.activities){assert.match(a.sourceUrl,/^https:\/\//);assert.equal(a.priceINR,null);assert.equal(a.access.status,'unknown');}
});
test('family must choose a mix and custom needs actual interests',()=>{
 assert.equal(readiness({...p,activityMix:null}).ready,false);
 assert.equal(readiness({...p,activityMix:'custom',interests:[]}).ready,false);
 assert.equal(readiness(p).ready,true);
});
test('excursions require explicit consent and other destinations are not substituted',()=>{
 assert.ok(eligibleActivities(p,catalogue).every(a=>a.setting==='central'));
 assert.ok(eligibleActivities({...p,allowExcursions:null},catalogue).every(a=>a.setting==='central'));
 assert.deepEqual(eligibleActivities({...p,destination:'Reykjavik',allowExcursions:true},catalogue),[]);
 assert.ok(eligibleActivities({...p,destination:'Tokyo',allowExcursions:true},catalogue).every(a=>a.destination==='Tokyo'));
});
test('known uphill and strenuous walking is excluded for limited mobility even with excursion consent',()=>{
 const ids=eligibleActivities({...p,allowExcursions:true},catalogue).map(a=>a.id);
 assert.ok(ids.includes('shimla_craignano_nature_park'));
 assert.ok(!ids.includes('shimla_naldehra'));assert.ok(!ids.includes('shimla_shali_tibba_temple'));
 assert.ok(eligibleActivities({...p,allowExcursions:true,accessibility:[]},catalogue).some(a=>a.id==='shimla_shali_tibba_temple'));
});
test('model cannot bypass excursion or physical restriction filters with IDs',()=>{
 for(const id of ['shimla_craignano_nature_park','shimla_shali_tibba_temple','fake-place']){
  const plan=structuredClone(raw);plan.days[0].activityIds=[id];assert.throws(()=>acceptPlan(plan,p,catalogue),/outside eligible/);
 }
});
test('named suggestions preserve exact catalogue facts and unknowns, with explicit family-fit context',()=>{
 const plan=structuredClone(raw);plan.days[1].activityIds=['shimla_ridge','breaks'];
 const accepted=acceptPlan(plan,p,catalogue),a=accepted.days[1].activities[0];
 assert.equal(a.kind,'catalogue-place');assert.equal(a.name,'The Ridge');assert.equal(a.access.status,'unknown');
 assert.match(a.suitability,/Conditional/);assert.ok(a.sourceUrl);assert.ok(a.fit.reason);assert.equal(accepted.cost.withinBudget,null);
 assert.equal(accepted.days[1].practicalPlan.length,2);assert.equal(accepted.rooms.length,2);
});
test('duplicates and overloaded named-outing days fail acceptance',()=>{
 const repeated=structuredClone(raw);repeated.days[0].activityIds=['shimla_ridge'];repeated.days[1].activityIds=['shimla_ridge'];assert.throws(()=>acceptPlan(repeated,p,catalogue),/repeated/);
 const crowded=structuredClone(raw);crowded.days[0].activityIds=['shimla_ridge','shimla_gaiety_theatre','shimla_army_heritage_museum'];assert.throws(()=>acceptPlan(crowded,{...p,allowExcursions:true},catalogue),/two named/);
});
test('model factual prose and evidence upgrades stay outside the plan schema',()=>{
 const invented=structuredClone(raw);invented.days[0].activities=[{name:'Made-up clinic',stepFree:true}];assert.throws(()=>acceptPlan(invented,p,catalogue));
});
test('interest fit never increases for popularity or higher prices',()=>{
 const a=catalogue.activities[0],before=activityFit(a,p);
 assert.deepEqual(activityFit({...a,reviewCount:99999,popularity:999,priceINR:99999},p),before);
});
test('undated hotel statement keeps source date null, but undated guest verification is invalid',()=>{
 assert.equal(catalogue.hotels[0].evidence[0].sourceDate,null);
 const changed=structuredClone(catalogue);changed.hotels[0].evidence[0].label='Guest-verified';assert.equal(catalogueSchema.safeParse(changed).success,false);
});

test('explanation payload strips location-bearing catalogue IDs and free text',async()=>{const {explanationContext}=await import('../server/ai.js');const plan=structuredClone(raw);plan.days[0].activityIds=['shimla_ridge','rest'];const context=explanationContext({preferences:p,plan:acceptPlan(plan,p,catalogue)});const text=JSON.stringify(context);assert.ok(!text.includes('shimla'));assert.ok(!text.includes('Shimla'));assert.ok(!text.includes('Jaipur'));assert.ok(!text.includes('Cannot use stairs'));assert.deepEqual(context.activityKinds[0],['catalogue-place','rest']);});
