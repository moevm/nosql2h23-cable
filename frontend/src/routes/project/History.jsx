import {Link, useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import {apiHost} from "../../main.jsx";

export default function (){
    const { pid } = useParams();
    const navigate = useNavigate();
    const [versions,setVersions]=useState([])


    useEffect(()=>{
        axios.get(`${apiHost}/project/${pid}/history`).then(x=>{
            setVersions(x.data.history)
        })
    },[])

    return (
        <div className={"flex justify-center light-panel-bg h-screen"}>
            <div style={{width:"max(50%,320px"}} className={"flex flex-col justify-start  gap-3 h-full"}>
                <div className={"flex"}>
                    <button onClick={()=>navigate(`/projects/${pid}`)}>Назад</button>
                </div>
                <div className={"flex flex-col justify-start overflow-y-scroll"}>
                    {versions.sort((a,b)=>Date.parse(b.date)-Date.parse(a.date)).map(x=>{
                        return <div className={"bg-gray-400 flex justify-between"}>
                            <span>{new Date(x.date).toLocaleString()}</span>
                            <Link to={`/projects/${x.id}`}>
                                <span>Перейти</span>
                            </Link>
                        </div>
                    })}
                </div>
            </div>
        </div>
    )
}