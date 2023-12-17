import {useEffect, useRef, useState} from "react";
import routerSvg from "../../assets/router.svg";
import cableSvg from "../../assets/cable.svg";
import deleteSvg from "../../assets/delete.svg";
import planSvg from "../../assets/plan.svg";
import cursorSvg from "../../assets/cursor.svg";
let editor

class Editor{
    constructor() {
        this.mousePressed = false
        this.cableStarted = undefined
        this.grabOffset = {x:0,y:0}
        this.selectedComponent = undefined
        this.areaSelectionCallback=undefined
        this.selectionCallback=undefined
        this.selectionArea=undefined
        this.componentsCallback=undefined
        this.selectionArray=[]
        this.plan = undefined
        this.components=[]
        this.cables=[]
    }

    initCanvas(canvas){
        this.mousePressed = false
        this.selectedComponent = undefined
        this.cableStarted = undefined
        this.canvas = canvas
        this.ctx = canvas.getContext('2d');
        this.canvas.style.width="100%";
        this.canvas.style.height="100%";
        this.resize()
        this.canvas.style.imageRendering="crisp-edges"
        this.canvas.addEventListener('mousedown',(e)=>this.mousedown(e))
        this.canvas.addEventListener('mouseup',(e)=>this.mouseup(e))
        this.canvas.addEventListener('mousemove',(e)=>this.mousemove(e))
        this.canvas.addEventListener('contextmenu',(e)=>this.mouseright(e))
        window.addEventListener('resize',(e)=>this.resize())
    }
    resize(){
       // console.log("resize")
        //
        this.canvas.width = this.canvas.clientWidth
        this.canvas.height = this.canvas.clientHeight
        this.draw()
    }

    changeSelection(component){
        if(component){
            this.selectionArray=[component]
        }
        else
        {
            this.selectionArray=[]
        }
        this.selectedComponent = component
        if(this.selectionCallback){
            this.selectionCallback(component)
        }
        if(this.areaSelectionCallback){
            this.areaSelectionCallback( this.selectionArray)
        }

    }

    getCanvasCoordinates(pos) {
        let canvasBox = this.canvas.getBoundingClientRect()
        return {
            x: pos.x-canvasBox.x,
            y: pos.y-canvasBox.y,
        }
    }

    mouseright(e){
        let pos = this.getCanvasCoordinates(e)
        e.preventDefault()


    }

    mousedown(e){
        let pos = this.getCanvasCoordinates(e)
        if(this.mousePressed ) return
        this.mousePressed = true
        if(this.tool===0){
            this.cableStarted=undefined
            let c = this.getElementNearPos(pos, 10)
            let cable = this.getCableNearPos(pos, 4)
            if (c) {

                this.changeSelection(c)
                this.grabOffset = {
                    x: this.selectedComponent.pos.x - pos.x,
                    y: this.selectedComponent.pos.y - pos.y
                }
            }
            else if(cable){
                this.changeSelection(cable)
            }
            else{
                this.cableStarted=undefined
                this.changeSelection(undefined)
                this.selectionArea = {start:pos,end:pos}
            }

            this.draw()
        }
        else if (this.tool===1)
        {
            let c = this.getElementNearPos(pos, 10)
            this.cableStarted=undefined
            this.changeSelection(undefined)
            if (c) return
            this.addComponent(pos)
        }
        else if (this.tool===2)
        {
            console.log('cable')
            let c = this.getElementNearPos(pos, 15)
            if(c && this.cableStarted !== undefined && c !== this.cableStarted)
            {
                if(!this.cables.find(x=>
                    (x.start === c.id && x.end === this.cableStarted.id)
                    ||
                    (x.start === this.cableStarted.id && x.end === c.id)
                )) {
                    this.addCable(this.cableStarted, c)
                }
                this.cableStarted = undefined
            }
            else {
                this.cableStarted = c
            }
        }
    }
    mouseup(e)
    {
        this.mousePressed = false
        this.selectionArea=undefined
        this.draw()
    }
    mousemove(e)
    {
        let pos = this.getCanvasCoordinates(e)

        if(this.mousePressed){
           // this.ctx.fillStyle = 'red';
            //this.ctx.fillRect(pos.x, pos.y, 5, 5);
            //console.log("move")

            if(this.selectedComponent){
                this.selectedComponent.pos = {
                    x:pos.x+this.grabOffset.x,
                    y:pos.y+this.grabOffset.y
                }
                this.draw()
            }
            if(this.selectionArea){
                this.selectionArea.end=pos

                this.selectionArray = [
                    ...this.components.filter((x)=>this.isInSelection(x.pos)),
                    ...this.cables.filter(c=> {
                        let comp1 = this.components.find(x=>x.id === c.start)
                        let comp2 = this.components.find(x=>x.id === c.end)
                        return this.isInSelection({x: (comp1.pos.x+comp2.pos.x)/2,y: (comp1.pos.y+comp2.pos.y)/2})
                    })]
                if(this.areaSelectionCallback){
                    this.areaSelectionCallback( this.selectionArray)
                }
                this.draw()
            }

        }
        if(this.cableStarted){
            this.draw()
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(this.cableStarted.pos.x,this.cableStarted.pos.y)
            this.ctx.lineTo(pos.x,pos.y)

            this.ctx.strokeStyle='#ff2e2e'
            this.ctx.stroke();
        }

    }

    isInSelection(pos){
        return pos.x > Math.min(this.selectionArea.start.x,this.selectionArea.end.x)
        &&
        pos.x < Math.max(this.selectionArea.start.x,this.selectionArea.end.x)
        &&
        pos.y > Math.min(this.selectionArea.start.y,this.selectionArea.end.y)
        &&
        pos.y < Math.max(this.selectionArea.start.y,this.selectionArea.end.y)
    }

    newId(){
        let id = 0
        while (this.components.find(x=>x.id === id)) id++
        return id
    }

    addComponent(pos){
        this.components.push({
            type:"router",
            id: this.newId(),
            pos: pos
        })
        if(this.componentsCallback){
            this.componentsCallback({components:this.components,cables:this.cables})
        }

        this.draw()
    }

    addCable(comp1,comp2){

        this.cables.push({
            type:"cable",
            start:comp1.id,
            end:comp2.id
        })
        if(this.componentsCallback){
            this.componentsCallback({components:this.components,cables:this.cables})
        }
        this.draw()
    }

    drawComponent(c){
        if(this.selectionArray.find(x=>x === c))
        {
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(c.pos.x, c.pos.y, 12, 0, 2 * Math.PI , true);
            this.ctx.fill();
        }
        this.ctx.fillStyle = '#39c013';
        this.ctx.beginPath();
        this.ctx.arc(c.pos.x, c.pos.y, 10, 0, 2 * Math.PI , true);
        this.ctx.fill();
    }

    drawCable(c){

        let comp1 = this.components.find(x=>x.id === c.start)
        let comp2 = this.components.find(x=>x.id === c.end)
        if(this.selectionArray.find(x=>x === c)) {
            this.ctx.lineWidth = 8;
            this.ctx.beginPath();
            this.ctx.moveTo(comp1.pos.x,comp1.pos.y)
            this.ctx.lineTo(comp2.pos.x,comp2.pos.y)

            this.ctx.strokeStyle='black'
            this.ctx.stroke();
        }
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(comp1.pos.x,comp1.pos.y)
        this.ctx.lineTo(comp2.pos.x,comp2.pos.y)

        this.ctx.strokeStyle='#ff2e2e'
        this.ctx.stroke();
    }

    draw(){

        if(!this.plan){
            this.ctx.fillStyle = '#F8F8F8';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        else
        {
            this.ctx.fillStyle = '#F8F8F8';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            let imgaspect = this.plan.width/this.plan.height
            let canvasaspect = this.canvas.width/this.canvas.height

            if(imgaspect<canvasaspect){
                let x = this.canvas.width/2-this.canvas.height*imgaspect/2
                this.ctx.drawImage(this.plan,x, 0, this.canvas.height*imgaspect, this.canvas.height)
            }
            else{
                let y = this.canvas.height/2-this.canvas.width/imgaspect/2
                this.ctx.drawImage(this.plan,0, y, this.canvas.width, this.canvas.width/imgaspect)
            }

        }
        for(let cable of this.cables){
            this.drawCable(cable)
        }
        for(let component of this.components){
            this.drawComponent(component)
        }
        if(this.selectionArea){
            this.ctx.fillStyle = 'rgba(147,147,255,0.49)';
            this.ctx.fillRect(this.selectionArea.start.x,
                this.selectionArea.start.y,
                -this.selectionArea.start.x+this.selectionArea.end.x,
                -this.selectionArea.start.y+this.selectionArea.end.y);
        }

    }

    getElementNearPos(pos,tolerance) {
        return this.components.reverse().find(e=>
            Math.abs(e.pos.x - pos.x) <= tolerance && Math.abs(e.pos.y - pos.y) <= tolerance)
    }

    getCableNearPos(pos,tolerance) {
        return this.cables.reverse().find(e=>{
            let comp1 = this.components.find(x=>x.id === e.start)
            let comp2 = this.components.find(x=>x.id === e.end)
            return this.getDistToPoint(comp1.pos,comp2.pos,pos) <= tolerance
        })

    }
    setTool(tool){
        this.changeSelection(undefined)
        this.tool = tool
    }

    removeSelected(){
        this.components=this.components.filter(x => !this.selectionArray.includes(x))
        this.cables=this.cables.filter(x => !this.selectionArray.find(y=> y.id===x.start ||  y.id===x.end || x===y))
        this.selectionArray=[]
        if(this.areaSelectionCallback){
            this.areaSelectionCallback(this.selectionArray)
        }
        if(this.componentsCallback){
            this.componentsCallback({components:this.components,cables:this.cables})
        }
        this.draw()
    }

    getDistToPoint(start,end,point){
        let sx=start.x
        let sy=start.y
        let ex=end.x
        let ey=end.y
        let px=point.x
        let py=point.y

        let dot1 = (ex-sx)*(px-sx)+(ey-sy)*(py-sy)
        let dot2 = (sx-ex)*(px-ex)+(sy-ey)*(py-ey)
        if(dot1<0) return Math.sqrt((px-sx)*(px-sx)+(py-sy)*(py-sy))
        else if(dot2<0) return Math.sqrt((px-ex)*(px-ex)+(py-ey)*(py-ey))
        else {
            let a = Math.abs((px-sx)*(ey-sy)-(py-sy)*(ex-sx))
           return a / (2 * Math.sqrt((ex-sx)*(ex-sx)+(ey-sy)*(ey-sy)))
        }
    }
    setPlan(data){
        if(!this.plan)
            this.plan = new Image()
        this.plan.src = data
        setTimeout(()=> this.draw(),10)

    }

    loadFloor({components,cables}){
        this.cables=cables
        this.components=components
    }

}

function Hint({text}){
    return (
            <div className={"panel-bg absolute px-2 py-1 hint"}>
                {text}
            </div>
    )
}




export default function ({data,onSelection,onChange}){
    const canvasRef = useRef(null)
    const planInputRef = useRef(null)
    const [tool,setTool] = useState(0)
    const [deleteVisible,SetDeleteVisible] = useState(false)
    const [selected,setSelected] = useState()
    useEffect(() => {
        const canvas = canvasRef.current;
        if(!editor){
            editor = new Editor(canvas)

            //editor.draw()
        }
        else{
            console.log('exists')
            console.log(canvas)
        }
        editor.selectionCallback = (e)=>{
            setSelected(e)
            onSelection(e)
        }
        editor.componentsCallback = onChange
        editor.areaSelectionCallback = (e)=>{
            SetDeleteVisible(e.length > 0)
        }
        editor.initCanvas(canvas)
        editor.setTool(tool)



    }, []);

    const toolChangeHandler = (e)=>{
        setTool(e)
        editor.setTool(e)
    }

    const fileChangeHandler = (e)=>{
        if (FileReader && e.target.files && e.target.files.length) {
            let fr = new FileReader();
            fr.onload = ()=> {
                editor.setPlan(fr.result);
            }
            fr.readAsDataURL(e.target.files[0]);
        }
    }

    return (
        <div className={"flex flex-col w-full h-full"}>
            <div className={"flex justify-start w-full light-panel-bg"}>
                <button onClick={()=>toolChangeHandler(0)}
                    style={{backgroundColor:tool===0? "#9393ff":"#F8F8F8"}}
                    className={"editor-button flex justify-center items-center hint-button"}>
                    <img className={"w-4/5"} src={cursorSvg} alt={"Перемещение"}/>
                    <Hint text={"Перемещение"}/>
                </button>
                <button onClick={()=>toolChangeHandler(1)} style={{backgroundColor:tool===1? "#9393ff":"#F8F8F8"}}
                    className={"editor-button flex justify-center items-center hint-button"}>
                    <img className={"w-4/5"} src={routerSvg} alt={"Маршрутизатор"}/>
                    <Hint text={"Маршрутизатор"}/>
                </button>
                <button onClick={()=>toolChangeHandler(2)} style={{backgroundColor:tool===2? "#9393ff":"#F8F8F8"}}
                    className={"editor-button hint-button"}>
                    <img src={cableSvg} alt={"Кабель"}/>
                    <Hint text={"Кабель"}/>
                </button>
                {deleteVisible && <button onClick={()=>editor.removeSelected()}
                    className={"editor-button hint-button"}>
                    <img src={deleteSvg} alt={"Удалить"}/>
                    <Hint text={"Удалить"}/>
                </button>}
                <button onClick={(e)=>planInputRef.current.click()}
                    className={"editor-button flex justify-center items-center hint-button"}>
                    <img className={"w-3/4"} src={planSvg} alt={"План"}/>
                    <input ref={planInputRef} onChange={fileChangeHandler} className={"hidden"} type={"file"}/>
                    <Hint text={"План"}/>
                </button>
            </div>

            <canvas ref={canvasRef} className={"w-full h-full"}> </canvas>
        </div>
)
}