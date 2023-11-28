import {Link, useLoaderData, useNavigate} from "react-router-dom";
import axios from "axios";
import {apiHost} from "../../main.jsx";

function ProjectEntry(props){
    return (
        <Link to={`projects/${props.data.id}`} className={"border-2 p-10 flex justify-between w-full"}>
        <span style={{flex:"10%"}}>{props.number}</span>
        <span style={{flex:"30%"}}>{props.data.name}</span>
        <span style={{flex:"30%"}}>{props.data.address}</span>
        <span style={{flex:"30%"}}>{new Date(props.data.date).toLocaleString()}</span>
    </Link>
    )
}

export function projectListLoader(){
    return axios.get(`${apiHost}/projects`)
}

function Projects() {
    let data = useLoaderData().data
    console.log(data)
    const navigate = useNavigate();
    return (
        <div>
            <div className={"flex justify-between w-full"}>
                <span>Список проектов</span>
                <input placeholder={"Поиск"}/>
            </div>
            <div className={"flex justify-between w-full"}>
                <div className={"w-full"}>
                    {data.projects.map((x,i)=>ProjectEntry({number:i+1,data:x}))}
                </div>
                <div  className={"flex flex-col justify-start w-1/12"}>
                    <button onClick={(e)=>navigate("/projects/new")}>+</button>
                    <button>Импорт</button>
                    <button>Экспорт</button>
                    <button>Удалить</button>
                </div>
            </div>
        </div>
    )
}

export default Projects