const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  const iconPath = app.isPackaged
    ? path.join(__dirname, '../dist/icon.ico')
    : path.join(__dirname, '../public/icon.ico');

  const mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    title: 'Gran Rifa Viaje a la Playa | Control de Cobranza - Cinelandia',
    icon: iconPath,
    autoHideMenuBar: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Abrir enlaces externos (WhatsApp, Instagram, etc.) en el navegador predeterminado del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (!process.env.VITE_DEV_SERVER_URL || !url.startsWith(process.env.VITE_DEV_SERVER_URL)) {
        event.preventDefault();
        shell.openExternal(url);
      }
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
