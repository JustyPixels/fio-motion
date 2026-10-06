import type { Project, ExportJob, AudioClip, Asset } from './model';
export type ExportStartSpec=ExportJob&{fps:number;rate:{numerator:number;denominator:number};frames:number;audioPlan?:{clips:AudioClip[];assets:Asset[];start:number;end:number}};
export type DesktopBridge = {
  preferencesLoad():Promise<{locale:string;updates:boolean;recent:string[]}>; preferencesSave(p:{locale:string;updates:boolean}):Promise<unknown>;updatesCheck(manual:boolean):Promise<{status:string;version?:string}>;updatesOpen():Promise<void>;openRecent(path:string):Promise<{project:Project;path:string}>;onSaveRequest(callback:()=>Promise<boolean>):()=>void;
  platform: string; newProject(): Promise<void>; acceptOpen(): Promise<void>; open(): Promise<{ project: Project; path: string } | null>; save(project: Project, saveAs?: boolean): Promise<{ path: string } | null>; collect(project: Project): Promise<string | null>;
  recover(): Promise<{ project: Project; at: string } | null>; checkpoint(project: Project, label: string): Promise<void>; dirty(value: boolean): Promise<void>;
  exportStart(job: ExportStartSpec): Promise<{ id: string; output: string } | null>; exportFrame(id: string, index: number, data: ArrayBuffer): Promise<number>; exportFinish(id: string): Promise<string>; exportCancel(id: string): Promise<void>; encoderInfo(): Promise<{ available: boolean; path: string }>; openOutput(id: string): Promise<void>; onExportError(callback: (value: { id: string; error: string }) => void): () => void;
};
declare global { interface Window { puppet?: DesktopBridge; } }
export function download(data: Blob, name: string) { const url=URL.createObjectURL(data),anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
export const fileData = (file: Blob): Promise<string> => new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result as string);reader.onerror=()=>reject(new Error('Unable to read this file.'));reader.readAsDataURL(file);});
