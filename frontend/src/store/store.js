import { configureStore} from "@reduxjs/toolkit";
import projectEditorReducer from "./projectEditorState.js"
export const store = configureStore({
    reducer: {
        projectEditorState: projectEditorReducer,
    },
})
