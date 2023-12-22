import {redirect, useFetcher, useLoaderData, useNavigate, useParams, useRevalidator} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {
    addComponent,
    addFloor, changeComponent,
    initProject,
    loadFloor,
    loadProject, removeComponents, removeFloor,
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
import useDebounce from "../../Debounce.jsx";

function Components({components,onSelected,selected}){
    const navigate = useNavigate()
    const {pid} = useParams()
    console.log(selected)
    return (
        <div className={"flex flex-col panel-bg p-5 w-full gap-2"}>
            <span>Список компонентов</span>
           <input className={"w-full"} placeholder={"Поиск"}/>
            <div className={"flex flex-col justify-start items-start"}>
                {(components && components.components) ? components.components.filter(x=>x.name).sort((a,b)=>a.name.localeCompare(b.name)).map(x => {
                    return <div>
                        <button className={"light-button"} style={{backgroundColor:(selected &&  x.id===selected.id)?"blue":"#D9D9D9"}} onClick={()=>onClick(x.id)}>{x.name}</button>
                    </div>
                }) : ""}
            </div>
            <button className={"button light-button"} onClick={() => navigate(`/projects/${pid}/statistics`)}>Статистика</button>

        </div>
    )
}

function Properties() {
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
    const dispatch = useDispatch()
    const { fid } = useParams();
    const [len,setLen]=useState(0)
    const lenReq = useDebounce(len,500)
    const [model,setModel]=useState("default")
    const modelReq = useDebounce(model,500)

    useEffect(()=>{
        setModel(data.model)
        setLen((data.len))
    },[])

    useEffect(()=>{
        dispatch(changeComponent({floor:+fid,component:{...data,type:"cable", len: lenReq}}))
        console.log("est")
    },[lenReq])
    useEffect(()=>{
        dispatch(changeComponent({floor:+fid,component:{...data,type:"cable", model: modelReq}}))
    },[modelReq])


    return (
        <div className={"panel-bg flex flex-col w-full items-start p-8"}>
            <div className={"flex justify-center w-full"}>
                <span>Параметры кабеля</span>
            </div>
            <div className={"flex flex-col w-full"}>
                <span>Длина (м)</span>
                <input value={len} onChange={(e)=> setLen(e.currentTarget.value)}/>
                <span>Тип</span>
                <input value={model} onChange={(e)=>setModel(e.currentTarget.value)}/>
            </div>
        </div>

    )
}
function RouterProperties({data}){
    const dispatch = useDispatch()
    const { fid } = useParams();

    const [name,setName]=useState("")
    const nameReq = useDebounce(name,500)
    const [model,setModel]=useState("default")
    const modelReq = useDebounce(model,500)

    useEffect(()=>{
        setName(data.name)
        setModel((data.model))
    },[])

    useEffect(()=>{
        dispatch(changeComponent({floor:+fid,component:{id:data.id,type:"router",name:nameReq}}))
    },[nameReq])
    useEffect(()=>{
        dispatch(changeComponent({floor:+fid,component:{id:data.id,type:"router",model:modelReq}}))
    },[modelReq])


    return (
        <div className={"w-full panel-bg flex flex-col items-start p-8"}>
            <div className={"flex justify-center w-full"}>
                <span>Параметры маршрутизатора</span>
            </div>
            <div className={"flex flex-col w-full"}>
                <span>Название</span>
                <input value={name} onChange={(e)=>setName(e.currentTarget.value)}/>
                <span>Модель</span>
                <input value={model} onChange={(e)=>setModel(e.currentTarget.value)}/>
            </div>
        </div>

    )
}

function Project(){

    const [projectLoaded,setProjectLoaded] = useState(false)
    const [floorLoaded,setFloorLoaded] = useState(false)
    const { pid,fid } = useParams();
    const [floor,setFloor] = useState(+fid)
    const dispatch = useDispatch()
    const navigate = useNavigate();
    const [selected,setSelected] = useState()
    const [error,setError] = useState(false)
    let projectState = useSelector(state => state.projectEditorState)
    const saveRequest = useDebounce(projectState,2000)

    const [name,setNameState] =useState("")
    const [address,setAddressState] =useState("")

    const debounceName = useDebounce(name,500)
    const debounceAddress = useDebounce(address,500)

    useEffect(()=>{
        if(projectLoaded){
            let floor = projectState.floors.find(x=>x.floor === +fid)

            setNameState(projectState.name)
            setAddressState(projectState.address)
            if(!floor){
                navigate(`/projects/${pid}/floor/1`)
            }
            else {
                if(projectLoaded) {
                    if(floor.components){
                        setFloorLoaded(true)
                    }
                    else {
                        axios.get(`${apiHost}/project/${pid}/floor/${fid}`)
                            .then(x => {
                                dispatch(loadFloor(x.data));
                                setFloorLoaded(true)
                            })
                    }
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

    useEffect(()=>{
        if(projectLoaded && saveRequest.saved === false){
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

    },[saveRequest])

    useEffect(()=>{
        dispatch(setName(debounceName))
    },[debounceName])
    useEffect(()=>{
        dispatch(setAddress(debounceAddress))
    },[debounceAddress])


    if(error){
        return <NotFound/>
    }

    const handleChange = (e) =>{

        if(e.action==="add")
        {
            dispatch(addComponent({floor:+fid,component:e.component}))
        }
        if(e.action==="set")
        {
            dispatch(changeComponent({floor:+fid,component:e.component}))
        }
        if(e.action==="del")
        {
            dispatch(removeComponents({floor:+fid,components:e.components}))
        }
        console.log(e)
    }


    let floors = [...projectState.floors]
    let currentFloor = floors.find(x=>x.floor===+fid)

    const handleFloorButton = (event)=>{
        setFloorLoaded(false)
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
    let selectedRouter
    let selectedCable
    if(floorLoaded && currentFloor.components && selected){

    selectedRouter = currentFloor.components.find(x=>x.id===selected.id)
    selectedCable = currentFloor.components.find(x=>x.start===selected.start && x.end===selected.end)
    }
    return (
        <div style={{maxHeight:"100vh"}} className={"flex w-full justify-between light-panel-bg gap-2 h-full"}>
            <div style={{flex:"25%"}} className={"flex flex-col gap-5 justify-start h-full w-1/4"}>
                <button className={"button"} onClick={()=>navigate("/")}>{"<- К проектам"}</button>
                <Components components={floors.find(x=>x.floor === floor)} selected={selected}/>
                {selectedRouter && selectedRouter.type==="router" && <RouterProperties data={selectedRouter}/>}
                {selectedCable && selectedCable.type==="cable" && <CableProperties data={selectedCable}/>}

            </div>
            <div style={{flex:"70%"}} className={"flex flex-col justify-between h-full"} >
                <div className={"flex justify-between p-5"}>
                    <div  className={"flex flex-col"}>
                        <input type={"text"} className={"text-2xl light-panel-bg"}
                               value={name}
                               onChange={(e)=>{setNameState(e.currentTarget.value)}}
                        />
                        <input type={"text"} className={"light-panel-bg"}
                               value={address}
                               onChange={(e)=>{setAddressState(e.currentTarget.value)}}
                        />
                    </div>
                    <div  className={"flex flex-col"}>
                        <span>{projectState.date?new Date(projectState.date).toLocaleString():""}</span>
                        {pid!=="new"?( projectState.saved?"Изменения сохранены":"Сохранение..."):"Проект не сохранен"}
                    </div>

                    <button className={"button"} onClick={()=>navigate(`/projects/${pid}/history`)}>История изменений</button>
                </div>
                <div className={"flex flex-col panel-bg  w-full p-5 h-full"}>
                    {floorLoaded && <Editor data={projectState.floors.find(x=>x.floor===+fid)} onSelection={setSelected} onChange={handleChange}/>}
                </div>
                <div className={"flex justify-between p-5"}>
                    <button className={"button"} >Отмена</button>
                    {pid!=="new" && <button className={"button"}  onClick={()=>navigate(`/projects/${pid}/comments`)}>Комментарии</button>}
                    {pid === "new" && <button className={"button"}  onClick={handleSaveButton}>Сохранить</button>}
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
                <button className={"floor-button"}
                        onClick={(e)=>dispatch(removeFloor(projectState.floors.length))}>-</button>
            </div>
        </div>
    )
}

export default Project