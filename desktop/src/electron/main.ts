import { app, BrowserWindow } from "electron";
import path from "path";

const createWindow = () => {
  const win = new BrowserWindow({ width: 400, height: 500 });

  win.loadFile(path.join(app.getAppPath(), "dist-react", "index.html"));
};

app.whenReady().then(() => {
  createWindow();
});
