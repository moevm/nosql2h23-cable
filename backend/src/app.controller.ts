import {Body, Controller, Get, Param, Post, Query, Req, Res, UploadedFile, UseInterceptors} from '@nestjs/common';
import { AppService } from './app.service';
import { Neo4jService } from 'nest-neo4j'
import { DateTime } from 'neo4j-driver';
import * as defaultData from '../default projects/default.json'
import {FileInterceptor} from "@nestjs/platform-express";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private readonly neo4jService: Neo4jService
  ) {

    (async () => {
      const response = await this.neo4jService.read(`
      MATCH (n:Project) return n
      `)
      const projectList = response.records.map(x => x.get('n').properties)

      if (projectList.length == 0)
      {
        let projects = defaultData.projects
        
        projects.map(async p => {
            await this.neo4jService.write(`CREATE (p:Project {id: ${p.id},address: "${p.address}",name: "${p.name}",DateOfChange: datetime("${p.date}")})`)
            const floors = p.floors
            const comments = p.comments

            comments.map(async c => {
              await this.neo4jService.write(`
              MATCH(p:Project {id: ${p.id}}) 
              CREATE (p) <-[:COMMENT]- (c:Comment {comment_id: ${c.comment_id}, 
                comment_text: "${c.comment_text}", comment_date: datetime("${c.comment_date}")})
              `)
            })

            floors.map(async f => {
              await this.neo4jService.write(`MATCH(p:Project {id: ${p.id}}) 
            CREATE (p) <-[:FLOOR]- (f:Floor {number: ${f.number}, plan: "${f.plan}"})
            RETURN f`)
            })
        })
      }

      const routerinfo = defaultData.routerinfo
      const cableinfo = defaultData .cableinfo

      cableinfo.map(async cable =>{
        await this.neo4jService.write(`
        merge (n:CableInfo { cableinfo_id: ${cable.cableinfo_id}, photo: "${cable.photo}", description: "${cable.description}", type: "${cable.type}", DateOfCreation: datetime("${cable.DateOfCreation}") })
        return n
        `)
      })

      routerinfo.map(async router =>{
        await this.neo4jService.write(`
        merge (n:RouterInfo { cableinfo_id: ${router.routerinfo_id}, photo: "${router.photo}", description: "${router.description}", model: "${router.model}", DateOfCreation: datetime("${router.DateOfCreation}"), port_count: ${router.port_count} })
        return n
        `)
      })

    })()

  }

  @Get("/routerinfos")
  async getRouterInfos(): Promise<any> {
    return {
      routerinfos: defaultData.routerinfo
    }
  }

  @Get("/cableinfos")
  async getCableInfos(): Promise<any> {
    return {
      cableinfos: defaultData.cableinfo
    }
  }

  @Get("/projects")
  async getProjects(@Query() query): Promise<any> {
    
    let queryList = []
    if (query.name !== undefined) queryList.push(`n.name contains "${query.name}"`)
    if (query.address !== undefined) queryList.push(`n.address contains "${query.address}"`)
    if (query.fromDate !== undefined) queryList.push(`n.DateOfChange >= datetime("${query.fromDate}")`)
    if (query.toDate !== undefined) queryList.push(`n.DateOfChange <= datetime("${query.toDate}")`)
    if (query.fromFloor !== undefined) queryList.push(`countFloor >= ${query.fromFloor}`)
    if (query.toFloor !== undefined) queryList.push(`countFloor <= ${query.toFloor}`)
    if (query.fromComment !== undefined) queryList.push(`countComment >= ${query.fromComment}`)
    if (query.toComment !== undefined) queryList.push(`countComment <= ${query.toComment}`)

    let whereStr = ""

    if (queryList.length > 0)
    {
      whereStr += "where "
      for (let i = 0; i < queryList.length - 1; i++)
      {
        whereStr += queryList[i] + " and "
      }
      whereStr += queryList[queryList.length - 1]
    }

    const response = await this.neo4jService.read(`
    OPTIONAL MATCH (n:Project)<-[f:FLOOR]-(c:Floor) WITH n, count(c) as countFloor 
    OPTIONAL MATCH (n)<-[k:COMMENT]-(b:Comment) with n, countFloor, count(b) as countComment 
    ${whereStr}
    RETURN n, countFloor, countComment
    `)

    const projectList = response.records


    return {
      page: 1,
      total: projectList.length,
      projects: projectList.map(x => {
        let prop = x.get('n').properties
        return {
          id: prop.id.toNumber(),
          name: prop.name,
          date: prop.DateOfChange.toStandardDate(),
          saved: false,
          address: prop.address,
          comment_count: x.get('countComment').toNumber(),
          floors: Array.from({length: x.get('countFloor').toNumber()}, (_, i) => {return {floor: i + 1, components: []}}),
          changed: []
        }
      }),

    }
  }

  @Get("/project/:id")
  async getProject(@Param('id') id): Promise<any> {
    const response = await this.neo4jService.read(`MATCH (n:Project {id: ${id}})<-[f:FLOOR]-(c:Floor) WITH n, count(c) as countFloor RETURN n, countFloor`)
    const project = response.records[0].get('n').properties
    const floors = response.records[0].get('countFloor').toNumber()

    return {
      id: id,
      name: project.name,
      address: project.address,
      date: project.DateOfChange.toStandardDate(),
      saved: !false,
      floors: Array.from({length: floors}, (_, i) => {return {floor: i + 1}})
    }
  }

  @Get("/project/:id/floor/:floor")
  async getComponents(@Param('id') id,@Param('floor') floor): Promise<any> {

    const response = await this.neo4jService.read(
        `match (p:Project {id: ${id}})-[r:FLOOR]-(f:Floor {number: ${floor}})-[:ROUTER]-(c)
         return c`)

    const response2 = await this.neo4jService.read(
        `match (p:Project {id: ${id}})-[:FLOOR]-(f:Floor {number: ${floor}})-[:CABLE]-(c)
        optional match (r1:Router)-[:CONNECTED]-(c)-[:CONNECTED]-(r2:Router)
         return c,r1,r2`)

    const components = response.records.map(x=>
    {
      let props = x.get('c').properties
      return {...props,
      id:props.id.toNumber(),
      x:undefined,
      y:undefined,
      pos: {x:Number(props.x),y:Number(props.y)},
      type: x.get('c').labels[0].toLowerCase()}})

    const cables = response2.records.map(x=>
    {
      let props = x.get('c').properties
      return {...props,
        len: props.len.toNumber(),
        start: x.get('r1').properties.id.toNumber(),
        end: x.get('r2').properties.id.toNumber(),
        type: x.get('c').labels[0].toLowerCase()}}).filter(x=>x.start<x.end)
    return {
      floor: +floor,
      components: [...components,...cables]
    }
  }

  @Post("/project/:id/save")
  async saveChanges(@Body() changes, @Param('id') cid): Promise<any> {

    let id

    if (cid == 'new') {
      id = Date.now()
      const response = await this.neo4jService.write(`CREATE (p:Project {id: ${id},address: "",name: "",DateOfChange: datetime("${new Date().toISOString()}")})`)
    }
    else
    {
      id = +cid
    }

    for(let c of changes){
      if (c.action==="del"){
        //удалить этаж
        //удалить компонент
        if(c.field==="floor"){
          await this.neo4jService.write(
              `match (p:Project {id: ${id}})
              optional match (p)-[r]-(t:Floor {number: ${c.value.floor}})
              optional match (t)<-[q]-(c)
              detach delete r,t,q,c`)
        }
        else if(c.field==="component"){
          if(c.value.component.id!==undefined){
            await this.neo4jService.write(
                `match (p:Project {id: ${id}})
          optional match (p)-[]-(t:Floor {number: ${c.value.floor}})-[q]-(c  {id: ${c.value.component.id}})
          optional match (c)-[:CONNECTED]-(r)
          detach delete c,r`)
          }
          else {
            await this.neo4jService.write(
                  `match (p:Project {id: ${id}})-[:FLOOR]-(f:Floor {number: ${c.value.floor}})-[:CABLE]-(c)
                  match (r1:Router {id:${c.value.component.start}})-[:CONNECTED]-(c)-[:CONNECTED]-(r2:Router {id:${c.value.component.end}})
                  detach delete c`)
          }
        }
      }
      else if (c.action==="add"){
        if(c.field==="floor"){
          await this.neo4jService.write(`MATCH(p:Project {id: ${id}}) 
            CREATE (p) <-[:FLOOR]- (f:Floor {number: ${c.value.floor}, plan: ''})
          `)
        }
        else if(c.field==="component"){
          if(c.value.component.type==="router"){
            await this.neo4jService.write(`MATCH (p:Project {id: ${id}})-[:FLOOR]-(f:Floor {number: ${c.value.floor}})
            CREATE (f) <-[:ROUTER]- (r:Router {id: ${c.value.component.id},
             x:${c.value.component.pos.x},
             y:${c.value.component.pos.y},
             name:"${c.value.component.name}",
             model:"${c.value.component.model}"
             })
          `)
          }
          else{
            await this.neo4jService.write(`MATCH (p:Project {id: ${id}})-[:FLOOR]-(f:Floor {number: ${c.value.floor}})
            MATCH (f)-[:ROUTER]-(r1:Router {id:${c.value.component.start}})
            MATCH (f)-[:ROUTER]-(r2:Router {id:${c.value.component.end}})
            CREATE (f) <-[:CABLE]- (r:Cable {
             len: ${c.value.component.len},
             model: "${c.value.component.model}"
             })
             CREATE (r1)-[:CONNECTED]->(r)
             CREATE (r2)-[:CONNECTED]->(r)
          `)
          }
        }
      }
      else if (c.action==="set"){
        if(c.field==="name") {
          await this.neo4jService.write(`MATCH(p:Project {id: ${id}}) SET p.name = "${c.value}"`)
        }
        else if(c.field==="address") {
          await this.neo4jService.write(`MATCH(p:Project {id: ${id}}) SET p.address = "${c.value}"`)
        }
        else if(c.field==="component") {
          if(c.value.component.type==="router"){
            if(c.value.component.name){
              await this.neo4jService.write(`MATCH (p:Project {id: ${id}})-[:FLOOR]-(f:Floor {number: ${c.value.floor}})
              MATCH (f) <-[:ROUTER]- (r:Router {id: ${c.value.component.id}})
               SET r.name = "${c.value.component.name}"`)
            }
            if(c.value.component.model){
              await this.neo4jService.write(`MATCH (p:Project {id: ${id}})-[:FLOOR]-(f:Floor {number: ${c.value.floor}})
            MATCH (f) <-[:ROUTER]- (r:Router {id: ${c.value.component.id}})
             SET r.model = "${c.value.component.model}"`)
            }
            if(c.value.component.pos){
              await this.neo4jService.write(`MATCH (p:Project {id: ${id}})-[:FLOOR]-(f:Floor {number: ${c.value.floor}})
            MATCH (f) <-[:ROUTER]- (r:Router {id: ${c.value.component.id}})
             SET r.x = ${c.value.component.pos.x}
             SET r.y = ${c.value.component.pos.y}`)
            }
          }
          else {
            let req = `match (p:Project {id: ${id}})-[:FLOOR]-(f:Floor {number: ${c.value.floor}})-[:CABLE]-(c)
                  match (r1:Router {id:${c.value.component.start}})-[:CONNECTED]-(c)-[:CONNECTED]-(r2:Router {id:${c.value.component.end}})\n`
            if(c.value.component.len) {
              req+=`SET c.len = ${+c.value.component.len}\n`
            }
            if(c.value.component.model){
              req+=`SET c.model = "${c.value.component.model}"\n`
            }
            await this.neo4jService.write(req)
          }

        }
      }

      // Сохранение истории
      {

        const response = await this.neo4jService.read(
          `match (p:Project {id: ${id}})
           return p`)

        const response1 = await this.neo4jService.read(
          `match (p:Project {id: ${id}})-[r:FLOOR]-(f:Floor)-[:ROUTER]-(c)
           return c, f`)
  
        const response2 = await this.neo4jService.read(
            `match (p:Project {id: ${id}})-[:FLOOR]-(f:Floor)-[:CABLE]-(c)
            optional match (r1:Router)-[:CONNECTED]-(c)-[:CONNECTED]-(r2:Router)
            where r1.id < r2.id
            return f,c,r1,r2`)

        const response3 = await this.neo4jService.read(
          `match (p:Project {id: ${id}})-[:COMMENT]-(c:Comment)
          return c`)

        const response4 = await this.neo4jService.read(
          `match (p:Project {id: ${id}})-[:FLOOR]-(f:Floor)
            return f`)
  

        const projectNode = response.records.map(x=>{
            let props = x.get('p').properties
            return {
              ...props,
              id: props.id.toNumber(),
              DateOfChange: props.DateOfChange.toStandardDate()
            }
          })
        
        const floors = response4.records.map(x=>{
          let props = x.get('f').properties
          return {
            ...props,
            number: props.number.toNumber()
          }
        })

        const routers = response1.records.map(x=>
        {
          let props = x.get('c').properties
          let floor = x.get('f').properties.number.toNumber()

          return {
            floor: floor,
            router: {...props, id: props.id.toNumber()}
          }
        })
    
        const cables = response2.records.map(x=>
        {
          let props = x.get('c').properties
          let floor = x.get('f').properties.number.toNumber()

          return {
            floor: floor,
            cable: {
              ...props,
              len: props.len.toNumber(),
              start: x.get('r1').properties.id.toNumber(),
              end: x.get('r2').properties.id.toNumber()
            }
            }})

        const comments = response3.records.map(x => {
          let props = x.get('c').properties
          return {
            ...props,
            comment_id: props.comment_id.toNumber(),
            comment_date: props.comment_date
          }
        })

        let project = {
          id: Date.now(),
          name: projectNode[0].name,
          address: projectNode[0].address,
          date: new Date().toISOString(),
          comments: comments,
          floors: floors,
          routers: routers,
          cables: cables
        }

        

        let floorList:string = ``
        project.floors.map(x=>{
          floorList += `create (p) <-[:FLOOR]-(f${x.number}:Floor {number: ${x.number}, plan: "${x.plan}"})\n`
        })

        let commentList:string = ``
        project.comments.map(x=>{
          commentList += `create (p) <-[:COMMENT]-(c${x.comment_id}:Comment {comment_date: datetime("${x.comment_date}"), comment_id: ${x.comment_id}, comment_text: "${x.comment_text}"})\n`
        })

        await this.neo4jService.write(`
        match (p2:Project {id: ${id}})
        create (p:Project {id: ${project.id}, name: "${project.name}", address: "${project.address}", DateOfChange: datetime("${project.date}")})<-[:HISTORY]-(p2)
        ${floorList}
        ${commentList}
        `)


        project.routers.map(async x=>{
          let floorId = x.floor
          let r = x.router
          await this.neo4jService.write(`MATCH (p:Project {id: ${project.id}})-[:FLOOR]-(f:Floor {number: ${floorId}})
            CREATE (f) <-[:ROUTER]- (r:Router {id: ${r.id},
             x:${r.x},
             y:${r.y},
             name:"${r.name}",
             model:"${r.model}"
             })
          `)
        })

        project.cables.map(async x=>{
          let floorId = x.floor
          let c = x.cable
          await this.neo4jService.write(`MATCH (p:Project {id: ${project.id}})-[:FLOOR]-(f:Floor {number: ${floorId}})
            MATCH (f)-[:ROUTER]-(r1:Router {id:${c.start}})
            MATCH (f)-[:ROUTER]-(r2:Router {id:${c.end}})
            CREATE (f) <-[:CABLE]- (r:Cable {
             len: ${c.len},
             model: "${c.model}"
             })
             CREATE (r1)-[:CONNECTED]->(r)
             CREATE (r2)-[:CONNECTED]->(r)
          `)
        })
      }
    }
    return {
      id: id
    }
  }

  @Post("/project/:id/comment")
  async addComment(@Param('id') id, @Body() comment): Promise<any>
  {

    await this.neo4jService.write(`MATCH(p:Project {id: ${id}}) 
      CREATE (p) <-[:COMMENT]- (c:Comment {comment_id: ${Date.now()}, comment_text: "${comment.text}", comment_date: datetime("${new Date().toISOString()}")})
      `)

    return {date: new Date().toISOString(),text:comment.text}
  }

  @Get("/project/:id/comments")
  async getComments(@Param('id') id, @Query() query): Promise<any>
  {

    let queryList = []
    if (query.content !== undefined) queryList.push(`c.comment_text contains "${query.content}"`)
    if (query.fromDate !== undefined) queryList.push(`c.comment_date >= datetime("${query.fromDate}")`)
    if (query.toDate !== undefined) queryList.push(`c.comment_date <= datetime("${query.toDate}")`)

    let whereStr = ""

    if (queryList.length > 0)
    {
      whereStr += "where "
      let len = queryList.length
      queryList.map(x => {
        whereStr += x
        whereStr += len > 1 ? " and ": "" 
        len--
      })
    }

    const response = await this.neo4jService.read(`
    MATCH (n:Project {id: ${id}})<-[f:COMMENT]-(c:Comment) 
    ${whereStr}
    RETURN c
    `)
    const listOfComments = response.records.map(x => x.get('c').properties)
    return {
      comments: listOfComments.map(x => {return {date: x.comment_date.toStandardDate(), text: x.comment_text}})
    }
  }

  @Post("/projects/export")
  async exportProjects(@Body() projects): Promise<any>
  {
    let exportList = projects.projects
    let exportsJson = []
    exportsJson = await Promise.all(
      exportList.map(async id => {
        const res = await this.neo4jService.read(`
          match (p:Project {id: ${id}})
          optional match (p)-[r]-(t)
          return p, t
        `)
        let properties = res.records[0].get('p').properties
        let commentList = []
        let floorList = []
        res.records.map(x => {
          let elem = x.get('t')

          if (elem.labels[0] == 'Floor')
          {
            floorList.push({
              number: elem.properties.number.toNumber(),
              plan: elem.properties.plan
            })
          }
          else if (elem.labels[0] == 'Comment')
          {
            commentList.push({
              comment_id: elem.properties.comment_id.toNumber(),
              comment_text: elem.properties.comment_text,
              comment_date: elem.properties.comment_date.toStandardDate()
            })
          }
        })
        return {
          id: properties.id.toNumber(),
          name: properties.name,
          address: properties.address,
          date: properties.DateOfChange.toStandardDate(),
          comments: commentList,
          floors: floorList
        }
      })
      )
    return {projects:exportsJson}
  }

  @Post("/projects/import")
  @UseInterceptors(FileInterceptor('file'))
  async importProjects(@Res() response, @UploadedFile() file): Promise<any>
  {
    try {
      let data = JSON.parse(file.buffer.toString())
      await Promise.all(
        data.projects.map(async p => {
              await this.neo4jService.write(`CREATE (p:Project {id: ${p.id},address: "${p.address}",name: "${p.name}",DateOfChange: datetime("${p.date}")})`)
            const floors = p.floors

            return Promise.all(floors.map(f => {
              return this.neo4jService.write(`MATCH(p:Project {id: ${p.id}}) 
            CREATE (p) <-[:FLOOR]- (f:Floor {number: ${f.number}, plan: "${f.plan}"})
            RETURN f`)
            }))
        })
      )
      return response.status(201).json({})
    }
    catch(e){
      return response.status(500).json({})
    }
  }

  @Post("/projects/delete")
  async deleteProjects(@Res() response, @Body() projects): Promise<any>
  {
    let deleteList = projects.projects
    try 
    {
      await Promise.all(
        deleteList.map(id => {
          return this.neo4jService.write(
            `match (p:Project {id: ${id}})
          optional match (p)-[r]-(t)
          delete r,p,t`)
      }))
      return response.status(201).json({})
    }
    catch(e)
    {
      return response.status(500).json({})
    }
  }
}