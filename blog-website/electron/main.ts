import { app, BrowserWindow, ipcMain, dialog, Notification } from 'electron'
import fs from 'node:fs';
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const _dirname = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(fileURLToPath(import.meta.url))

process.env.DIST = path.join(_dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.png'),
    webPreferences: {
      preload: path.join(_dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


app.whenReady().then(() => {
  ipcMain.handle('save-local-file', async (event, content, defaultTitle) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save Blog Post',
      defaultPath: `${defaultTitle || 'untitled'}.md`,
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    });
    if (canceled || !filePath) return false;
    fs.writeFileSync(filePath, content);
    return true;
  });

  ipcMain.handle('open-local-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Open Markdown File',
      properties: ['openFile'],
      filters: [{ name: 'Markdown', extensions: ['md', 'txt'] }]
    });
    if (canceled || filePaths.length === 0) return null;
    return fs.readFileSync(filePaths[0], 'utf-8');
  });

  ipcMain.on('show-notification', (event, title, body) => {
    new Notification({ title, body }).show();
  });

  createWindow();
})

