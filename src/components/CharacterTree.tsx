import {useState} from 'react';
import {ChevronDown,ChevronRight} from 'lucide-react';
import type {Scene} from '../model';
import {tr} from '../i18n';
export function CharacterTree({scene,selected,onSelect,onRename}:{scene:Scene;selected:string[];onSelect:(id:string,e:React.MouseEvent)=>void;onRename:(id:string)=>void}){
  const [closed,setClosed]=useState<string[]>([]);
  const participating=scene.layers.filter(l=>l.attachment||scene.layers.some(p=>p.attachment?.layerId===l.id)||scene.characters.some(c=>c.rootLayerId===l.id));
  function branch(parent:string|undefined,depth=0):React.ReactNode{return participating.filter(l=>(l.attachment?.layerId??undefined)===parent).map(l=>{const children=participating.some(c=>c.attachment?.layerId===l.id),collapsed=closed.includes(l.id);return <div key={l.id}><div className={`character-tree-row ${selected.includes(l.id)?'selected':''}`} style={{paddingLeft:10+depth*16}}>{children?<button aria-label={tr('Characters')} aria-expanded={!collapsed} onClick={()=>setClosed(old=>collapsed?old.filter(id=>id!==l.id):[...old,l.id])}>{collapsed?<ChevronRight size={13}/>:<ChevronDown size={13}/>}</button>:<span>↳</span>}<button onClick={e=>onSelect(l.id,e)} onDoubleClick={()=>onRename(l.id)}>{l.name}</button></div>{!collapsed&&children&&depth<scene.layers.length&&branch(l.id,depth+1)}</div>;});}
  return <div className="character-tree">{branch(undefined)}</div>;
}
