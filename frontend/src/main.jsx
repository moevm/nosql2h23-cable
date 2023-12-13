import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {createBrowserRouter,RouterProvider} from "react-router-dom";
import Projects from "./routes/projects/Projects.jsx";
import Project, {newProjectLoader, projectLoader} from "./routes/project/Project.jsx";
import Comments from "./routes/project/Comments.jsx";
import {store} from "./store/store.js";
import {Provider} from "react-redux";
import Description from "./routes/description/Description.jsx";
import History from "./routes/project/History.jsx";
import Statistics from "./routes/project/Statistics.jsx";
import Import from "./routes/projects/Import.jsx";

export let apiHost = "http://localhost:3000"

const router = createBrowserRouter([
    {
        path: "/",
        element: <Projects/>,
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
    },
    {
        path: "/description",
        element: <Description />,
    },
    {
        path: "/projects/:pid/history",
        element: <History />,
    },
    {
        path: "/projects/:pid/statistics",
        element: <Statistics />,
    },
    {
        path: "/import",
        element: <Import />,
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
