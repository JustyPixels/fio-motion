import { zipSync } from 'fflate';
import { type ExportJob, type Project } from './model';
import { resolveShot } from './animation';
import { Engine } from './engine';
import { Renderer } from './renderer';
import { download } from './desktop';
import { AudioEngine } from './audio';
import {frameCacheKey} from './frame-cache';
export class Exporter {
  cancelled=new Set<string>();
  async cancel(id:string){this.cancelled.add(id);await window.puppet?.exportCancel(id);}
  async run(project:Project,sceneId:string,job:ExportJob,update:(job:ExportJob)=>void,audio:AudioEngine){
    const snapshot=project,engine=new Engine(),canvas=document.createElement('canvas'),renderer=new Renderer(canvas),fps=project.fps.numerator/project.fps.denominator,frames=Math.max(1,Math.ceil((job.end-job.start)*fps)),archive:Record<string,Uint8Array>={},frameCache=new Map<string,ArrayBuffer>();let started=false;
    try {
      if(!window.puppet&&job.format==='mp4')throw new Error('MP4 export is available in the desktop app. Use a PNG sequence in the browser preview.');
      if(!window.puppet&&frames*job.width*job.height>250_000_000)throw new Error('This browser export is too large. Open the desktop app for streamed exports.');
      update({...job,status:'rendering',progress:0});
      const audioPlan=job.sequence&&job.format==='mp4'&&snapshot.sequence.audio.length?{clips:snapshot.sequence.audio,assets:snapshot.assets.filter(a=>a.type==='audio'),start:job.start,end:job.end}:undefined;
      if(this.cancelled.has(job.id)){update({...job,status:'cancelled'});return;}
      if(window.puppet){const output=await window.puppet.exportStart({...job,fps,rate:snapshot.fps,frames,audioPlan});if(!output){update({...job,status:'cancelled'});return;}job={...job,output:output.output};started=true;}
      for(let index=0;index<frames;index++){
        if(this.cancelled.has(job.id)){if(started)await window.puppet?.exportCancel(job.id);update({...job,status:'cancelled'});return;}
        const time=job.start+index/fps,resolved=job.sequence?resolveShot(snapshot,time):{scene:snapshot.scenes.find(s=>s.id===sceneId)!,time};
        const source=resolved?.scene??{...snapshot.scenes[0],id:'sequence-gap',layers:[],tracks:[],clips:[]},local=resolved?.time??0;
        const cacheKey=frameCacheKey(snapshot,source,local),cached=cacheKey&&frameCache.get(cacheKey);
        if(cached){if(window.puppet)await window.puppet.exportFrame(job.id,index,cached);else archive[`frame-${String(index).padStart(6,'0')}.png`]=new Uint8Array(cached);if(index%12===0||index===frames-1)update({...job,status:'rendering',progress:(index+1)/frames});continue;}
        const center=await engine.evaluate(snapshot,source,local);
        const motion=center.layers.some(l=>l.effects.motionBlur),accumulator=motion?document.createElement('canvas'):undefined;
        if(accumulator){accumulator.width=job.width;accumulator.height=job.height;const ctx=accumulator.getContext('2d')!;ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.25;for(let sample=0;sample<4;sample++){const sampleTime=Math.max(0,local+(sample/3-.5)/fps*.5),frame=await engine.evaluate(snapshot,source,sampleTime);frame.scene.camera=center.scene.camera;frame.layers=frame.layers.map(l=>l.effects.motionBlur?l:center.layers.find(c=>c.id===l.id)??l);await renderer.render(snapshot,frame,job.width,job.height,job.transparent);ctx.drawImage(canvas,0,0);}}
        else await renderer.render(snapshot,center,job.width,job.height,job.transparent);
        const data=window.puppet&&job.format==='mp4'&&!accumulator?renderer.videoPng():await (accumulator?await new Promise<Blob>((resolve,reject)=>accumulator.toBlob(b=>b?resolve(b):reject(new Error('Unable to capture motion blur.')),'image/png')):await renderer.png()).arrayBuffer();
        if(cacheKey){if(frameCache.size>=4)frameCache.delete(frameCache.keys().next().value!);frameCache.set(cacheKey,data);}
        if(window.puppet)await window.puppet.exportFrame(job.id,index,data);else archive[`frame-${String(index).padStart(6,'0')}.png`]=new Uint8Array(data);
        if(index%3===0||index===frames-1)update({...job,status:'rendering',progress:(index+1)/frames});
        await new Promise(r=>setTimeout(r,0));
      }
      const output=window.puppet?await window.puppet.exportFinish(job.id):undefined;if(!window.puppet)download(new Blob([zipSync(archive,{level:0})]),`${job.name}-frames.zip`);update({...job,status:'done',progress:1,output});
    }catch(error){await window.puppet?.exportCancel(job.id).catch(()=>{});update({...job,status:this.cancelled.has(job.id)?'cancelled':'failed',error:error instanceof Error?error.message:String(error)});}
    finally{renderer.dispose();engine.dispose();this.cancelled.delete(job.id);}
  }
}
