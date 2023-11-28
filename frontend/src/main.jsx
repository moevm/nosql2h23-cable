import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {createBrowserRouter,RouterProvider} from "react-router-dom";
import Projects, {projectListLoader} from "./routes/projects/Projects.jsx";
import Project, {newProjectLoader, projectLoader} from "./routes/project/Project.jsx";
import Comments, {commentsLoader} from "./routes/comments/Comments.jsx";
import {store} from "./store/store.js";
import {Provider} from "react-redux";

export let apiHost = "http://localhost:3000"

const router = createBrowserRouter([
    {
        path: "/",
        element: <Projects/>,
        loader: projectListLoader
    },
    {
        path: "/projects/new",
        element: <Project />,
        loader: newProjectLoader
    },
    {
        path: "/projects/:pid",
        element: <Project />,
        loader: projectLoader
    },
    {
        path: "/projects/:pid/floor/:fid",
        element: <Project />,
    },
    {
        path: "/projects/:pid/comments",
        element: <Comments />,
        loader: commentsLoader
    },
    {
        path: "*",
        element: <div>404</div>,
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
  </React.StrictMode>,
)
