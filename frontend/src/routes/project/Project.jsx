import {redirect, useNavigate, useParams} from "react-router-dom";

function Components(){
    return (
        <div className={"bg-gray-400"}>
            stats
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
    if(params.fid===undefined){
        return redirect(`/projects/${params.pid}/floor/1`)
    }
    return null;
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
    const { pid,fid } = useParams();
    const navigate = useNavigate();

    const handleFloorButton = (event)=>{
        navigate(`/projects/${pid}/floor/${event.currentTarget.id}`)
    }

    const floors = 5
    return (
        <div style={{maxHeight:"100vh"}} className={"flex w-full justify-between gap-2 h-full"}>
            <div style={{flex:"25%"}} className={"flex flex-col justify-around h-full"}>
                <Components />
                <CableProperties />
            </div>
            <div style={{flex:"60%"}} className={"h-full"} >
                <div className={"flex justify-between"}>
                    <div  className={"flex flex-col"}>
                        <span>Название</span>
                        <span>Адрес</span>
                    </div>
                    <span>{(new Date()).toLocaleString()}</span>
                    <button>История изменений</button>
                </div>
                <div className={"bg-gray-400  w-full"}>
                    <div className={"flex justify-end w-full"}>
                        <button>Загрузить план этажа</button>
                    </div>
                    <div className={"flex justify-start w-full"}>
                        <button>Добавить маршрутизатор</button>
                        <button>Добавить кабель</button>
                        <button>Удалить</button>
                    </div>
                    <div className={"flex justify-center w-full"}>
                        <img className={"w-full m-8"} src={"https://i.ytimg.com/vi/n7X10oIqugU/hqdefault.jpg?sqp=-oaymwEcCNACELwBSFXyq4qpAw4IARUAAIhCGAFwAcABBg==&rs=AOn4CLBa3UtEU4ykVN2A07XIisWHq64AqA"}/>
                    </div>
                </div>
                <div >
                    <button>Отмена</button>
                    <button onClick={()=>navigate(`/projects/${pid}/comments`)}>Комментарии</button>
                    <button>Сохранить</button>
                </div>
            </div>
            <div style={{flex:"15%"}} className={"flex flex-col justify-center h-full"}>
                <button>+</button>
                { Array.from(Array(floors).keys()).reverse().map(x=>{
                        if (x+1 === Number(fid)) {
                            return <button style={{backgroundColor:"blue"}}>{x + 1}</button>
                        }
                        else {
                            return <button id={(x + 1).toString()} onClick={handleFloorButton}>{x + 1}</button>
                        }
                    }
                )
                }
            </div>
        </div>
    )
}

export default Project