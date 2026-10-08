import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,unlink,rmdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

test('platform configuration wins over local .env and test mode ignores .env',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'trusttrip-env-'));
 try{
  await writeFile(path.join(dir,'.env'),'PORT=4179\nTRUSTTRIP_ENV_FIXTURE=local-file\n');
  const code=`await import(${JSON.stringify(new URL('../server/env.js',import.meta.url).href)}); console.log(JSON.stringify({port:process.env.PORT,fixture:process.env.TRUSTTRIP_ENV_FIXTURE||null}));`;
  for(const mode of ['development','test']){
   const env={...process.env,NODE_ENV:mode,PORT:'3000'};delete env.TRUSTTRIP_ENV_FIXTURE;
   const result=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:dir,env,encoding:'utf8'});
   assert.equal(result.status,0,result.stderr);
   assert.deepEqual(JSON.parse(result.stdout),{port:'3000',fixture:mode==='test'?null:'local-file'});
  }
 }finally{await unlink(path.join(dir,'.env'));await rmdir(dir);}
});
