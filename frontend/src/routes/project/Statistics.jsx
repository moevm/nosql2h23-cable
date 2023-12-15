export default function (){
    return (
        <div className={"flex justify-around h-full"}>
            <div style={{width: "max(50%,320px"}} className={"flex flex-col justify-stretch gap-10"}>
                <div className={"flex"}>
                    <button onClick={() => navigate(`/projects/${pid}`)}>Назад</button>
                </div>
                <div className={"grid grid-cols-3 justify-start"}>
                    <div>Фильтр поиска</div>
                    <div>Список обородудования</div>
                    <div>Номер этажей</div>
                </div>
                <span>Статистика</span>
                <span>Тут какая-нибудь информация о том, что есть в проекте. Тут же функция, которая выводит значения.</span>
            </div>
        </div>
    )
}