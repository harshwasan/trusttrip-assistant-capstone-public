import {z} from 'zod';

const short=z.string().trim().min(1).max(160);
const sourceUrl=z.url().refine(value=>/^https?:\/\//.test(value),'Use an HTTP(S) source');
const datedSource={sourceUrl,sourceDate:z.iso.date().nullable(),checkedAt:z.iso.date()};
const evidence=z.object({
 topic:z.enum(['step-free-access','lift','bathroom','staff','social','other']),
 claim:z.string().min(1).max(500),label:z.enum(['Guest-verified','Hotel-claimed','Unverified']),
 substance:z.enum(['supportive','adverse','unknown']),sourceUrl:sourceUrl.nullable(),
 sourceDate:z.iso.date().nullable(),checkedAt:z.iso.date()
}).strict().superRefine((e,ctx)=>{
 if(e.label!=='Unverified'&&!e.sourceUrl)ctx.addIssue({code:'custom',message:'A labelled claim needs a source URL.'});
 if(e.label==='Guest-verified'&&!e.sourceDate)ctx.addIssue({code:'custom',message:'Guest evidence needs its actual report date.'});
 if(e.label==='Unverified'&&e.substance!=='unknown')ctx.addIssue({code:'custom',message:'Unverified evidence must remain unknown.'});
});
const hotel=z.object({id:short,name:short,destination:short,sourceUrl:sourceUrl.optional(),sourceDate:z.iso.date().nullable().optional(),checkedAt:z.iso.date().optional(),evidence:z.array(evidence),prices:z.array(z.object({component:short,unitINR:z.number().positive(),unit:short,sourceUrl,sourceDate:z.iso.date(),checkedAt:z.iso.date()}).strict())}).strict();
const activity=z.object({
 id:short,name:short,destination:short,area:short,description:z.string().min(1).max(500),
 interestTags:z.array(short).min(1).max(8),setting:z.enum(['central','excursion']),...datedSource,
 access:z.object({status:z.enum(['unknown','step-free','stairs-required']),details:z.string().max(500)}).strict(),
 restrictions:z.array(z.enum(['strenuous-walk','steep-walk','uphill-walk'])).default([]),
 durationMinutes:z.number().positive().nullable(),walkingMinutes:z.number().nonnegative().nullable(),
 priceINR:z.number().nonnegative().nullable(),bathrooms:z.literal('Unverified'),food:z.literal('Unverified'),
 familyNotes:z.string().max(500),limitations:z.array(z.string().max(500)).max(12)
}).strict();
export const catalogueSchema=z.object({schemaVersion:z.literal(1),version:short,checkedAt:z.iso.date(),hotels:z.array(hotel),activities:z.array(activity).default([])}).strict().superRefine((c,ctx)=>{
 const ids=[...c.hotels,...c.activities].map(item=>item.id);
 if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'Catalogue IDs must be unique.'});
});
export const activityMixes={balanced:'Gentle sightseeing, children’s activities and rest',nature:'Nature, scenic places and relaxed outings',culture:'Culture, local food and city attractions',custom:'My own interests'};
export function needsLimitedMobility(p){return (p.accessibility||[]).some(s=>/stairs|step.free|wheelchair|lift|limited mobility|walking limit/i.test(s));}
export function eligibleHotels(p,catalogue){return catalogue.hotels.filter(h=>h.destination.toLowerCase()===p.destination.toLowerCase()&&!h.evidence.some(e=>e.substance==='adverse'&&needsLimitedMobility(p)&&['step-free-access','lift'].includes(e.topic)));}
const mixTags={balanced:['culture','nature','scenic','children','rest'],nature:['nature','scenic','rest'],culture:['culture','food'],custom:[]};
export function activityFit(a,p){
 const requested=(p.interests||[]).join(' ').toLowerCase();
 const explicit=a.interestTags.filter(tag=>requested.includes(tag.toLowerCase()));
 const matched=explicit.length?explicit:a.interestTags.filter(tag=>(mixTags[p.activityMix]||[]).includes(tag));
 return {score:explicit.length*3+matched.length,matchedTags:matched,reason:matched.length?`Considered for your ${matched.join(', ')} interests; practical suitability still needs confirmation.`:'A destination option to discuss; no specific interest match is established.'};
}
export function eligibleActivities(p,catalogue){return (catalogue.activities||[])
 .filter(a=>a.destination.toLowerCase()===p.destination.toLowerCase())
 .filter(a=>a.setting!=='excursion'||p.allowExcursions===true)
 .filter(a=>!needsLimitedMobility(p)||(a.access.status!=='stairs-required'&&!(a.restrictions||[]).length))
 .map(a=>({...a,fit:activityFit(a,p)}))
 .sort((a,b)=>b.fit.score-a.fit.score||a.id.localeCompare(b.id));}
