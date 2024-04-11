import { contextBridge, ipcRenderer } from 'electron';
import { Path } from 'src/renderer/App';

contextBridge.exposeInMainWorld('preloadApiThing', {
    renderAudio: (data: { output: string; paths: Path[] }) => ipcRenderer.send('render-audio', data)
});