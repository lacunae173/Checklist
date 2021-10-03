const { BrowserWindow, app, ipcMain } = require("electron");

const isDev = require('electron-is-dev');
const path = require('path');

const Store = require('electron-store');
const { uniqueId } = require("lodash");
const store = new Store();

if (!store.get('taskTypes')) {
    store.set('taskTypes', ["Daily", "Weekly", "Long term"]);
}
//debug
function getTodayDate() {
    const d = new Date();
    // d.setDate(30);
    d.setHours(0,0,0,0);
    return d;
}

function isSameDay(d1, d2) {
    return d1.getDate() === d2.getDate() 
    && d1.getMonth() === d2.getMonth()
    && d1.getYear() === d2.getYear();
}

ipcMain.once('get-tasks', async (event, arg) => {
    console.log("received request for tasks");
    const tasks = store.get('tasks');
    if (tasks) {
        console.log(tasks);
        const updatedTasks = tasks.map((task) => {
            if (task.finished) {
                const fd = new Date(task.finishDate);
                const td = getTodayDate();
                if (task.taskType === 'Daily') {
                    console.log(fd);
                    console.log(td);
                    if (!isSameDay(fd, td)) {
                        return {
                            ...task,
                            finished: false
                        }
                    }
                } else if (task.taskType === 'Weekly') {
                    if (!isSameDay(fd, td) && (fd.getDay() >= td.getDay() || td.getDate() - fd.getDate() >= 7)) {
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
    }
    
});

ipcMain.once('get-task-types', async (event, arg) => {
    console.log("received request for task types");
    event.reply('get-task-types', store.get('taskTypes'));
});

// ipcMain.on('set-tasks', async (event, arg) => {
//     console.log("setting tasks");
//     store.set('tasks', arg);
//     console.log(arg);
//     event.reply('set-tasks', store.get('tasks'));
// });

ipcMain.on('insert-task', async (event, arg) => {
    var uid = store.get('idgen');
    if (!uid) {store.set('idgen', 0); uid = 0}
    console.log('insert task');
    var tasks = store.get('tasks');
    if (!tasks) tasks = [];
    console.log(arg);
    uid = uid + 1;
    store.set('idgen', uid);
    tasks = [...tasks, {...arg, id: uid}];
    console.log(tasks);
    store.set('tasks', tasks);
    event.reply('get-tasks', store.get('tasks'));
})

ipcMain.on('update-task', async (event, arg) => {
    console.log('check update');
    const tasks = store.get('tasks');
    if (tasks) {
        const newTasks = tasks.map((task) => {
            if (task.id === arg.id) return arg;
            else return task;
        });
        store.set('tasks', newTasks);
        console.log(newTasks);
    }
    event.reply('get-tasks', store.get('tasks'));
})

ipcMain.on('delete-task', async (event, arg) => {
    console.log('delete');
    const tasks = store.get('tasks');
    if (tasks) {
        const idx = tasks.findIndex((task) => {return task.id === arg});
        console.log(arg);
        console.log(idx);
        console.log(tasks);
        tasks.splice(idx, 1);
        store.set('tasks', tasks);
    }
    
    event.reply('get-tasks', store.get('tasks'));
})

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