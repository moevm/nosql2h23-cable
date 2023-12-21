
function Checkbox({name,checked,handler}){
    return (<div className={"flex justify-between"}>
        <input checked={checked} onClick={handler} type={"checkbox"}/>
        <div style={{flex:"90%"}} className={"flex justify-start"}>
            <span>{name}</span>
        </div>
    </div>)
}

export default function ({open,leaveHandler,query,setQuery}){

    let handleChange = (e,n)=>{
        switch (n){
            case "content":
                setQuery({...query,content: e.currentTarget.value===""?undefined:e.currentTarget.value})
                break
            case "fromDate":
                setQuery({...query,fromDate: Number.isNaN(Date.parse(e.currentTarget.value))?undefined:new Date(e.currentTarget.value).toISOString()})
                break
            case "toDate":
                setQuery({...query,toDate: Number.isNaN(Date.parse(e.currentTarget.value))?undefined:new Date(e.currentTarget.value).toISOString()})
                break
        }
    }

    const convertDate = (date)=>{
        let d = new Date(date)

        return `${d.getFullYear()}-${
            d.getMonth().toLocaleString('en-US',{minimumIntegerDigits:2})}-${
            d.getDate().toLocaleString('en-US',{minimumIntegerDigits:2})}T${
            d.getHours().toLocaleString('en-US',{minimumIntegerDigits:2})}:${
            d.getMinutes().toLocaleString('en-US',{minimumIntegerDigits:2})}`
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
                <input value={convertDate(new Date(query.fromDate))}  onChange={(e)=>handleChange(e,"fromDate")} type={"datetime-local"}/>
            </div>
            <div className={"flex justify-between gap-2"}>
                <span>До</span>
                <input  value={convertDate(new Date(query.toDate))} onChange={(e)=>handleChange(e,"toDate")} type={"datetime-local"}/>
            </div>
            <div className={"flex justify-between gap-2"}>
                <span>Содержимое</span>
                <input value={query.content} onChange={(e)=>handleChange(e,"content")}  type={"text"}/>
            </div>
        </div>)
}