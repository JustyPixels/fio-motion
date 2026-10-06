import { type EvaluatedScene, type Project, type Asset, type EvaluatedLayer } from './model';
import {encodeRgbaPng} from './png';
const vertex = `#version 300 es
in vec2 a_position; in vec2 a_uv; in float a_depth; uniform mat3 u_matrix; uniform vec2 u_resolution; out vec2 v_uv;
void main(){ vec3 p=u_matrix*vec3(a_position,1.0); gl_Position=vec4(p.x/u_resolution.x*2.0-1.0,1.0-p.y/u_resolution.y*2.0,clamp(-a_depth,-.95,.95),1.0); v_uv=a_uv; }`;
const meshFragment = `#version 300 es
precision highp float; in vec2 v_uv; out vec4 color; uniform sampler2D u_image; uniform sampler2D u_mask; uniform vec2 u_size; uniform vec4 u_rect; uniform vec4 u_raster; uniform int u_maskMode; uniform float u_feather; uniform bool u_invert; uniform float u_opacity; uniform float u_maskOutside; uniform vec3 u_tint; uniform float u_tintAmount;
void main(){vec4 c=texture(u_image,v_uv); float mask=1.; vec2 p=v_uv*u_size;
if(u_maskMode==1){float d=min(min(p.x-u_rect.x,u_rect.x+u_rect.z-p.x),min(p.y-u_rect.y,u_rect.y+u_rect.w-p.y)); mask=smoothstep(-max(.001,u_feather),max(.001,u_feather),d);}
if(u_maskMode==2){vec2 uv=(p-u_raster.xy)/u_raster.zw;mask=any(lessThan(uv,vec2(0)))||any(greaterThan(uv,vec2(1)))?u_maskOutside:texture(u_mask,uv).a;}
if(u_invert)mask=1.-mask; c.a*=mask*u_opacity;if(c.a<.001)discard; c.rgb=mix(c.rgb,u_tint,u_tintAmount); color=vec4(c.rgb*c.a,c.a);}`;
const fullVertex = `#version 300 es
in vec2 a_position; out vec2 v_uv; void main(){v_uv=(a_position+1.)*.5;gl_Position=vec4(a_position,0,1);}`;
const compositeFragment = `#version 300 es
precision highp float; in vec2 v_uv; out vec4 color;uniform sampler2D u_back;uniform sampler2D u_front;uniform sampler2D u_clip;uniform int u_mode;uniform bool u_clipping;uniform float u_opacity;
void main(){vec4 b=texture(u_back,v_uv),s=texture(u_front,v_uv)*u_opacity;if(u_clipping)s*=texture(u_clip,v_uv).a; vec3 cb=b.a>0.?b.rgb/b.a:vec3(0),cs=s.a>0.?s.rgb/s.a:vec3(0),m=cs;
if(u_mode==1)m=cb*cs;if(u_mode==2)m=1.-(1.-cb)*(1.-cs);if(u_mode==3)m=mix(2.*cb*cs,1.-2.*(1.-cb)*(1.-cs),step(.5,cb));if(u_mode==4)m=min(cb,cs);if(u_mode==5)m=max(cb,cs);
color=vec4((1.-s.a)*b.rgb+(1.-b.a)*s.rgb+s.a*b.a*m,s.a+b.a*(1.-s.a));}`;
const blurFragment = `#version 300 es
precision highp float; in vec2 v_uv; out vec4 color;uniform sampler2D u_image;uniform vec2 u_direction;void main(){color=texture(u_image,v_uv)*.227027;color+=texture(u_image,v_uv+u_direction*1.384615)*.316216;color+=texture(u_image,v_uv-u_direction*1.384615)*.316216;color+=texture(u_image,v_uv+u_direction*3.230769)*.070270;color+=texture(u_image,v_uv-u_direction*3.230769)*.070270;}`;
const copyFragment = `#version 300 es
precision highp float; in vec2 v_uv;out vec4 color;uniform sampler2D u_image;uniform bool u_shadow;uniform vec2 u_offset;void main(){vec4 c=texture(u_image,v_uv-u_offset);color=u_shadow?vec4(vec3(0),c.a*.22):c;}`;
type Target = { texture: WebGLTexture; framebuffer: WebGLFramebuffer; depth: WebGLRenderbuffer };
export function cameraMatrix(project: Project, frame: EvaluatedScene) { const camera=frame.scene.camera, r=-camera.rotation*Math.PI/180,c=Math.cos(r)*camera.zoom,s=Math.sin(r)*camera.zoom; return [c,s,-s,c,project.width/2-c*(project.width/2+camera.position.x)+s*(project.height/2+camera.position.y),project.height/2-s*(project.width/2+camera.position.x)-c*(project.height/2+camera.position.y)]; }
export { multiply, applyMatrix, inverseMatrix } from './transforms';
import { multiply } from './transforms';
function rgb(hex:string) { const h=hex.replace('#',''); return [parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255]; }
export class Renderer {
  readonly gl: WebGL2RenderingContext;
  private meshProgram:WebGLProgram; private composite:WebGLProgram; private blur:WebGLProgram; private copy:WebGLProgram;
  private quad:WebGLBuffer; private positions:WebGLBuffer; private uv:WebGLBuffer; private depth:WebGLBuffer; private indices:WebGLBuffer;
  private textures=new Map<string,{texture:WebGLTexture;source:string;bytes:number;used:number}>(); private targets:Target[]=[]; private size=''; private tick=0; private lost=false;
  constructor(readonly canvas:HTMLCanvasElement,readonly fastNormal=true) {
    const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,antialias:true});if(!gl)throw new Error('Puppet Studio requires a graphics driver with WebGL2 support.');this.gl=gl;
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.lost=true;});
    this.meshProgram=this.program(vertex,meshFragment);this.composite=this.program(fullVertex,compositeFragment);this.blur=this.program(fullVertex,blurFragment);this.copy=this.program(fullVertex,copyFragment);
    this.quad=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    this.positions=gl.createBuffer()!;this.uv=gl.createBuffer()!;this.depth=gl.createBuffer()!;this.indices=gl.createBuffer()!;
  }
  private program(vs:string,fs:string){const gl=this.gl,p=gl.createProgram()!;for(const [type,source] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]] as const){const shader=gl.createShader(type)!;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'Shader compilation failed');gl.attachShader(p,shader);gl.deleteShader(shader);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'Shader link failed');return p;}
  private uniform(p:WebGLProgram,name:string){return this.gl.getUniformLocation(p,name);}
  private bindTexture(p:WebGLProgram,name:string,texture:WebGLTexture,unit:number){const gl=this.gl;gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(this.uniform(p,name),unit);}
  private target(){const gl=this.gl,texture=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,this.canvas.width,this.canvas.height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);const framebuffer=gl.createFramebuffer()!,depth=gl.createRenderbuffer()!;gl.bindFramebuffer(gl.FRAMEBUFFER,framebuffer);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,this.canvas.width,this.canvas.height);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);return {texture,framebuffer,depth};}
  private resize(width:number,height:number){const gl=this.gl;if(width>gl.getParameter(gl.MAX_TEXTURE_SIZE)||height>gl.getParameter(gl.MAX_TEXTURE_SIZE))throw new Error('This export resolution exceeds your graphics hardware limit.');if(`${width}:${height}`===this.size)return;this.size=`${width}:${height}`;this.canvas.width=width;this.canvas.height=height;for(const t of this.targets){gl.deleteTexture(t.texture);gl.deleteFramebuffer(t.framebuffer);gl.deleteRenderbuffer(t.depth);}this.targets=Array.from({length:7},()=>this.target());}
  private clear(target:Target|null,color:number[]=[0,0,0,0]){const gl=this.gl;gl.bindFramebuffer(gl.FRAMEBUFFER,target?.framebuffer??null);gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(color[0],color[1],color[2],color[3]);gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);}
  private full(p:WebGLProgram,target:Target|null){const gl=this.gl;gl.bindFramebuffer(gl.FRAMEBUFFER,target?.framebuffer??null);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,this.quad);const loc=gl.getAttribLocation(p,'a_position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);}
  private drawFull(){this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4);}
  private async texture(asset:Asset){const cached=this.textures.get(asset.id);if(cached?.source===asset.data){cached.used=++this.tick;return cached.texture;}const image=await createImageBitmap(await(await fetch(asset.data)).blob(),{premultiplyAlpha:'none'});const gl=this.gl,texture=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);image.close();if(cached)gl.deleteTexture(cached.texture);this.textures.set(asset.id,{texture,source:asset.data,bytes:asset.width*asset.height*4,used:++this.tick});return texture;}
  private mesh(layer:EvaluatedLayer,texture:WebGLTexture,mask:WebGLTexture|undefined,matrix:number[],target:Target,preserve=false){const gl=this.gl,p=this.meshProgram;if(preserve){gl.bindFramebuffer(gl.FRAMEBUFFER,target.framebuffer);gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearDepth(1);gl.clear(gl.DEPTH_BUFFER_BIT);}else this.clear(target);gl.useProgram(p);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);this.bindTexture(p,'u_image',texture,0);this.bindTexture(p,'u_mask',mask??texture,1);gl.uniform2f(this.uniform(p,'u_resolution'),this.canvas.width,this.canvas.height);gl.uniform2f(this.uniform(p,'u_size'),layer.asset.width,layer.asset.height);gl.uniformMatrix3fv(this.uniform(p,'u_matrix'),false,new Float32Array([matrix[0],matrix[1],0,matrix[2],matrix[3],0,matrix[4],matrix[5],1]));gl.uniform1f(this.uniform(p,'u_opacity'),layer.opacity);gl.uniform1f(this.uniform(p,'u_maskOutside'),layer.mask.outside??1);gl.uniform3fv(this.uniform(p,'u_tint'),rgb(layer.effects.tint));gl.uniform1f(this.uniform(p,'u_tintAmount'),layer.effects.tintAmount);gl.uniform1i(this.uniform(p,'u_maskMode'),layer.mask.enabled?(mask?2:1):0);gl.uniform1i(this.uniform(p,'u_invert'),Number(layer.mask.enabled&&layer.mask.invert));gl.uniform1f(this.uniform(p,'u_feather'),layer.mask.feather);gl.uniform4f(this.uniform(p,'u_rect'),layer.mask.position.x,layer.mask.position.y,layer.mask.size.x,layer.mask.size.y);gl.uniform4f(this.uniform(p,'u_raster'),(layer.mask.offset?.x??0)+layer.mask.position.x,(layer.mask.offset?.y??0)+layer.mask.position.y,layer.mask.size.x,layer.mask.size.y);
    const rest=layer.rig?.mesh.vertices??[0,0,layer.asset.width,0,layer.asset.width,layer.asset.height,0,layer.asset.height],uv=new Float32Array(rest.length);for(let i=0;i<rest.length;i+=2){uv[i]=rest[i]/layer.asset.width;uv[i+1]=rest[i+1]/layer.asset.height;}
    for(const [name,buffer,data,size] of [['a_position',this.positions,layer.vertices,2],['a_uv',this.uv,uv,2],['a_depth',this.depth,layer.depths,1]] as const){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);const loc=gl.getAttribLocation(p,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);}
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.indices);const triangles=new Uint32Array(layer.rig?.mesh.triangles??[0,1,2,0,2,3]);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,triangles,gl.DYNAMIC_DRAW);gl.drawElements(gl.TRIANGLES,triangles.length,gl.UNSIGNED_INT,0);
  }
  private compose(back:Target,front:Target,output:Target,mode:string,clip?:Target,opacity=1){this.full(this.composite,output);this.bindTexture(this.composite,'u_back',back.texture,0);this.bindTexture(this.composite,'u_front',front.texture,1);this.bindTexture(this.composite,'u_clip',clip?.texture??front.texture,2);this.gl.uniform1i(this.uniform(this.composite,'u_mode'),['normal','multiply','screen','overlay','darken','lighten'].indexOf(mode));this.gl.uniform1i(this.uniform(this.composite,'u_clipping'),Number(!!clip));this.gl.uniform1f(this.uniform(this.composite,'u_opacity'),opacity);this.drawFull();}
  async render(project:Project,frame:EvaluatedScene,width:number,height:number,transparent=false){
    if(this.lost)throw new Error('The graphics context was lost. Save and reopen the editor.');this.resize(width,height);const gl=this.gl;
    const camera=cameraMatrix(project,frame),scale=[width/project.width,0,0,height/project.height,0,0],byId=new Map(frame.scene.layers.map(l=>[l.id,l])),images=new Map(frame.layers.map(l=>[l.id,l]));
    const groupParent=(layer:typeof frame.scene.layers[number])=>{let parent=byId.get(layer.parentId??'');while(parent&&parent.kind!=='group')parent=byId.get(parent.parentId??'');return parent?.id;};
    const children=(parent?:string)=>frame.scene.layers.filter(l=>groupParent(l)===parent);
    const acquire=(depth:number)=>{const start=7+depth*3;while(this.targets.length<start+3)this.targets.push(this.target());return this.targets.slice(start,start+3);};
    const renderLevel=async(items:typeof frame.scene.layers,depth:number,background:number[]):Promise<Target>=>{
      let [back,next,clipTarget]=acquire(depth);this.clear(back,background);let clip:Target|undefined;
      const drawItems=async(list:typeof items):Promise<void>=>{const ordered=[...list].reverse();for(let index=0;index<ordered.length;index++){const source=ordered[index];
        if(source.kind==='group'){
          if(!source.visible)continue;
          const descendants=children(source.id);
          if(source.passThrough&&source.opacity===1){await drawItems(descendants);continue;}
          if(!descendants.some(l=>l.kind==='group'||images.has(l.id)))continue;
          const front=await renderLevel(descendants,depth+1,[0,0,0,0]);this.compose(back,front,next,source.blend,source.clipping?clip:undefined,source.opacity);[back,next]=[next,back];
          if(!source.clipping){this.clear(clipTarget);this.compose(clipTarget,front,next,'normal',undefined,source.opacity);this.full(this.copy,clipTarget);this.bindTexture(this.copy,'u_image',next.texture,0);gl.uniform1i(this.uniform(this.copy,'u_shadow'),0);gl.uniform2f(this.uniform(this.copy,'u_offset'),0,0);this.drawFull();clip=clipTarget;}
          continue;
        }
        const layer=images.get(source.id);if(!layer)continue;
        const texture=await this.texture(layer.asset),maskAsset=project.assets.find(a=>a.id===layer.mask.assetId),mask=maskAsset?await this.texture(maskAsset):undefined;
        const matrix=multiply(scale,multiply(camera,layer.world));
        if(this.fastNormal&&layer.blend==='normal'&&!layer.clipping&&layer.effects.blur===0&&layer.effects.shadow===0){this.mesh(layer,texture,mask,matrix,back,true);if(ordered[index+1]?.clipping||index===ordered.length-1){this.mesh(layer,texture,mask,matrix,clipTarget);clip=clipTarget;}continue;}
        this.mesh(layer,texture,mask,matrix,this.targets[2]);let front=this.targets[2];
        const soften=(amount:number)=>{const radius=amount*width/project.width;this.full(this.blur,this.targets[3]);this.bindTexture(this.blur,'u_image',this.targets[2].texture,0);gl.uniform2f(this.uniform(this.blur,'u_direction'),radius/width,0);this.drawFull();this.full(this.blur,this.targets[4]);this.bindTexture(this.blur,'u_image',this.targets[3].texture,0);gl.uniform2f(this.uniform(this.blur,'u_direction'),0,radius/height);this.drawFull();};
        if(layer.effects.blur>0){soften(layer.effects.blur);front=this.targets[4];if(layer.effects.shadow>0&&layer.effects.shadow!==layer.effects.blur){this.full(this.copy,this.targets[6]);this.bindTexture(this.copy,'u_image',front.texture,0);gl.uniform1i(this.uniform(this.copy,'u_shadow'),0);gl.uniform2f(this.uniform(this.copy,'u_offset'),0,0);this.drawFull();front=this.targets[6];}}
        if(layer.effects.shadow>0&&(layer.effects.blur===0||layer.effects.shadow!==layer.effects.blur))soften(layer.effects.shadow);
        if(layer.effects.shadow>0){this.full(this.copy,this.targets[5]);this.bindTexture(this.copy,'u_image',this.targets[4].texture,0);gl.uniform1i(this.uniform(this.copy,'u_shadow'),1);gl.uniform2f(this.uniform(this.copy,'u_offset'),8/project.width,-12/project.height);this.drawFull();this.compose(back,this.targets[5],next,'normal',layer.clipping?clip:undefined);[back,next]=[next,back];}
        this.compose(back,front,next,layer.blend,layer.clipping?clip:undefined);[back,next]=[next,back];
        if(!layer.clipping){this.full(this.copy,clipTarget);this.bindTexture(this.copy,'u_image',front.texture,0);gl.uniform1i(this.uniform(this.copy,'u_shadow'),0);gl.uniform2f(this.uniform(this.copy,'u_offset'),0,0);this.drawFull();clip=clipTarget;}
      }};
      await drawItems(items);return back;
    };
    const back=await renderLevel(children(),0,transparent?[0,0,0,0]:[...rgb(frame.scene.background),1]);
    this.full(this.copy,null);this.bindTexture(this.copy,'u_image',back.texture,0);gl.uniform1i(this.uniform(this.copy,'u_shadow'),0);gl.uniform2f(this.uniform(this.copy,'u_offset'),0,0);this.drawFull();
    let bytes=[...this.textures.values()].reduce((n,t)=>n+t.bytes,0);for(const [key,t] of [...this.textures].sort((a,b)=>a[1].used-b[1].used)){if(bytes<256*1024*1024)break;gl.deleteTexture(t.texture);this.textures.delete(key);bytes-=t.bytes;}
  }
  videoPng(){const pixels=new Uint8Array(this.canvas.width*this.canvas.height*4);this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);this.gl.readPixels(0,0,this.canvas.width,this.canvas.height,this.gl.RGBA,this.gl.UNSIGNED_BYTE,pixels);return encodeRgbaPng(this.canvas.width,this.canvas.height,pixels,true).buffer;}
  async png(){return new Promise<Blob>((resolve,reject)=>this.canvas.toBlob(b=>b?resolve(b):reject(new Error('The frame could not be captured.')),'image/png'));}
  pixels(){const gl=this.gl,data=new Uint8Array(this.canvas.width*this.canvas.height*4);gl.readPixels(0,0,this.canvas.width,this.canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,data);return data;}
  dispose(){const gl=this.gl;for(const t of this.targets){gl.deleteTexture(t.texture);gl.deleteFramebuffer(t.framebuffer);gl.deleteRenderbuffer(t.depth);}for(const t of this.textures.values())gl.deleteTexture(t.texture);for(const p of [this.meshProgram,this.composite,this.blur,this.copy])gl.deleteProgram(p);for(const b of [this.quad,this.positions,this.uv,this.depth,this.indices])gl.deleteBuffer(b);}
}
