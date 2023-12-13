import {useEffect, useRef} from "react";

let editor

class Editor{
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d');
        this.mousePressed = false
        this.cableStarted = undefined
        this.grabOffset = {x:0,y:0}
        this.selectedComponent = undefined
        this.components=[]
        this.cables=[]
        this.initCanvas()

    }

    initCanvas(){
        this.canvas.style.width="50vw";
        this.canvas.style.height="50vh";
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
    getCanvasCoordinates(pos) {
        let canvasBox = this.canvas.getBoundingClientRect()
        return {
            x: pos.x-canvasBox.x,
            y: pos.y-canvasBox.y,
        }
    }

    mouseright(e){
        let pos = this.getCanvasCoordinates(e)
        console.log(this.cables)
        e.preventDefault()
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

    mousedown(e){
        let pos = this.getCanvasCoordinates(e)

        if((e.which === 3 || e.button === 2)) {}
        else {
            this.mousePressed = true
            console.log("down")
            let c = this.getElementNearPos(pos, 10)
            let cable = this.getCableNearPos(pos, 4)
            if (c) {
                this.selectedComponent = c
                this.grabOffset = {
                    x: this.selectedComponent.pos.x - pos.x,
                    y: this.selectedComponent.pos.y - pos.y
                }
                this.draw()
            }
            else if(cable){
                this.selectedComponent = cable
                this.draw()
            }
            else {
                this.selectedComponent = undefined
                this.addComponent(pos)
            }
        }

    }
    mouseup(e)
    {
        this.mousePressed = false
        console.log("up")
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
        }

    }

    addComponent(pos){
        this.components.push({
            name:"123",
            type:"321",
            id: this.components.length,
            pos: pos
        })
        this.draw()
    }

    addCable(comp1,comp2){

        this.cables.push({
            name:"132",
            type:"321",
            start:comp1.id,
            end:comp2.id
        })
        this.draw()
    }

    drawComponent(c){
        if(this.selectedComponent === c)
        {
            this.ctx.fillStyle = 'green';
            this.ctx.beginPath();
            this.ctx.arc(c.pos.x, c.pos.y, 12, 0, 2 * Math.PI , true);
            this.ctx.fill();
        }
        this.ctx.fillStyle = 'gray';
        this.ctx.beginPath();
        this.ctx.arc(c.pos.x, c.pos.y, 10, 0, 2 * Math.PI , true);
        this.ctx.fill();
    }

    drawCable(c){

        let comp1 = this.components.find(x=>x.id === c.start)
        let comp2 = this.components.find(x=>x.id === c.end)
        if(this.selectedComponent === c) {
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(comp1.pos.x,comp1.pos.y)
            this.ctx.lineTo(comp2.pos.x,comp2.pos.y)

            this.ctx.strokeStyle='green'
            this.ctx.stroke();
        }
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(comp1.pos.x,comp1.pos.y)
        this.ctx.lineTo(comp2.pos.x,comp2.pos.y)

        this.ctx.strokeStyle='#bdbdbd'
        this.ctx.stroke();
    }

    draw(){
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for(let cable of this.cables){
            this.drawCable(cable)
        }
        for(let component of this.components){
            this.drawComponent(component)
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


}



export default function (){
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!editor){
            editor = new Editor(canvas)
            //editor.draw()
        }


    }, []);

    return <canvas ref={canvasRef} className={"w-full h-full"}> </canvas>
}