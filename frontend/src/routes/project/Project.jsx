import { useParams } from "react-router-dom";

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

function Project(){
    const { id } = useParams();
    const floors = 5
    return (
        <div className={"flex w-full justify-between gap-2 h-full"}>
            <div style={{flex:"25%"}} className={"flex flex-col justify-around h-full"}>
                <Components />
                <Properties />
            </div>
            <div style={{flex:"60%"}} className={"bg-gray-400"}>center</div>
            <div style={{flex:"15%"}} className={"flex flex-col justify-center h-full"}>
                <button>+</button>
                { Array.from(Array(floors).keys()).reverse().map(x=>
                        <button>{x+1}</button>
                    )

                }
            </div>
        </div>
    )
}

export default Project