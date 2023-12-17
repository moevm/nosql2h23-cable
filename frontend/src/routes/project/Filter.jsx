
function Checkbox({name,checked,handler}){
    return (<div className={"flex justify-between"}>
        <input checked={checked} onClick={handler} type={"checkbox"}/>
        <div style={{flex:"90%"}} className={"flex justify-start"}>
            <span>{name}</span>
        </div>
    </div>)
}

export default function ({open,leaveHandler,selected,setSelected}){

    let handleCheck = (e,n)=>{
        if( e.currentTarget.checked){
            setSelected(selected |= n)
        }
        else
        {
            setSelected(selected &= ~n)
        }


    }

    return (open &&
        <div
            style={{right:0}}
            onClick={e=>e.stopPropagation()}
            onMouseLeave={leaveHandler}
            className={"flex flex-col gap-2 absolute panel-bg p-10 shadow rounded"}>
            <span>По дате:</span>
            <div className={"flex justify-between gap-2"}>
                <span>От</span>
                <input type={"datetime-local"}/>
            </div>
            <div className={"flex justify-between gap-2"}>
                <span>До</span>
                <input type={"datetime-local"}/>
            </div>
            <div className={"flex justify-between gap-2"}>
                <span>Содержимое</span>
                <input type={"text"}/>
            </div>
        </div>)
}