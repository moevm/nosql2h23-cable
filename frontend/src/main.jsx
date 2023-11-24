import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {createBrowserRouter,RouterProvider} from "react-router-dom";
import Projects, {projectListLoader} from "./routes/projects/Projects.jsx";
import Project, {projectLoader} from "./routes/project/Project.jsx";
import Comments, {commentsLoader} from "./routes/comments/Comments.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Projects/>,
        loader: projectListLoader
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
      <RouterProvider router={router} />
  </React.StrictMode>,
)
