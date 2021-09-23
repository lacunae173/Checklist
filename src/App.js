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
    // document.body.setAttribute('data-bs-spy', 'scroll')
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
    <div>

    <div className="row">
      <div className="col-3">

        <nav id="type-nav" className="navbar navbar-light position-fixed">
          <ul className="nav nav-vertab flex-column ">
            {taskTypes.map((taskType) => {
              return <li className="nav-item">
                <a href={"#" + taskType} className="nav-link">{taskType}</a>
              </li>
            })}

          </ul>
        </nav>
        {/* <nav className="nav nav-vertab flex-column position-fixed" id="type-nav">
              
              <a href="#" className="nav-link active">Daily</a>
              <a href="#" className="nav-link">Weekly</a>
              <a href="#" className="nav-link">Long term</a>
            </nav> */}
      </div>

      <div className="col-9">
        <div data-bs-spy="scroll" data-bs-target="#type-nav" data-bs-offset="0" className="scrollspy-example" tabindex="0">
          {taskTypes.map((taskType, idx) => {
            return (
              <div><h4 id={taskType}>{taskType}</h4>
                <p>You may need to discover what is removing the scrollbar from your Electron application, and then adapt from there. For example, I use App.js in my Electron application. By inspecting on the elements in the developer tools, I discovered App.js gives the body of the html a class name .app-no-scrollbar, and this gives the view a style with no scrollbar. The easy solution is to add $('body').removeClass('app-no-scrollbar') at the bottom of the javascript file (yes, I'm using jQuery), and this allows the scrollbar to show as normal.</p></div>

            )
          })}
        </div>
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
        <select className="form-select" aria-label="type" value={newTaskType} onChange={(e) => setNewTaskType(e.target.value)}>
          <option value="">Select a type</option>
          {taskTypes.map((taskType) => {
            return <option value={taskType}>{taskType}</option>
          })}
        </select>
        <button className="btn btn-primary" onClick={handleClick} style={{ color: 'white' }}>Add task</button>
      </div>

    </div>

      <button className="btn btn-primary btn-lg rounded-pill position-fixed bottom-5 end-5" style={{ color: 'white' }}>+</button>
  </div>
  );
}


export default App;
