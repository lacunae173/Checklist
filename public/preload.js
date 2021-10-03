const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        sendDataRequest() {
            ipcRenderer.send('get-tasks');
            ipcRenderer.send('get-task-types')
        },
        on(channel, func) {
            const validChannels = ['get-tasks', 'get-task-types', 'insert-task', 'update-task'];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => {
                    func(...args);
                })
            }
        },
        once(channel, func) {
            const validChannels = ['get-tasks', 'get-task-types'];
            if (validChannels.includes(channel)) {
                ipcRenderer.once(channel, (event, ...args) => {
                    func(...args);
                })
            }
        },
        setTasks(tasks) {
           ipcRenderer.send('set-tasks', tasks); 
        },
        insertTask(task) {
            ipcRenderer.send('insert-task', task);
        },
        updateTask(task) {
            ipcRenderer.send('update-task', task);
        },
        deleteTask(taskId) {
            ipcRenderer.send('delete-task', taskId);
        }
    }
})