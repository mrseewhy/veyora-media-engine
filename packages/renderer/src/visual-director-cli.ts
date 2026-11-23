import {readFile,mkdir,writeFile,copyFile,stat} from 'node:fs/promises';
import {resolve,dirname,join,basename,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {validateVisualPlan,inspectVisualPlan} from '../../shared/src/visual-director.js';
/** Offline, no metered API: validates shot plan and stages approved local assets. */
async function main(){
 const input=process.argv[2];if(!input)throw Error('Usage: npm run visual:prepare -- path/to/visual-plan.json [output-dir]');
 const planPath=resolve(input),base=dirname(planPath),plan=validateVisualPlan(JSON.parse(await readFile(planPath,'utf8')));
 const out=resolve(process.argv[3]??join('data','visual-director',plan.episodeId));
 const manifest=[] as Array<{id:string;path:string;sha256:string;source:string;license:string;creator:string}>;
 for(const asset of plan.assets){
  if(asset.status!=='ready')continue;
  const src=resolve(base,asset.path!);
  // Explicitly stage only existing files. No arbitrary remote downloads or API spending.
  const info=await stat(src);if(!info.isFile())throw Error('Not a file: '+src);
  const bytes=await readFile(src);const sha256=createHash('sha256').update(bytes).digest('hex');
  const dest=join(out,'assets',asset.id+'-'+sha256.slice(0,12)+basename(src).slice(basename(src).lastIndexOf('.')));
  await mkdir(dirname(dest),{recursive:true});await copyFile(src,dest);
  manifest.push({id:asset.id,path:dest,sha256,source:asset.sourceUrl??src,license:asset.license!,creator:asset.creator!});
 }
 const qa=inspectVisualPlan(plan);
 await mkdir(out,{recursive:true});
 await writeFile(join(out,'visual-plan.json'),JSON.stringify(plan,null,2));
 await writeFile(join(out,'asset-manifest.json'),JSON.stringify(manifest,null,2));
 await writeFile(join(out,'creative-preflight.json'),JSON.stringify({...qa,missingLocalAssets:plan.assets.filter(a=>a.status==='ready'&&!manifest.some(m=>m.id===a.id)).map(a=>a.id)},null,2));
 console.log(JSON.stringify({output:out,...qa},null,2));
 if(!qa.readyForHumanReview)process.exitCode=2;
}
main().catch(e=>{console.error(e);process.exitCode=1});
