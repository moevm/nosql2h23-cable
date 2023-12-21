import {useState} from "react";

function Checkbox({name,checked,handler}){
    return (<div className={"flex justify-between"}>
        <input checked={checked} onClick={handler} type={"checkbox"}/>
        <div style={{flex:"90%"}} className={"flex justify-start"}>
            <span>{name}</span>
        </div>
    </div>)
}


export default function ({open,leaveHandler,query,setQuery}){



    console.log(query)

    let handleChange = (e,n)=>{
        switch (n){
            case "name":
                setQuery({...query,name: e.currentTarget.value===""?undefined:e.currentTarget.value})
                break
            case "address":
                setQuery({...query,address: e.currentTarget.value===""?undefined:e.currentTarget.value})
                break
            case "fromDate":
                setQuery({...query,fromDate: Number.isNaN(Date.parse(e.currentTarget.value))?undefined:new Date(e.currentTarget.value).toISOString()})
                break
            case "toDate":
                setQuery({...query,toDate: Number.isNaN(Date.parse(e.currentTarget.value))?undefined:new Date(e.currentTarget.value).toISOString()})
                break
            case "fromFloor":
                setQuery({...query,fromFloor: e.currentTarget.value===""?undefined:+e.currentTarget.value})
                break
            case "toFloor":
                setQuery({...query,toFloor: e.currentTarget.value===""?undefined:+e.currentTarget.value})
                break
            case "fromComments":
                setQuery({...query,fromComment: e.currentTarget.value===""?undefined:+e.currentTarget.value})
                break
            case "toComments":
                setQuery({...query,toComment: e.currentTarget.value===""?undefined:+e.currentTarget.value})
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
            <div className={"flex justify-between gap-2"}>
                <span>Название</span>
                <input value={query.name} onChange={(e)=>handleChange(e,"name")}  type={"text"}/>
            </div>
            <div className={"flex justify-between gap-2"}>
                <span>Адрес</span>
                <input value={query.address} onChange={(e)=>handleChange(e,"address")}  type={"text"}/>
            </div>
            <span>По дате:</span>
            <div className={"flex justify-between gap-2"}>
                <span>От</span>
                <input value={convertDate(new Date(query.fromDate))} onChange={(e)=>handleChange(e,"fromDate")} type={"datetime-local"}/>
            </div>
            <div className={"flex justify-between gap-2"}>
                <span>До</span>
                <input value={convertDate(new Date(query.toDate))} onChange={(e)=>handleChange(e,"toDate")}  type={"datetime-local"}/>
            </div>
            <span>По этажам:</span>
            <div className={"flex justify-between gap-2"}>
                <span>От</span>
                <input value={query.fromFloor} onChange={(e)=>handleChange(e,"fromFloor")}  type={"number"}/>
            </div>
            <div className={"flex justify-between gap-2"}>
                <span>До</span>
                <input value={query.toFloor} onChange={(e)=>handleChange(e,"toFloor")}  type={"number"}/>
            </div>
            <span>По комментариям:</span>
            <div className={"flex justify-between gap-2"}>
                <span>От</span>
                <input value={query.fromCommnt} onChange={(e)=>handleChange(e,"fromComments")} type={"number"}/>
            </div>
            <div className={"flex justify-between gap-2"}>
                <span>До</span>
                <input value={query.toComment} onChange={(e)=>handleChange(e,"toComments")} type={"number"}/>
            </div>

        </div>)
}