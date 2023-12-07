import {useNavigate, useParams} from "react-router-dom";

export default function (){
    const { pid } = useParams();
    const navigate = useNavigate();
    return (
        <div className={"flex justify-center h-full"}>
            <div style={{width:"max(50%,320px"}} className={"flex flex-col justify-between  gap-3"}>
                <div className={"flex"}>
                    <button onClick={()=>navigate(`/projects/${pid}`)}>Назад</button>
                </div>
                <div>

                </div>
            </div>
        </div>
    )
}