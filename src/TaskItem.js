import useLongPress from "./useLongPress";

function TaskItem(props) {
    

    const onLongPress = () => {
        props.handleDelete(props.task.id);
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
        <button type="button" 
            className={`list-group-item list-group-item-action ${props.task.finished ? 'crossed' : ''}`} 
            {...longPressEvent} >
                {props.task.taskName}
        </button>

        
    )
}

export default TaskItem;