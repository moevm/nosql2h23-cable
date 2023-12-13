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
                        <img className={"w-full m-8"} src={"data:image/png;base64,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"}/>
                    </div>
                </div>
                <div className={"flex justify-between p-5"}>
                    <button>Отмена</button>
                    <button onClick={()=>navigate(`/projects/${pid}/comments`)}>Комментарии</button>
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