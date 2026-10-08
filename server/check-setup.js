import './env.js';
import { readFile, access } from 'node:fs/promises';
import { catalogueSchema } from './domain.js';
import { usageConfig } from './usage.js';

// Deliberately offline: no Gemini calls, credential discovery, or database writes.
console.log('TrustTrip offline setup check (no AI calls or external requests)');
let missing=false;
for(const [name,keys] of [
 ['Firebase public configuration',['FIREBASE_PROJECT_ID','FIREBASE_API_KEY','FIREBASE_AUTH_DOMAIN','FIREBASE_APP_ID']],
 ['Gemini server configuration',['GEMINI_API_KEY','GEMINI_MODEL']]
]){
 const absent=keys.filter(key=>!process.env[key]?.trim());
 console.log(`${name}: ${absent.length?'MISSING '+absent.join(', '):'supplied (connection unverified)'}`);
 missing ||= absent.length>0;
}
const admin=process.env.ENABLE_FIREBASE_ADMIN==='true';
console.log(`Firebase Admin: ${admin?'enabled; runtime credentials and database access still require verification':'disabled; set ENABLE_FIREBASE_ADMIN=true after authorizing runtime credentials'}`);
missing ||= !admin;
console.log('The public Firebase web API key is not a Firebase Admin credential. Use the hosting runtime identity or securely mounted Application Default Credentials.');
try{
 usageConfig();
 const data=catalogueSchema.parse(JSON.parse(await readFile(new URL('../catalogue/catalogue.json',import.meta.url),'utf8')));
 const destinations=new Set([...data.hotels,...data.activities].map(x=>x.destination));
 console.log(`Catalogue valid: ${data.hotels.length} hotels, ${data.activities.length} activities, ${destinations.size} destinations.`);
 console.log('AI allowance settings: valid. These do not control AI Studio builder quota.');
}catch{
 console.log('INVALID catalogue or AI allowance settings. Run npm test to locate the failure.');
 missing=true;
}
try{await access(new URL('../dist/index.html',import.meta.url));console.log('Production bundle: present (rebuild after source changes).');}
catch{console.log('Production bundle: absent; npm run dev works directly from source. npm start requires npm run build first.');}
console.log('Preview: npm run dev. Keep the assigned PORT and HOST=0.0.0.0 in a container.');
console.log('Automation is a later setup step; missing Airtable/n8n settings do not prevent the UI from loading.');
console.log(missing?'ACTION REQUIRED for live sign-in/chat; source preview can still start.':'Configuration supplied; verify sign-in and persistence before a single deliberate AI request.');
process.exitCode=missing?1:0;
