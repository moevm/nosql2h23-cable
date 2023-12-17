import {Link, useLoaderData, useNavigate} from "react-router-dom";
import axios from "axios";
import {apiHost} from "../../main.jsx";
import {useEffect, useState} from "react";
import FilterPopup from "./FilterPopup.jsx";
import useDebounce from "../../Debounce.jsx";



function ProjectEntry({data,number,checkboxes,checked,checkboxHandler}){
    return (
        <Link to={`projects/${data.id}`} className={"border-2 p-10 flex justify-between w-full"}>
            <span style={{flex: "10%"}}>{number}</span>
            <span style={{flex: "30%"}}>{data.name}</span>
            <span style={{flex: "30%"}}>{data.address}</span>
            <span style={{flex: "30%"}}>{new Date(data.date).toLocaleString()}</span>
            <span style={{flex: "20%"}}>{data.floors ? data.floors.length:0}</span>
            <span style={{flex: "20%"}}>{data.comment_count ? data.comment_count : 0}</span>
            <div style={{flex: "5%"}}>
                {checkboxes && <div>
                    <input checked={checked} onClick={(e) => {
                        e.stopPropagation();
                        checkboxHandler(data.id, e.currentTarget.checked);
                    }} type={"checkbox"}/>
                </div>}
            </div>
        </Link>
    )
}

function Projects() {
    const [data, setData] = useState(
        { page: 1, total: 0, projects:[] })
    const [exportMode,setExportMode] = useState(false);
    const [selectAll,setSelectAll] = useState(false);
    const [deleteMode,setDeleteMode] = useState(false);
    const [checkboxesVisible,setCheckboxesVisible] = useState(false);
    const [selected,setSelected] = useState([]);
    const [filterOpened,setFilterOpened] = useState(false);
    //const [filterSelected,setFilterSelected] = useState(7);

    const navigate = useNavigate();
    //const [searchText,setSearchText] = useState("")


    const [query,setQuery] = useState({
        name: undefined,
        address: undefined,
        fromDate: undefined,
        toDate: undefined,
        fromFloor: undefined,
        toFloor: undefined,
        fromComment: undefined,
        toComment: undefined
    })
    const searchQuery = useDebounce(query,300)


    useEffect(()=>{
        if(!data){
            axios.get(`${apiHost}/projects`).then(x=>setData(x.data))
        }
    },[])

    useEffect(()=>{
        setCheckboxesVisible(exportMode || deleteMode)
    },[exportMode,deleteMode])
    useEffect(()=>{
        setSelectAll(selected.length === data.projects.length)
    },[selected, data])
    useEffect(()=>{
        axios.get(`${apiHost}/projects`,{params:searchQuery})
            .then(x=>setData(x.data))

    },[searchQuery])
    let checkboxHandler = (id,value)=>{
        if(value){
            setSelected([...selected,id])
        }
        else {
            setSelected(selected.filter(x=>x!==id))
        }
    }
    let exportHandler = ()=>{
        if (!exportMode) {
            setExportMode(true)
        }
        else {
            axios.post(`${apiHost}/projects/export`,{projects: selected}).then(x=>{
                const json = JSON.stringify(x.data, null, 2);
                const blob = new Blob([json], { type: "application/json" });
                const href = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = href;
                link.download = "export.json";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
        }
    }
    let deleteHandler = ()=>{
        if(!deleteMode){
            setDeleteMode(true)
        }
        else {
            axios.post(`${apiHost}/projects/delete`,{projects: selected}).then(
                x =>
                    axios.get(`${apiHost}/projects`).then(y=> setData(y.data))
            )
        }
    }
    let cancelHandler = ()=>{
        setExportMode(false);
        setDeleteMode(false);
       // setSelected([]);
    }
    let selectAllHandler = (value)=>{
        setSelectAll(value)
        if(value){
            setSelected(data.projects.map(x=>x.id))
        }
        else {
            setSelected([])
        }
        console.log(value)
    }

    return (
        <div onClick={()=>setFilterOpened(false)} className={"flex flex-col light-panel-bg  justify-start w-full h-full"}>
            <div className={"flex justify-between items-center w-full light-panel-bg px-10 py-2"}>
                <span className={"text-2xl"}>Список проектов</span>
                <div className={"flex justify-start"}>
                    <div className={"relative"}>
                        {/*<input placeholder={"Поиск"} value={searchText} onInput={searchHandler}/>*/}

                        <button
                            className={"button"}
                            onClick={(e)=>{setFilterOpened(true);e.stopPropagation()}}>{"Поиск"}</button>
                        <FilterPopup
                            setQuery={setQuery}
                            query={query}
                            open={filterOpened}
                            leaveHandler={()=>setFilterOpened(false)}></FilterPopup>
                    </div>
                </div>

            </div>
            <div className={"flex justify-between w-full"}>
                <div  className={"flex flex-col justify-between w-full"}>

                    <div className={"flex justify-between w-full"}>
                        <div className={"w-full"}>
                            {checkboxesVisible && <div className={"flex w-full justify-end"}>
                                <input checked={selectAll} type={"checkbox"} onClick={ (e)=>selectAllHandler(e.currentTarget.checked)}/>
                                <span>Выбрать все</span>
                            </div>}
                            <div className={"px-10 flex justify-between w-full"}>
                                <span style={{flex: "10%"}}>Номер</span>
                                <span style={{flex: "30%"}}>Название</span>
                                <span style={{flex: "30%"}}>Адрес</span>
                                <span style={{flex: "30%"}}>Дата</span>
                                <span style={{flex: "20%"}}>Кол-во этажей</span>
                                <span style={{flex: "20%"}}>Кол-во комментариев</span>
                                <div style={{flex: "5%"}}/>
                            </div>
                            {data && data.projects.map((x,i)=>
                                <ProjectEntry number={i+1} data={x} checked={!!selected.find(y=>y===x.id)} checkboxes={checkboxesVisible} checkboxHandler={checkboxHandler}/>
                            )}
                        </div>

                    </div>
                </div>
                <div  className={"flex flex-col justify-start p-2 w-1/12"}>
                    {!exportMode && !deleteMode && <>
                        <button className={"button"} onClick={(e)=>navigate("/projects/new")}>+</button>
                        <button className={"button"}onClick={(e)=>navigate("/import")}>Импорт</button>
                    </>
                    }
                    {!deleteMode && <button className={"button"} onClick={exportHandler}>Экспорт</button>}
                    {!exportMode && <button className={"button"} onClick={deleteHandler}>Удалить</button>}
                    {(deleteMode || exportMode) &&
                        <button className={"button"} onClick={cancelHandler}>Отмена</button>
                    }
                </div>
            </div>
        </div>
    )
}

export default Projects