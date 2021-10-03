function TaskItem(props) {


    return (
        <li id={props.task.id} className="list-group-item">
            <input className="form-check-input" type="checkbox" value="" id={props.task.id + "-checkbox"}
                onChange={e => {props.handleCheck(props.task.id, e.target.checked);}}
                checked={props.task.finished}
             />
            {" "}<label className={`form-check-label ${props.task.finished? 'crossed' : ''}`} htmlFor={props.task.id + "-checkbox"}>
                {props.task.taskName}
            </label>
            <button onClick={(e) => props.handleDelete(e, props.task.id)}>delete</button>
        </li>
    )
}

export default TaskItem;