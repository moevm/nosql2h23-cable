import {Link, useNavigate, useParams} from "react-router-dom";

export default function (){
    const { pid } = useParams();
    const navigate = useNavigate();
    const versions=[{
        date: new Date().toISOString(),
        id: 123
    }]
    return (
        <div className={"flex justify-center h-full"}>
            <div style={{width:"max(50%,320px"}} className={"flex flex-col justify-start  gap-3"}>
                <div className={"flex"}>
                    <button onClick={()=>navigate(`/projects/${pid}`)}>Назад</button>
                </div>
                <div className={"flex flex-col justify-start"}>
                    {versions.map(x=>{
                        return <div className={"bg-gray-400"}>
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