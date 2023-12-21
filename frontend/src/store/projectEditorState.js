import { createSlice } from '@reduxjs/toolkit'
import {act} from "react-dom/test-utils";

const initialState = {
    id: undefined,
    name: "Новый проект",
    address: "Адрес не указан",
    date: undefined,
    saved: false,
    comment_count: 0,
    floors: [
        {
            floor: 1,
            components: [],
        }
    ],
    changed: []
}

export const projectEditorSlice = createSlice({
    name: 'projectEditorState',
    initialState,
    reducers: {
        loadProject: (state, action) => {
            state = {...action.payload}
            state.changed={}
            return state
        },
        loadFloor: (state, action) => {
            let floor = {
                ...action.payload,
                components:action.payload.components?action.payload.components:[]
            }
            let found =  state.floors.find(x=>x.floor === floor.floor)

            found.components = floor.components
            state.changed= []
        },
        initProject: (state, action) => {
            state = {...initialState}
            state.changed=[]
            state.changed.push({action:"set",field:"name",value: state.name})
            state.changed.push({action:"set",field:"address",value: state.address})
            state.changed.push({action:"add",field:"floor",value: {floor: 1, components: []}})
            return state
        },
        setName: (state, action) => {
            state.saved = false
            state.name = action.payload
            state.changed.push({action:"set",field:"name",value: state.name})
        },
        setDate: (state, action) => {
            state.saved = false
            state.date = action.payload
            state.changed.push({action:"set",field:"date",value: state.date})
        },
        setAddress: (state, action) => {
            state.saved = false
            state.address = action.payload
            state.changed.push({action:"set",field:"address",value: state.address})
        },
        setSaved: (state, action) => {
            state.saved = action.payload
            if(state.saved === true){
                state.changed = []
            }
        },
        addFloor: (state, action) => {
            state.saved = false
            state.floors.push({floor: action.payload, components: []})
            state.changed.push({action:"add",field:"floor",value: {floor: action.payload, components: []}})

        },
        changeComponent: (state, action) => {
            state.saved = false
            let floor = state.floors.find(x=>x.floor === action.payload.floor)
            state.changed.push({action:"set",field:"component",value:
                    {floor: action.payload.floor,
                        component: action.payload.component}})

            if(action.payload.component.id !== undefined){
                let c=floor.components.find(x=>x.id===action.payload.component.id)
                floor.components = [...floor.components.filter(x=>
                    x.type !== "router" ||
                    x.id!==action.payload.component.id),{...c,...action.payload.component}]
            }
            else {
                let c=floor.components.find(x=>x.start===action.payload.component.start && x.end===action.payload.component.end)
                floor.components = [...floor.components.filter(x=>
                    x.type !== "cable" &&
                    x.start!==action.payload.component.start || x.end!==action.payload.component.end),{...c,...action.payload.component}]
            }

        },
        addComponent: (state, action) => {
            state.saved = false
            state.floors.find(x=>x.floor === action.payload.floor).components.push(action.payload.component)
            state.changed.push({action:"add",field:"component",value:
                    {floor: action.payload.floor,
                        component: action.payload.component}})

        },
        removeComponents: (state, action) => {
            state.saved = false

            // this.components=this.components.filter(x => !this.selectionArray.includes(x))
            //         this.cables=this.cables.filter(x => !this.selectionArray.find(y=> y.id===x.start ||  y.id===x.end || x===y))
            //

            let floor = state.floors.find(x=>x.floor === action.payload.floor)
            action.payload.components.forEach(x=>{
                state.changed.push({action:"del",field:"component",value:
                        {floor: action.payload.floor,
                            component: x}})
            })
            let routers = action.payload.components.filter(x=>x.type==="router").map(x=>x.id)
            floor.components = floor.components.filter(x => !routers.includes(x.id))
            let cables = action.payload.components.filter(x=>x.type==="cable")
            floor.components = floor.components.filter(x => !routers.includes(x.start) && !routers.includes(x.end))
            floor.components = floor.components.filter(x => !cables.find(y=>y.start===x.start && y.end===x.end))
        },
        removeFloor: (state, action) => {
            state.saved = false
            state.floors=state.floors.filter(x=> x.floor !== action.payload)
            state.changed.push({action:"del",field:"floor",value: {floor: action.payload}})
        },
    },
})

// Action creators are generated for each case reducer function
export const {
    setSaved,
    loadProject,
    initProject,
    setDate,
    setName,
    setAddress,
    addFloor,
    loadFloor,
    addComponent,
    removeComponents,
    changeComponent,
    removeFloor
} = projectEditorSlice.actions

export default projectEditorSlice.reducer