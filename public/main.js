const { BrowserWindow, app, ipcMain } = require("electron");

const isDev = require('electron-is-dev');
const path = require('path');

const Store = require('electron-store');
const store = new Store();

if (!store.get('taskTypes')) {
    store.set('taskTypes', ["Daily", "Weekly", "Long term"]);
}
//debug
function getTodayDate() {
    const d = new Date();
    d.setDate(30);
    return d;
}

ipcMain.once('get-tasks', async (event, arg) => {
    console.log("received request for tasks");
    const tasks = store.get('tasks');

    console.log(tasks);
    const updatedTasks = tasks.map((task) => {
        if (task.finished) {
            if (task.taskType === 'Daily') {
                console.log(task.finishDate);
                const fd = new Date(task.finishDate);
                console.log(fd);
                const today = getTodayDate();
                console.log(today);
                if (fd.getDate() !== getTodayDate().getDate()) {
                    return {
                        ...task,
                        finished: false
                    }
                } 
            }
        }
        return task;
    })
    console.log(updatedTasks);
    console.log("reset");
    event.reply('get-tasks', updatedTasks);
});

ipcMain.once('get-task-types', async (event, arg) => {
    console.log("received request for task types");
    event.reply('get-task-types', store.get('taskTypes'));
});

ipcMain.on('set-tasks', async (event, arg) => {
    console.log("setting tasks");
    store.set('tasks', arg);
    console.log(arg);
    event.reply('set-tasks', store.get('tasks'));
});



function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });

    win.loadURL(
        isDev
            ? 'http://localhost:3000'
            :`file://${path.join(__dirname, '../build/index.html')}`
    );

    if (isDev) {
        win.webContents.openDevTools({ mode: 'detach' });
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate',  () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});