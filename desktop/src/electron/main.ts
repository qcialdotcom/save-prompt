import { app, BrowserWindow } from "electron";
import path from "path";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    maximizable: false,
    minimizable: true,
    fullscreenable: false,
    autoHideMenuBar: true,
    frame: true,
  });

  win.loadFile(path.join(app.getAppPath(), "dist-react", "index.html"));
};

app.whenReady().then(createWindow);
