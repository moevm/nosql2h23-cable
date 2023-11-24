import {Link, useLoaderData} from "react-router-dom";

function ProjectEntry(props){
    return (
        <Link to={`projects/${props.data.id}`} className={"border-2 p-10 flex justify-between w-full"}>
        <span style={{flex:"10%"}}>{props.number}</span>
        <span style={{flex:"30%"}}>{props.data.name}</span>
        <span style={{flex:"30%"}}>{props.data.address}</span>
        <span style={{flex:"30%"}}>{props.data.date.toLocaleDateString()}</span>
    </Link>
    )
}

export function projectListLoader(){
    return [
        {id:"1",name:"Проект1",address:"add1r",date:new Date()},
        {id:"2",name:"Проект13",address:"add4234342342342342r2",date:new Date()},
        {id:"3",name:"Проект532351",address:"ad1r",date:new Date()},
        {id:"4",name:"Проект1353",address:"add42343442342r2",date:new Date()}
    ]
}

function Projects() {
    let data = useLoaderData()
    return (
        <div>
            <div className={"flex justify-between w-full"}>
                <span>Список проектов</span>
                <input placeholder={"Поиск"}/>
            </div>
            <div className={"flex justify-between w-full"}>
                <div className={"w-full"}>
                    {data.map((x,i)=>ProjectEntry({number:i+1,data:x}))}
                </div>
                <div  className={"flex flex-col justify-start w-1/12"}>
                    <button>+</button>
                    <button>Импорт</button>
                    <button>Экспорт</button>
                    <button>Удалить</button>
                </div>
            </div>
        </div>
    )
}

export default Projects