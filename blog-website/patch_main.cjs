const fs = require('fs');

let content = fs.readFileSync('electron/main.ts', 'utf8');

content = content.replace(
  "import { app, BrowserWindow } from 'electron'",
  "import { app, BrowserWindow, ipcMain, dialog, Notification } from 'electron'\nimport fs from 'node:fs';"
);

const ipcHandlers = `
app.whenReady().then(() => {
  ipcMain.handle('save-local-file', async (event, content, defaultTitle) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save Blog Post',
      defaultPath: \`\${defaultTitle || 'untitled'}.md\`,
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
`;

content = content.replace(
  "app.whenReady().then(createWindow)",
  ipcHandlers
);

fs.writeFileSync('electron/main.ts', content);
