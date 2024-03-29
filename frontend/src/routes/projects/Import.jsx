import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {apiHost} from "../../main.jsx";
import axios from "axios";

export default function (){
    const navigate = useNavigate();

    const [file, setFile] = useState()

    function handleChange(event) {
        setFile(event.target.files[0])
    }

    function handleSubmit(event) {
        event.preventDefault()
        const url = `${apiHost}/projects/import`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };
        axios.post(url, formData, config).then((response) => {
            navigate('/')
            console.log(response.data);
        }).catch(x=>{
            console.log("import error")
        });

    }

    return (
        <div className={"flex justify-center h-full"}>
            <div style={{width:"max(50%,320px"}} className={"flex flex-col justify-start  gap-3"}>
                <div className={"flex"}>
                    <button onClick={()=>navigate(`/`)}>Назад</button>
                </div>
                <div>
                    <form onSubmit={handleSubmit}>
                        <h1>File Upload</h1>
                        <input type="file" onChange={handleChange}/>
                        <button type="submit">Загрузить</button>
                    </form>
                </div>
            </div>
        </div>
    )
}