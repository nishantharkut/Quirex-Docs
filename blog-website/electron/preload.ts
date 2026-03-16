import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveLocalFile: (content: string, title: string) => ipcRenderer.invoke('save-local-file', content, title),
  openLocalFile: () => ipcRenderer.invoke('open-local-file'),
  showNotification: (title: string, body: string) => ipcRenderer.send('show-notification', title, body),
});
