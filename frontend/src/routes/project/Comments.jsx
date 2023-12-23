import {useLoaderData, useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {apiHost} from "../../main.jsx";
import {setSaved} from "../../store/projectEditorState.js";
import {useEffect, useRef, useState} from "react";
import FilterPopup from "./Filter.jsx";
import useDebounce from "../../Debounce.jsx";



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

export default function (){
    const { pid } = useParams();
    const navigate = useNavigate()
    let [comments,setComments] = useState({comments:[]})
    let [text,setText] = useState("")
    const [searchText,setSearchText] = useState("")
    const [filterOpened,setFilterOpened] = useState(false);
    //const [filterSelected,setFilterSelected] = useState(5);
    const [query,setQuery] = useState({
        fromDate: undefined,
        toDate: undefined,
        content: undefined
    })
    const searchQuery = useDebounce(query,300)

    useEffect(()=>{
        axios.get(`${apiHost}/project/${pid}/comments`).then(x=>setComments(x.data))
    },[])

    useEffect(()=>{
        console.log("request",searchQuery)
        axios.get(`${apiHost}/project/${pid}/comments`,{params:searchQuery})
            .then(x=>setComments(x.data))

    },[searchQuery])

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
        <div onClick={()=>setFilterOpened(false)} className={"flex justify-center light-panel-bg h-full"}>

                <div style={{width:"max(50%,320px"}} className={"flex flex-col justify-between  gap-3"}>
                    <div className={"flex justify-around"}>
                        <button className={"button"} onClick={() => navigate(`/projects/${pid}`)}>Назад</button>
                        <div className={"flex justify-normal"}>
                            <button
                                onClick={(e) => {
                                    setFilterOpened(true);
                                    e.stopPropagation()
                                }}>{"Поиск"}</button>
                            <FilterPopup
                                setQuery={setQuery}
                                query={query}
                                open={filterOpened}
                                leaveHandler={()=>setFilterOpened(false)}></FilterPopup>
                        </div>
                    </div>
                    <div className={"overflow-y-scroll"}>
                        <div className={"flex flex-col gap-5 justify-start h-full"}>
                            {
                            comments && comments.comments.sort((a,b)=>Date.parse(a.date) - Date.parse(b.date)).map(x => <Comment data={x} />)
                            }
                    </div>

                    </div>
                    <div className={"flex justify-between h-1/3"}>
                        <div>
                            <button className={"button"} onClick={handleSendButton}>Отправить</button>
                        </div>

                        <textarea onKeyPress={(e)=>{if(e.key === 'Enter') handleSendButton(e)}} value={text} onChange={(e)=>setText(e.currentTarget.value)} className={"bg-gray-400 w-3/4 h-full "} rows={5}/>
                    </div>
                </div>
        </div>
    )
}