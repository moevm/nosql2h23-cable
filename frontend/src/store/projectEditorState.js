import { createSlice } from '@reduxjs/toolkit'

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
            let compList = state.floors.find(x=>x.floor === action.payload.floor).components
            let comp =
                compList.find(x=>{return action.payload.component.type==="router"?(x.id === action.payload.component.id):
                    (x.start === action.payload.component.start && x.end === action.payload.component.end)})
            compList=compList.filter(x=>x!==comp)
            compList.push({...comp,...action.payload.component})
            console.log(compList)
            state.floors.find(x=>x.floor === action.payload.floor).components=compList
            state.changed.push({action:"set",field:"component",value:
                    {floor: action.payload.floor,
                        component: action.payload.component}})
            return state

        },
        addComponent: (state, action) => {
            state.saved = false
            state.floors.find(x=>x.floor === action.payload.floor).components.push(action.payload.component)
            state.changed.push({action:"add",field:"component",value:
                    {floor: action.payload.floor,
                        component: action.payload.component}})

        },
        removeComponent: (state, action) => {
            state.saved = false
            //находим список компонентов на этаже
            let compList = state.floors.find(x=>x.floor === action.payload.floor).components
            //ищем компонент по айди или айди начала и конца если кабель
            let comp =
                compList.find(x=>{return action.payload.component.type==="router"?(x.id === action.payload.component.id):
                    (x.start === action.payload.component.start && x.end === action.payload.component.end)})
            //удаляем
            compList=compList.filter(x=>x!==comp)
            state.changed.push({action:"del",field:"component",value:
                    {floor: action.payload.floor,
                        component: action.payload.component}})

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
    removeComponent,
    changeComponent,
    removeFloor
} = projectEditorSlice.actions

export default projectEditorSlice.reducer