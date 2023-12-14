import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    id: undefined,
    name: "Новый проект",
    address: "Адрес не указан",
    date: undefined,
    saved: false,
    floors: [
        {
            floor: 1,
            components: undefined
        }
    ],
    changed: {}
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
            let floor = action.payload
            state.floors.find(x=>x.floor === floor.floor).components = floor.components
            return state
        },
        initProject: (state, action) => {
            state = {...initialState}
            state.changed={}
            state.changed.name = state.name
            state.changed.address = state.address
            state.changed.floors=[{floor: 1, components: []}]
            return state
        },
        setName: (state, action) => {
            state.saved = false
            state.name = action.payload
            state.changed.name = state.name
        },
        setDate: (state, action) => {
            state.saved = false
            state.date = action.payload
            state.changed.date = state.date
        },
        setAddress: (state, action) => {
            state.saved = false
            state.address = action.payload
            state.changed.address = state.address
        },
        setSaved: (state, action) => {
            state.saved = action.payload
            if(state.saved === true){
                state.changed = {}
            }
        },
        addFloor: (state, action) => {
            state.saved = false
            state.floors.push({floor: action.payload, components: []})
            if(!state.changed.floors){
                state.changed.floors=[{floor: action.payload, components: []}]
            }
            else {
                state.changed.floors.push({floor: action.payload, components: []})
            }

        },
        removeFloor: (state, action) => {
            state.saved = false
            state.floors=state.floors.filter(x=> x.floor !== action.payload)
            if(!state.changed.floors){
                state.changed.floors=[{floor: action.payload, delete: true}]
            }
            else {
                state.changed.floors.push({floor: action.payload, delete: true})
            }
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
    removeFloor
} = projectEditorSlice.actions

export default projectEditorSlice.reducer