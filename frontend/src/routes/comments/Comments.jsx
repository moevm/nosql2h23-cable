import {useLoaderData} from "react-router-dom";

function Comment(props){
    return (
        <div className={"flex gap-2 justify-between"}>
            <span>{props.data.date.toLocaleDateString()}</span>
            <div className={"bg-gray-400 w-3/4"}>
                <span>
                    {props.data.text}
                </span>
            </div>
        </div>
    )
}

export async function commentsLoader(){
    return [{date:new Date(),text:"Because you can return or throw responses in loaders and actions, you can use redirect to redirect to another route.\n" +
            "\n" +
            "import { redirect } from \"react-router-dom\";\n" +
            "\n" +
            "const loader = async () => {\n" +
            "  const user = await getUser();\n" +
            "  if (!user) {\n" +
            "    return redirect(\"/login\");\n" +
            "  }\n" +
            "  return null;\n" +
            "};\n" +
            "It's really just a shortcut for this:\n" +
            "\n" +
            "new Response(\"\", {\n" +
            "  status: 302,\n" +
            "  headers: {\n" +
            "    Location: someUrl,\n" +
            "  },\n" +
            "});\n" +
            "It's recommended to use redirect in loaders and actions rather than useNavigate in your components when the redirect is in response to data.\n" +
            "\n" +
            "See also:"},
        {date:new Date(),text:"234"},
            {
                date:new Date(),text:"Что нужно заложить под натяжной потолок, чтобы после его не пришлось снимать? В моих ремонтах вы часто видите натяжные потолки, на которые установлены светильники, гардины и даже рельсы шкафа-купе, а потолки при этом не прогибаются и на них не образуются складки. Сегодня расскажу, как мы это делаем:)"
            },
        {
            date:new Date(),text:"1) Закладные под декоративные перегородки. Как правило, мы добавляем эти закладные, если у заказчика разнополые дети и нам через несколько лет нужно будет разделить детскую комнату на две зоны. Как правило, для этих целей мы используем лёгкие ажурные конструкции, которые не перекрывают световой поток, но при этом зонируют комнату. При этом, мы заранее определяем габариты и сечение будущих перегородок, чтобы установить закладные соответствующего размера. "
        }
    ]
}

export default function (){
    const comments = useLoaderData()
    return (
        <div className={"flex justify-center h-full"}>
            <div style={{width:"max(50%,320px"}} className={"flex flex-col justify-between  gap-3"}>
                <div className={"flex"}>
                    <button>Назад</button>
                </div>
                <div className={"overflow-y-scroll"}>
                    <div className={"flex flex-col gap-5 justify-start h-full"}>{
                        comments.map(x=><Comment data={x}/>)
                    }
                </div>

                </div>
                <div className={"flex justify-between h-1/3"}>
                    <div>
                        <button>Отправить</button>
                    </div>

                    <textarea className={"bg-gray-400 w-3/4 h-full "} rows={5}/>
                </div>
            </div>
        </div>
    )
}