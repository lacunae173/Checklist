import './App.css';
import { useEffect, useState } from 'react';
import { uniqueId } from 'lodash';
import TaskItem from './TaskItem';
import { bootstrap } from 'globalthis/implementation';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskType, setNewTaskType] = useState("");
  const [taskTypes, setTaskTypes] = useState([]);
  const [needDelConfirm, setNeedDelConfirm] = useState(true);
  const [taskIdToDelete, setTaskIdToDelete] = useState(-1);
  

  useEffect(() => {
    window.electron.ipcRenderer.on('get-tasks', (arg) => {
      console.log(arg);
      if (arg) {
        setTasks(arg);
      }
    });
    window.electron.ipcRenderer.once('get-task-types', (arg) => {
      console.log(arg);
      if (arg) setTaskTypes(arg);
    })
    window.electron.ipcRenderer.sendDataRequest();
    // document.body.setAttribute('data-bs-spy', 'scroll')
  }, []);

  // useEffect(() => {
  //   console.log(tasks);
  //   window.electron.ipcRenderer.setTasks(tasks);
  // }, [tasks]);



  const handleClick = () => {
    if (newTask && newTaskType) {
      // setTasks([
      //   ...tasks, 
      //   {id: uniqueId('task-'), 
      //   taskName: newTask,
      // taskType: newTaskType,
      // finished: false}]);      
      window.electron.ipcRenderer.insertTask({
        taskName: newTask,
        taskType: newTaskType,
        finished: false
      });
      setNewTask("");
      setNewTaskType("");
    }
  }

  // const handleCheck = (taskId, finished) => {
  //   const idx = tasks.findIndex((task) => task.id === taskId);
  //   const ti = tasks[idx];
  //   ti['finished'] = finished;
  //   const d = new Date();
  //   d.setHours(0,0,0,0);
  //   ti['finishDate'] = d;
  //   window.electron.ipcRenderer.updateTask(ti);
    
  // }

  const handleCheck = (taskId) => {
    window.electron.ipcRenderer.checkTask(taskId);

  }

  const handleDelete = (taskId) => {
    if (needDelConfirm) {
      setTaskIdToDelete(taskId);
      const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
      confirmModal.toggle();
    } else {
      window.electron.ipcRenderer.deleteTask(taskId);
    }
  }

  const handleConfirmDelete = () => {
    window.electron.ipcRenderer.deleteTask(taskIdToDelete);
    
  }

  const handleChangeNeedConfirm = () => {
    setNeedDelConfirm(false);
  }

 
  return (
    <div className="p-3">
      <div className="row">
        <div className="col-3">
          
          <nav id="type-nav" className="navbar flex-column position-fixed">
            <nav className="nav nav-vertab flex-column">
              {taskTypes.map((taskType, index) => {
                return <a id={`type-${index}`} href={"#" + taskType} className="nav-link">{taskType}</a>
              })}
            </nav>
          </nav>
        </div>

        <div className="col-9">
          <h3>Tasks</h3>
          <div className="tasks-scroll" tabIndex="0">
            {taskTypes.map((taskType, idx) => {
              const tasksOfType = tasks.filter((task) => task.taskType === taskType);
              if (tasksOfType.length) {
                return (
                  <div className="my-3">
                    <h5 id={taskType}>{taskType}</h5>
                    <div className="list-group list-group-flush me-5">
                      {tasksOfType.map((task) => {
                        if (!task.finished)
                        return (
                          <TaskItem task={task} handleCheck={handleCheck} handleDelete={handleDelete} />
                        )
                      })}
                      {tasksOfType.map((task) => {
                        if (task.finished)
                        return (
                          <TaskItem task={task} handleCheck={handleCheck} handleDelete={handleDelete} />
                        )
                      })}
                    </div>
                  </div>
                )
              } else {
                return <div></div>;
              }
            })}
          </div>
        </div>
      </div>
      <button id="float-add-task" className="btn btn-primary btn-lg rounded-pill position-fixed bottom-5 end-5" style={{ color: 'white' }} data-bs-toggle="modal" data-bs-target="#addTaskModal">+</button>
      <div className="modal fade" id="addTaskModal" tabIndex="-1" aria-labelledby="addTaskModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addTaskModalTitle">Add Task</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <label htmlFor="taskName" className="col-form-label">Task</label>
              <input id="taskName" className="form-control" type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
              <label htmlFor="taskType" className="col-form-label">Type</label>
              <select className="form-select" aria-label="type" value={newTaskType} onChange={(e) => setNewTaskType(e.target.value)}>
                <option value="">Select a type</option>
                {taskTypes.map((taskType) => {
                  return <option value={taskType}>{taskType}</option>
                })}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" data-bs-dismiss="modal" onClick={handleClick} style={{ color: 'white' }}>Add task</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="confirmModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <p>Are you sure you want to delete this task?</p>
            </div>
            <div className="modal-footer">
              <div className="me-auto">
                <input className="form-check-input" type="checkbox" value="" id="needConfirmCheck" onChange={handleChangeNeedConfirm} />
                <label className="form-check-label ms-1" htmlFor="needConfirmCheck">
                  <small>Do not show me this dialog again in this session</small>
                </label>
              </div>
              <button className="btn btn-primary" data-bs-dismiss="modal" onClick={handleConfirmDelete} style={{ color: 'white' }}>Yes</button>
            </div>
          </div>
        </div>
      </div>
  </div> 
  );
}


export default App;
