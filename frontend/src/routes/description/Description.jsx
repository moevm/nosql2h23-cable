import {useNavigate} from "react-router-dom";
import pic from './i.webp'

export default function (){
    const navigate = useNavigate();
    return (
        <div className={"flex justify-around h-full"}>
            <div style={{width:"max(50%,320px"}} className={"flex flex-col justify-stretch  gap-20"}>
                <div className={"flex"}>
                    <button onClick={()=>navigate(`/projects/${pid}`)}>Назад</button>
                </div>
                <div className={"flex flex-row"}>
                    <img  src={pic} width={250} height={250}/>
                    <span>Высокоскоростные кабели adp co ltd SZADP</span>
                </div>
                <span>Конструкция состоит из одного или нескольких изолированных друг от друга проводников (жил), или оптических волокон, заключённых в оболочку. Кроме жил и изоляции кабель может содержать экран, сердечник, заполнитель, стальную или проволочную броню, металлическую оболочку, внешнюю оболочку. Каждый конструктивный элемент нужен для работоспособности кабеля в определённых условиях среды</span>
            </div>
        </div>
    )
}