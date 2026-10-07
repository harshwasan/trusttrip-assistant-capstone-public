import { z } from 'zod';
export class Problem extends Error { constructor(status,message){super(message);this.status=status;} }
const short=z.string().trim().min(1).max(120), count=z.number().int().min(0).max(30);
export const roomSchema=z.object({label:short,adults:count,elders:count,children:count,separate:z.boolean()}).strict();
export const preferencesSchema=z.object({origin:short.nullable(),destination:short.nullable(),startDate:z.string().max(10).nullable(),endDate:z.string().max(10).nullable(),budgetINR:z.number().int().positive().max(100000000).nullable(),travellerType:z.enum(['family','solo','couple','group']).nullable(),adults:count.nullable(),elders:count.nullable(),children:count.nullable(),rooms:z.array(roomSchema).max(30).nullable(),separateRoomAdults:count.nullable(),accessibility:z.array(z.string().trim().min(1).max(160)).max(12).nullable(),maxTravelMinutes:z.number().int().min(15).max(720).nullable(),interests:z.array(short).max(12).nullable(),persona:z.enum(['Meena Agarwal','Arjun Rao']).nullable()}).strict();
export const blankPreferences=()=>Object.fromEntries(Object.keys(preferencesSchema.shape).map(k=>[k,null]));
export function samePreferences(a,b){const left=preferencesSchema.safeParse(a),right=preferencesSchema.safeParse(b);return left.success&&right.success&&JSON.stringify(left.data)===JSON.stringify(right.data);}
export function dates(start,end){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(start||'')||!/^\d{4}-\d{2}-\d{2}$/.test(end||''))throw new Problem(422,'Use valid travel dates.');
 const a=new Date(start+'T00:00:00Z'),b=new Date(end+'T00:00:00Z');
 if(!Number.isFinite(+a)||!Number.isFinite(+b)||a.toISOString().slice(0,10)!==start||b.toISOString().slice(0,10)!==end||b<a||(+b-a)/86400000>30)throw new Problem(422,'Travel dates must be real, ordered and cover at most 31 days.');
 return Array.from({length:(+b-a)/86400000+1},(_,i)=>new Date(+a+i*86400000).toISOString().slice(0,10));
}
export function readiness(input){
 const parsed=preferencesSchema.safeParse(input);if(!parsed.success)return {ready:false,issues:['Some fields have an invalid format.']};
 const labels={origin:'an origin',destination:'a destination',startDate:'a start date',endDate:'an end date',budgetINR:'a total budget in INR',travellerType:'a traveller type',adults:'the adult count (excluding elders)',elders:'the elder count',children:'the child count',rooms:'room groups',separateRoomAdults:'the separate adult room count',accessibility:'accessibility needs, or leave the optional field blank for none',maxTravelMinutes:'a maximum uninterrupted travel stretch',interests:'interests, or leave the optional field blank for none',persona:'a planning priority'};
 const p=parsed.data,issues=Object.entries(p).filter(([,v])=>v===null).map(([k])=>`Please provide ${labels[k]}.`);
 if(p.startDate&&p.endDate)try{dates(p.startDate,p.endDate);}catch(e){issues.push(e.message);}
 if([p.adults,p.elders,p.children].every(v=>v!==null)){
  const total=p.adults+p.elders+p.children;
  if(total<1||total>30)issues.push('Party size must be between 1 and 30.');
  if(p.adults+p.elders<1)issues.push('At least one adult or elder must travel.');
  if(p.travellerType==='solo'&&total!==1)issues.push('Solo travel must contain exactly one traveller.');
  if(p.travellerType==='couple'&&(total!==2||p.children!==0))issues.push('A couple trip must contain two adults/elders.');
  if(p.rooms){for(const key of ['adults','elders','children'])if(p.rooms.reduce((n,r)=>n+r[key],0)!==p[key])issues.push(`Room allocation must count all ${key} exactly once.`);
   if(p.rooms.some(r=>r.adults+r.elders+r.children===0||r.adults+r.elders===0))issues.push('Each room group must include an adult or elder.');
   if(p.rooms.some(r=>r.separate&&(r.adults!==1||r.elders!==0||r.children!==0)))issues.push('Each separate adult room must contain exactly one adult.');
   if(p.separateRoomAdults!==null&&p.rooms.filter(r=>r.separate).length!==p.separateRoomAdults)issues.push('Separate adult room requests must match the separate-room count.');
  }
 }
 return {ready:issues.length===0,issues};
}
export const activities={arrival:'Allow time for arrival and rest; transport duration is unknown.',gentle:'Choose a gentle local activity after confirming step-free access and bathroom conditions.',interests:'Choose an activity matching your interests after checking current opening times and suitability.',breaks:'Plan food, water and bathroom breaks within your requested travel limit; stop locations need verification.',social:'Consider an optional, low-pressure social activity only after checking the organiser and cancellation policy.',rest:'Keep a flexible rest period for the group.',departure:'Allow time for departure after confirming the route and transport schedule.'};
export const planSchema=z.object({days:z.array(z.object({date:z.string(),activityIds:z.array(z.enum(Object.keys(activities))).min(1).max(5)}).strict()).min(1).max(31),hotelIds:z.array(z.string().max(80)).max(4)}).strict();
export const catalogueSchema=z.object({schemaVersion:z.literal(1),version:short,checkedAt:z.iso.date(),hotels:z.array(z.object({id:short,name:short,destination:short,evidence:z.array(z.object({topic:z.enum(['step-free-access','lift','bathroom','staff','social','other']),claim:z.string().min(1).max(500),label:z.enum(['Guest-verified','Hotel-claimed','Unverified']),substance:z.enum(['supportive','adverse','unknown']),sourceUrl:z.url().nullable(),sourceDate:z.iso.date().nullable(),checkedAt:z.iso.date()}).strict().superRefine((e,ctx)=>{if(e.label!=='Unverified'&&(!e.sourceUrl||!e.sourceDate))ctx.addIssue({code:'custom',message:'Evidence needs a source URL and date.'});if(e.label==='Unverified'&&e.substance!=='unknown')ctx.addIssue({code:'custom',message:'Unverified evidence must remain unknown.'});})),prices:z.array(z.object({component:short,unitINR:z.number().positive(),unit:short,sourceUrl:z.url(),sourceDate:z.iso.date(),checkedAt:z.iso.date()}).strict())}).strict())}).strict();
export function eligibleHotels(p,catalogue){const needsStepFree=p.accessibility.some(s=>/stairs|step.free|wheelchair|lift/i.test(s));return catalogue.hotels.filter(h=>h.destination.toLowerCase()===p.destination.toLowerCase()&&!h.evidence.some(e=>e.substance==='adverse'&&needsStepFree&&['step-free-access','lift'].includes(e.topic)));}
export function acceptPlan(raw,p,catalogue){
 const status=readiness(p);if(!status.ready)throw new Problem(422,status.issues.join(' '));
 const plan=planSchema.parse(raw),window=dates(p.startDate,p.endDate);
 if(plan.days.length!==window.length||plan.days.some((d,i)=>d.date!==window[i]))throw new Problem(422,'Generated dates did not match every travel date.');
 const allowed=eligibleHotels(p,catalogue);if(new Set(plan.hotelIds).size!==plan.hotelIds.length||plan.hotelIds.some(id=>!allowed.some(h=>h.id===id)))throw new Problem(422,'Generated property IDs are outside eligible catalogue coverage.');
 // Model output cannot contain free factual claims, prices, property names or evidence upgrades.
 return {catalogueVersion:catalogue.version,coverage:allowed.length?'limited':'no-properties',destination:p.destination,days:plan.days.map(d=>({date:d.date,activities:d.activityIds.map(id=>({id,text:activities[id],kind:'general-suggestion'}))})),stays:plan.hotelIds.map(id=>allowed.find(h=>h.id===id)),rooms:p.rooms,roomNotice:'Allocation requests only. Capacity, room placement, lift operation, availability and prices require confirmation; this is not a booking.',cost:{currency:'INR',total:null,withinBudget:null,basis:'No complete sourced transport, lodging, food and activity price components. Missing amounts are unknown, never zero.',nights:window.length-1,rooms:p.rooms.length,exclusions:['Transport','Lodging','Food','Activities','Taxes and fees']},travel:{maxUninterruptedMinutes:p.maxTravelMinutes,distance:null,duration:null,stops:[],medicalHelp:null},unresolved:['No verified journey distances, travel times, bathroom stops or nearby medical help are available.','Working lifts and clean bathrooms must be checked directly; amenities checkboxes are not evidence.','Check current transport, cancellation and issue-handling policies before booking.']};
}
export function publicTrip(trip){const {id,createdAt,preferences,plan,reviewStatus,approvedExplanation}=trip;return {id,createdAt,preferences,plan,reviewStatus,approvedExplanation:reviewStatus==='Approved'?approvedExplanation:null};}
export function resolvePersona(records,name){const matches=records.filter(r=>{const actual=String(r.fields?.['Persona Name']||'').trim();return actual===name||new RegExp('^'+name+'\\s*(?:[—–:,(]| -)').test(actual);});if(matches.length!==1)throw new Problem(409,'Persona lookup must match exactly one linked record.');return matches[0].id;}
export function checkOwner(actual,expected){if(actual!==expected)throw new Problem(404,'Trip not found.');}
export function evidenceLabel(e){if(!['Guest-verified','Hotel-claimed','Unverified'].includes(e.label))throw new Problem(422,'Invalid evidence label.');return `${e.label}: ${e.claim} (${e.substance})`;}
