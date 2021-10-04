import useLongPress from "./useLongPress";

function TaskItem(props) {
    const onLongPress = () => {
        props.handleDelete(props.task.id)
    }

    const onClick = () => {
        console.log('click');
        props.handleCheck(props.task.id)
    }
    const defaultOptions = {
        shouldPreventDefault: true,
        delay: 500,
    };
    const longPressEvent = useLongPress(onLongPress, onClick, defaultOptions);

    

    return (
        // <li id={props.task.id} className="list-group-item">
        //     <input className="form-check-input" type="checkbox" value="" id={props.task.id + "-checkbox"}
        //         onChange={e => {props.handleCheck(props.task.id, e.target.checked);}}
        //         checked={props.task.finished}
        //      />
        //     {" "}<label className={`form-check-label ${props.task.finished? 'crossed' : ''}`} htmlFor={props.task.id + "-checkbox"}>
        //         {props.task.taskName}
        //     </label>
        //     <button onClick={(e) => props.handleDelete(e, props.task.id)}>delete</button>
        // </li>
        <button type="button" className={`list-group-item list-group-item-action ${props.task.finished ? 'crossed' : ''}`} {...longPressEvent} >{props.task.taskName}</button>
    )
}

export default TaskItem;