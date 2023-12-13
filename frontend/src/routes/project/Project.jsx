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

function Components({components}){
    return (
        <div className={"bg-gray-400 p-5"}>
           <input placeholder={"Поиск"}/>
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

function CableProperties(){
    return (
        <div className={"bg-gray-400 flex flex-col items-start p-8"}>
            <div className={"flex justify-center w-full"}>
                <span>Параметры кабеля</span>
            </div>
            <div className={"flex flex-col w-full"}>
                <span>Длина (м)</span>
                <input/>
                <span>Тип</span>
                <input/>
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
    const [error,setError] = useState(false)
    let projectState = useSelector(state => state.projectEditorState)
    useEffect(()=>{
        if(projectLoaded){
            let floor = projectState.floors.find(x=>x.floor === +fid)

            if(!floor){
                navigate(`/projects/${pid}/floor/1`)
            }
            else {
                console.log("floor here")
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

    console.log(projectState)
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
            <div style={{flex:"25%"}} className={"flex flex-col justify-around h-full"}>
                <button onClick={()=>navigate("/")}>{"<- К проектам"}</button>
                <Components components={projectLoaded?floors.find(x=>x.floor === floor).components:[]}/>
                <CableProperties />
            </div>
            <div style={{flex:"70%"}} className={"h-full"} >
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
                <div className={"bg-gray-400  w-full p-5"}>
                    <div className={"flex justify-end w-full"}>
                        <button>Загрузить план этажа</button>
                    </div>
                    <div className={"flex justify-start w-full"}>
                        <button>Добавить маршрутизатор</button>
                        <button>Добавить кабель</button>
                        <button>Удалить</button>
                    </div>
                    <div className={"flex justify-center w-full"}>
                        <Editor clas ="width:1600px; height:900px;position: relative"/>
                    </div>
                </div>
                <div className={"flex justify-between p-5"}>
                    <button>Отмена</button>
                    {projectState.saved && <button onClick={()=>navigate(`/projects/${pid}/comments`)}>Комментарии</button>}
                    <button onClick={handleSaveButton}>Сохранить</button>
                </div>
            </div>
            <div className={"w-20 flex flex-col justify-center items-center h-full gap-2"}>
                <div>
                    Этаж
                </div>

                <button className={"floor-button"}
                        onClick={(e)=>dispatch(addFloor(projectState.floors.length+1))}>+</button>
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
    )
}

export default Project