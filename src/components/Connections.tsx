import { tr } from '../i18n';
import { useEffect, useState } from 'react';
import { Link2, Unlink } from 'lucide-react';
import type { Layer, LayerAttachment, Project, Scene } from '../model';
import { canConnect } from '../connections';

export function Connections({project,scene,layer,selectedIds,onConnect,busy}:{project:Project;scene:Scene;layer:Layer;selectedIds:string[];onConnect:(ids:string[],target:LayerAttachment|undefined)=>void;busy:boolean}) {
  const [targetId,setTargetId]=useState(layer.attachment?.layerId??''),[control,setControl]=useState(layer.attachment?`${layer.attachment.kind}:${layer.attachment.controlId??''}`:'layer:');
  useEffect(()=>{setTargetId(layer.attachment?.layerId??'');setControl(layer.attachment?`${layer.attachment.kind}:${layer.attachment.controlId??''}`:'layer:');},[layer.id,layer.attachment?.layerId,layer.attachment?.kind,layer.attachment?.controlId]);
  const ids=selectedIds.length?selectedIds:[layer.id],children=ids.filter(id=>id!==targetId),target=scene.layers.find(l=>l.id===targetId),rig=project.rigs.find(r=>r.id===target?.rigId),followers=scene.layers.filter(l=>l.attachment?.layerId===layer.id);
  const targets=scene.layers.filter(t=>ids.filter(id=>id!==t.id).length>0&&ids.filter(id=>id!==t.id).every(id=>canConnect(scene,id,t.id)));
  return <div className="inspector-section rig-connections"><div className="panel-heading"><h3><Link2 size={13}/>{tr("Connected pieces")}</h3>{ids.length>1&&<span className="pill">{ids.length} {tr("selected")}</span>}</div>
    <p className="helper">{tr("Connect artwork to another layer, pin or bone. Pieces keep their placement and follow that control together.")}</p>
    <label className="select-field">{tr("Follow layer")}<select aria-label={tr("Follow layer")} value={targetId} onChange={e=>{setTargetId(e.target.value);setControl('layer:');}}><option value="">{tr("Choose a layer…")}</option>{targets.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
    {target&&<label className="select-field">{tr("Follow control")}<select aria-label={tr("Follow control")} value={control} onChange={e=>setControl(e.target.value)}><option value="layer:">{tr("Whole layer")}</option>{rig?.pins.map(p=><option key={p.id} value={`pin:${p.id}`}>{tr("Pin ·")} {p.name}</option>)}{rig?.bones.map(b=><option key={b.id} value={`bone:${b.id}`}>{tr("Bone tip ·")} {b.name}</option>)}</select></label>}
    <button className="full-button" disabled={!target||!children.length||busy} onClick={()=>{const [kind,controlId]=control.split(':');onConnect(children,{layerId:targetId,kind:kind as LayerAttachment['kind'],controlId:controlId||undefined});}}><Link2 size={13}/>{ids.length>1?'Connect selected pieces':'Connect piece'}</button>
    {layer.attachment&&<button className="quiet-button" disabled={busy} onClick={()=>onConnect([layer.id],undefined)}><Unlink size={13}/>{tr("Disconnect piece")}</button>}
    {!!followers.length&&<div className="connection-followers"><span className="tiny-label">{tr("PIECES FOLLOWING THIS LAYER")}</span>{followers.map(l=><span key={l.id}><Link2 size={11}/>{l.name}</span>)}</div>}
    <p className="helper">{tr("Shift-click layers to connect several pieces at once. Connections are rig edits; animation stays on each piece.")}</p>
  </div>;
}
