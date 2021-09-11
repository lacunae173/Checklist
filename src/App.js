import './App.css';
import { useEffect, useState } from 'react';


let counter = 0;
function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newTaskType, setNewTaskType] = useState("");
  const [taskTypes, setTaskTypes] = useState([])
  useEffect(() => {
    window.electron.ipcRenderer.once('get-tasks', (arg) => {
      // eslint-disable-next-line no-console
      console.log(arg);
      if (arg) setTasks(arg);
    });
    window.electron.ipcRenderer.once('get-task-types', (arg) => {
      console.log(arg);
      if (arg) setTaskTypes(arg);
    })
    window.electron.ipcRenderer.sendDataRequest();
  }, []);

  useEffect(() => {
    console.log(tasks);
    window.electron.ipcRenderer.setTasks(tasks);
  }, [tasks]);

  const handleClick = () => {
    if (newTask && newTaskType) {
      setTasks([
        ...tasks, 
        {id: counter, 
        taskName: newTask,
      taskType: newTaskType}]);
      counter = counter + 1;
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="row">
          <div className="col-3">
            <nav className="nav nav-vertab flex-column">
              {taskTypes.map((taskType, idx) => {
                if (idx === 0) return <a href="#" className="nav-link active">{taskType}</a>
                return <a href="#" className="nav-link">{taskType}</a>
              })}
              {/* <a href="#" className="nav-link active">Daily</a>
              <a href="#" className="nav-link">Weekly</a>
              <a href="#" className="nav-link">Long term</a> */}
            </nav>
          </div>
          <div className="col-9">
            <ul>
              {tasks.map((task) => {
                return (
                  <li id={task.id}>{task.taskName}</li>
                );
              })}
            </ul>
            <label htmlFor="taskName" className="col-12 col-form-label">Task</label>
            <input id="taskName" className="form-control" type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
            <label htmlFor="taskType" className="col-12 col-form-label">Type</label>
            <select defaultValue="" className="form-select" aria-label="type" value={newTaskType} onChange={(e) => setNewTaskType(e.target.value)}>
              <option value="">Select a type</option>
              {taskTypes.map((taskType) => {
                return <option value={taskType}>{taskType}</option>
              })}
            </select>
            <button className="btn btn-primary" onClick={handleClick} style={{ color: 'white' }}>Add task</button>
          </div>
          
        </div>

      </div>
      <button className="btn btn-primary btn-lg rounded-pill position-absolute bottom-5 end-5" style={{ color: 'white' }}>+</button>
     
    </div>
  );
}


export default App;
