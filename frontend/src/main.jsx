import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {createBrowserRouter,RouterProvider} from "react-router-dom";
import Projects from "./routes/projects/Projects.jsx";
import Project from "./routes/project/Project.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Projects/>,
    },
    {
        path: "/projects/:id",
        element: <Project />,
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
