const { BrowserWindow, app, ipcMain } = require("electron");

const isDev = require('electron-is-dev');
const path = require('path');

const Store = require('electron-store');
const store = new Store();
if (!store.get('taskTypes')) {
    store.set('taskTypes', ["Daily", "Weekly", "Long term"]);
}

function getTodayDate() {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
}

function isSameDay(d1, d2) {
    return d1.getDate() === d2.getDate() 
    && d1.getMonth() === d2.getMonth()
    && d1.getYear() === d2.getYear();
}

ipcMain.once('get-tasks', async (event, arg) => {
    const tasks = store.get('tasks');
    if (tasks) {
        // update finished state of task for daily and weekly
        const updatedTasks = tasks.map((task, idx) => {
            task.id = idx;
            if (task.finished) {
                const fd = new Date(task.finishDate);
                const td = getTodayDate();
                if (task.taskType === 'Daily') {
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
        store.set('tasks', updatedTasks);
        store.set('idgen', updatedTasks.length);
        event.reply('get-tasks', updatedTasks);
    }
    
});

ipcMain.once('get-task-types', async (event, arg) => {
    event.reply('get-task-types', store.get('taskTypes'));
});

ipcMain.on('insert-task', async (event, arg) => {
    if (isDev) {
        console.log('insert');
    }
    var uid = store.get('idgen');
    if (!uid) {store.set('idgen', 0); uid = 0}
    var tasks = store.get('tasks');
    if (!tasks) tasks = [];
    uid = uid + 1;
    store.set('idgen', uid);
    tasks = [...tasks, {...arg, id: uid}];
    store.set('tasks', tasks);
    event.reply('get-tasks', store.get('tasks'));
})

ipcMain.on('update-task', async (event, arg) => {
    if (isDev) {
        console.log('update');
    }
    const tasks = store.get('tasks');
    if (tasks) {
        const newTasks = tasks.map((task) => {
            if (task.id === arg.id) return arg;
            else return task;
        });
        store.set('tasks', newTasks);
    }
    event.reply('get-tasks', store.get('tasks'));
})


ipcMain.on('delete-task', async (event, arg) => {
    if (isDev) {
        console.log('delete');
    }
    const tasks = store.get('tasks');
    if (tasks) {
        const idx = tasks.findIndex((task) => {return task.id === arg});
        tasks.splice(idx, 1);
        store.set('tasks', tasks);
    }
    
    event.reply('get-tasks', store.get('tasks'));
})

ipcMain.on('check-task', async (event, arg) => {
    if (isDev) {
        console.log('check');
    }
    const tasks = store.get('tasks');
    if (tasks) {
        const newTasks = tasks.map((task) => {
            if (task.id === arg) {
                const date = new Date();
                date.setHours(0,0,0,0);
                const finished = task.finished;
                return {
                    ...task,
                    finished: !finished,
                    finishDate: date
                }
            }
            else return task;
        });
        store.set('tasks', newTasks);
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