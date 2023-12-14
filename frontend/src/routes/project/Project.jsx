import {redirect, useFetcher, useLoaderData, useNavigate, useParams, useRevalidator} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {
    addFloor,
    initProject,
    loadFloor,
    loadProject,
    setAddress,
    setDate,
    setName, setSaved
} from "../../store/projectEditorState.js";
import {store} from "../../store/store.js";
import {useEffect, useState} from "react";
import axios from "axios";
import {apiHost} from "../../main.jsx";
import NotFound from "../NotFound.jsx";
import Editor from "./Editor.jsx";
import routerSvg from "../../assets/router.svg"

function Components({components}){
    return (
        <div className={"panel-bg p-5 w-full"}>
           <input className={"w-full"} placeholder={"Поиск"}/>
            <div>
                {components?components.map(x=>{
                    return <div>
                        <span>{x.name}</span>
                    </div>
                }):""}
            </div>
        </div>
    )
}

function Properties(){
    return (
        <div className={"bg-gray-400"}>
            Параметры
    </div>
    )
}

export async function projectLoader({params}){
    if(params.fid === undefined){
        return redirect(`/projects/${params.pid}/floor/1`)
    }
}

export async function newProjectLoader({params}){
    console.log("new")
    store.dispatch(initProject());
    return redirect(`/projects/new/floor/1`)

}

function CableProperties({data}){
    return (
        <div className={"panel-bg flex flex-col w-full items-start p-8"}>
            <div className={"flex justify-center w-full"}>
                <span>Параметры кабеля</span>
            </div>
            <div className={"flex flex-col w-full"}>
                <span>Длина (м)</span>
                <input/>
                <span>Тип</span>
                <input value={data.model}/>
            </div>
        </div>

    )
}
function RouterProperties({data}){
    return (
        <div className={"w-full panel-bg flex flex-col items-start p-8"}>
            <div className={"flex justify-center w-full"}>
                <span>Параметры маршрутизатора</span>
            </div>
            <div className={"flex flex-col w-full"}>
                <span>Название</span>
                <input value={data.name}/>
                <span>Модель</span>
                <input value={data.model}/>
            </div>
        </div>

    )
}

function Project(){

    const [projectLoaded,setProjectLoaded] = useState(false)

    const { pid,fid } = useParams();
    const [floor,setFloor] = useState(+fid)
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const [selected,setSelected] = useState()
    const [error,setError] = useState(false)
    let projectState = useSelector(state => state.projectEditorState)
    useEffect(()=>{
        if(projectLoaded){
            let floor = projectState.floors.find(x=>x.floor === +fid)

            if(!floor){
                navigate(`/projects/${pid}/floor/1`)
            }
            else {
                if(projectLoaded && !floor.components) {
                    axios.get(`${apiHost}/project/${pid}/floor/${fid}`)
                        .then(x=> dispatch(loadFloor(x.data)))
                }
            }
        }
        else {
                if (pid !== "new") {
                    axios.get(`${apiHost}/project/${pid}`)
                        .then(x => {
                            setError(false)
                            dispatch(loadProject(x.data))
                            setProjectLoaded(true)

                        }).catch(x=>setError(true))
                }
        }
    },[projectLoaded,floor])

    if(error){
        return <NotFound/>
    }

    let floors = [...projectState.floors]

    const handleFloorButton = (event)=>{
        setFloor(+event.currentTarget.id)
        navigate(`/projects/${pid}/floor/${event.currentTarget.id}`)
    }
    const handleSaveButton = (event)=>{
        axios.post(`${apiHost}/project/${pid}/save`,projectState.changed).then(x=>{
            if(x.status === 201){
                dispatch(setSaved(true))
                navigate(`/projects/${x.data.id}/floor/${fid}`)
            }
            else{
                console.log("not saved")
            }
        })
    }

    return (
        <div style={{maxHeight:"100vh"}} className={"flex w-full justify-between gap-2 h-full"}>
            <div style={{flex:"25%"}} className={"flex flex-col gap-5 justify-start h-full w-1/4"}>
                <button onClick={()=>navigate("/")}>{"<- К проектам"}</button>
                <Components components={projectLoaded?floors.find(x=>x.floor === floor).components:[]}/>
                {selected && (selected.type === "router"?<RouterProperties data={selected}/>:<CableProperties data={selected}/>)}
            </div>
            <div style={{flex:"70%"}} className={"flex flex-col justify-between h-full"} >
                <div className={"flex justify-between p-5"}>
                    <div  className={"flex flex-col"}>
                        <input type={"text"}
                               value={projectState.name}
                               onChange={(e)=>{dispatch(setName(e.currentTarget.value))}}
                        />
                        <input type={"text"}
                               value={projectState.address}
                               onChange={(e)=>{dispatch(setAddress(e.currentTarget.value))}}
                        />
                    </div>
                    <span>{projectState.date?new Date(projectState.date).toLocaleString():""}</span>
                    <button onClick={()=>navigate(`/projects/${pid}/history`)}>История изменений</button>
                </div>
                <div className={"flex flex-col panel-bg  w-full p-5 h-full"}>
                    {projectState && <Editor data={projectState} onSelection={setSelected}/>}
                </div>
                <div className={"flex justify-between p-5"}>
                    <button>Отмена</button>
                    {pid!=="new" && <button onClick={()=>navigate(`/projects/${pid}/comments`)}>Комментарии</button>}
                    <button onClick={handleSaveButton}>Сохранить</button>
                </div>
            </div>
            <div className={"w-20 flex flex-col justify-center items-center h-full"}>
                <div>
                    Этаж
                </div>

                <button className={"floor-button"}
                        onClick={(e)=>dispatch(addFloor(projectState.floors.length+1))}>+</button>
                <div className={"flex flex-col overflow-y-scroll max-h-full w-full items-center p-2 scroll-hidden gap-2"}>
                    { floors.sort((a,b)=>-a.floor+b.floor).map(x=>{
                            if (x.floor === Number(fid)) {
                                return <button className={"floor-button"}
                                               style={{backgroundColor:"blue"}}>{x.floor}</button>
                            }
                            else {
                                return <button className={"floor-button"}
                                               id={(x.floor).toString()}
                                               onClick={handleFloorButton}>{x.floor}</button>
                            }
                        }
                    )
                    }
                </div>
            </div>
        </div>
    )
}

export default Project