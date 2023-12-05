import {useLoaderData, useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {apiHost} from "../../main.jsx";
import {setSaved} from "../../store/projectEditorState.js";
import {useRef, useState} from "react";

function Comment(props){
    return (
        <div className={"flex gap-2 justify-between"}>
            <span>{new Date(props.data.date).toLocaleString()}</span>
            <div className={"bg-gray-400 w-3/4"}>
                <span className={"w-full whitespace-normal break-all"}>
                    {props.data.text}
                </span>
            </div>
        </div>
    )
}

export async function commentsLoader({params}){
    return axios.get(`${apiHost}/project/${params.pid}/comments`)
}

export default function (){
    const { pid } = useParams();
    const navigate = useNavigate()
    let comments = useLoaderData().data
    let [text,setText] = useState("")
    const handleSendButton = (event)=>{
        axios.post(`${apiHost}/project/${pid}/comment`,{text:text}).then(x=>{
            if(x.status === 201){
                setText("")
                comments.comments.push(x.data)

            }
            else{
                console.log("not saved")
            }
        })
    }

    return (
        <div className={"flex justify-center h-full"}>
            <div style={{width:"max(50%,320px"}} className={"flex flex-col justify-between  gap-3"}>
                <div className={"flex"}>
                    <button onClick={()=>navigate(`/projects/${pid}`)}>Назад</button>
                </div>
                <div className={"overflow-y-scroll"}>
                    <div className={"flex flex-col gap-5 justify-start h-full"}>{
                        comments.comments.map(x=><Comment data={x}/>)
                    }
                </div>

                </div>
                <div className={"flex justify-between h-1/3"}>
                    <div>
                        <button onClick={handleSendButton}>Отправить</button>
                    </div>

                    <textarea value={text} onChange={(e)=>setText(e.currentTarget.value)} className={"bg-gray-400 w-3/4 h-full "} rows={5}/>
                </div>
            </div>
        </div>
    )
}