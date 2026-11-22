import {readFile} from 'node:fs/promises';
import {sql} from 'drizzle-orm';
import {connectDatabase} from './db.js';
import {addFeedback,compareRenders,evaluationHistory,extractCandidates,lessonContext,lessonUsage,listFeedback,listLessons,listRenders,proposeLesson,recordHumanEvaluation,registerEpisode,registerRender,reviewLesson,setRenderStatus} from './service.js';

const args=process.argv.slice(2);
const [area,action]=args;
const option=(name:string)=>{const i=args.indexOf(`--${name}`);return i<0?undefined:args[i+1]};
const need=(name:string)=>{const value=option(name);if(!value||value.startsWith('--'))throw new Error(`--${name} is required`);return value};
const jsonFile=async(path:string)=>JSON.parse(await readFile(path,'utf8')) as Record<string,unknown>;
const output=(value:unknown)=>console.log(JSON.stringify(value,null,2));
const help=`Production Intelligence CLI
  intelligence db check
  intelligence episode register --storyboard PATH --title TITLE
  intelligence render register --episode ID --artifact PATH --qa PATH [--version N]
  intelligence render list --episode ID
  intelligence render compare --left UUID --right UUID
  intelligence render status --id UUID --status approved|needs_changes --actor NAME --reason TEXT
  intelligence feedback add --file feedback.json
  intelligence feedback list --render UUID
  intelligence lesson extract [--min 2]
  intelligence lesson propose --file lesson.json
  intelligence lesson list [--status candidate|approved|rejected]
  intelligence lesson review --id UUID --status approved|rejected --actor NAME
  intelligence lesson context --episode ID --kind storyboard|script [--apply-by NAME]
  intelligence lesson usage --episode ID
  intelligence evaluation run --file evaluation.json
  intelligence evaluation list --render UUID`;

if(!area||area==='help'||area==='--help'){console.log(help);process.exit(0)}
const {db,pool}=connectDatabase();
try{
  switch(`${area} ${action}`){
    case 'db check': output((await db.execute(sql`select current_database() as database, current_user as user`)).rows);break;
    case 'episode register': output(await registerEpisode(db,need('storyboard'),need('title')));break;
    case 'render register': output(await registerRender(db,{episodeId:need('episode'),artifactPath:need('artifact'),qaPath:need('qa'),version:option('version')?Number(option('version')):undefined}));break;
    case 'render list': output(await listRenders(db,need('episode')));break;
    case 'render compare': output(await compareRenders(db,need('left'),need('right')));break;
    case 'render status': {
      const status=need('status');if(status!=='approved'&&status!=='needs_changes')throw new Error('Invalid render status');
      output(await setRenderStatus(db,need('id'),status,need('actor'),need('reason')));break;
    }
    case 'feedback add': {
      const f=await jsonFile(need('file'));
      output(await addFeedback(db,{renderId:String(f.renderId??''),sceneId:f.sceneId==null?null:String(f.sceneId),rating:Number(f.rating),problemCode:f.problemCode==null?null:String(f.problemCode),comment:String(f.comment??''),requestedCorrection:f.requestedCorrection==null?null:String(f.requestedCorrection),reviewer:String(f.reviewer??'')}));break;
    }
    case 'feedback list': output(await listFeedback(db,need('render')));break;
    case 'lesson extract': output(await extractCandidates(db,option('min')?Number(option('min')):2));break;
    case 'lesson propose': {
      const f=await jsonFile(need('file'));
      output(await proposeLesson(db,{category:String(f.category??''),scope:String(f.scope??''),statement:String(f.statement??''),sourceFeedbackIds:Array.isArray(f.sourceFeedbackIds)?f.sourceFeedbackIds.map(String):undefined}));break;
    }
    case 'lesson list': output(await listLessons(db,option('status')));break;
    case 'lesson review': {
      const status=need('status');if(status!=='approved'&&status!=='rejected')throw new Error('Invalid lesson status');
      output(await reviewLesson(db,need('id'),status,need('actor')));break;
    }
    case 'lesson context': {
      const kind=need('kind');if(kind!=='storyboard'&&kind!=='script')throw new Error('Invalid context kind');
      output(await lessonContext(db,need('episode'),kind,option('apply-by')));break;
    }
    case 'lesson usage': output(await lessonUsage(db,need('episode')));break;
    case 'evaluation run': {
      const f=await jsonFile(need('file'));
      output(await recordHumanEvaluation(db,{renderId:String(f.renderId??''),evaluator:String(f.evaluator??''),scores:f.scores,factualNotes:f.factualNotes==null?undefined:String(f.factualNotes),modelVersion:f.modelVersion==null?undefined:String(f.modelVersion)}));break;
    }
    case 'evaluation list': output(await evaluationHistory(db,need('render')));break;
    default: throw new Error(`Unknown command.\n${help}`);
  }
}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1}
finally{await pool.end()}
