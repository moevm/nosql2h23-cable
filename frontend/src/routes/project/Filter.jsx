
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
            className={"flex flex-col absolute border-2 bg-red-600"}>
            <Checkbox checked={selected === 5} handler={(e)=>handleCheck(e,5)} name={"По всем"}/>
            <Checkbox checked={selected & 1} handler={(e)=>handleCheck(e,1)} name={"По содержимому"}/>
            {/*<Checkbox checked={selected & 2} handler={(e)=>handleCheck(e,2)} name={"По адресу"}/>*/}
            <Checkbox checked={selected & 4} handler={(e)=>handleCheck(e,4)} name={"По дате"}/>
        </div>)
}