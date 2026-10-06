const { contextBridge, ipcRenderer } = require('electron');
const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);
contextBridge.exposeInMainWorld('puppet', {
  platform: 'windows',exampleStartup:process.env.PUPPET_TEST_APP==='1',testingLocale:process.env.PUPPET_TEST_APP==='1'?(process.env.FIO_TEST_LOCALE||'en'):undefined,
  preferencesLoad:()=>invoke('preferences:load'),
  preferencesSave:p=>invoke('preferences:save',p),
  updatesCheck:manual=>invoke('updates:check',!!manual),
  updatesOpen:()=>invoke('updates:open'),
  openRecent:file=>invoke('project:recent',file),
  onSaveRequest:callback=>{const handler=async()=>{let saved=false;try{saved=await callback();}catch{}await invoke('close:saved',saved);};ipcRenderer.on('project:save-request',handler);return ()=>ipcRenderer.removeListener('project:save-request',handler);},
  open: () => invoke('project:open'),
  newProject: () => invoke('project:new'),
  acceptOpen: () => invoke('project:opened'),
  save: (project, saveAs) => invoke('project:save', project, !!saveAs),
  collect: project => invoke('project:collect', project),
  recover: () => invoke('project:recover'),
  checkpoint: (project, label) => invoke('project:checkpoint', project, label),
  dirty: value => invoke('project:dirty', !!value),
  exportStart: job => invoke('export:start', job),
  exportFrame: (jobId, index, data) => invoke('export:frame', jobId, index, data),
  exportFinish: jobId => invoke('export:finish', jobId),
  exportCancel: jobId => invoke('export:cancel', jobId),
  encoderInfo: () => invoke('export:info'),
  openOutput: jobId => invoke('export:reveal', jobId),
  onExportError: callback => { const handler = (_, value) => callback(value); ipcRenderer.on('export:error', handler); return () => ipcRenderer.removeListener('export:error', handler); }
});
