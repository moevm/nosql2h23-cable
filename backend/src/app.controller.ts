import {Body, Controller, Get, Param, Post, Query, Req, Res, UploadedFile, UseInterceptors} from '@nestjs/common';
import { AppService } from './app.service';
import { Neo4jService } from 'nest-neo4j'
import { DateTime } from 'neo4j-driver';
import * as leti_json from '../default projects/Leti.json'
import {FileInterceptor} from "@nestjs/platform-express";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private readonly neo4jService: Neo4jService
  ) {

    (async () => {
      const response = await this.neo4jService.read(`MATCH (n:Project) RETURN n`)
      const projectList = response.records.map(x => x.get(0).properties)

      if (projectList.length == 0)
      {
        let projects = leti_json.projects
        
        projects.map(async p => {
            await this.neo4jService.write(`CREATE (p:Project {id: ${p.id},address: "${p.address}",name: "${p.name}",DateOfChange: datetime("${p.date}")})`)
            const floors = p.floors

            floors.map(async f => {
              await this.neo4jService.write(`MATCH(p:Project {id: ${p.id}}) 
            CREATE (p) <-[:FLOOR]- (f:Floor {number: ${f.number}, plan: "${f.plan}"})
            RETURN f`)
            })
        })
      }
    })()

  }

  @Get("/projects")
  async getProjects(@Query('mode') mode: Number, @Query('query') query: String): Promise<any> {

    let response
    if (mode === undefined || query === "")
    {
      response = await this.neo4jService.read(`MATCH (n:Project) RETURN n`)
    }
    else
    {
      let findString: string;

      let timzone = Intl.DateTimeFormat().resolvedOptions().timeZone

      switch (+mode)
      {
        case 0:
          findString = `MATCH (n) RETURN n limit 0`
          break
        case 1:
          findString = `Match (n:Project) where n.name contains "${query}" return n`
          break
        case 2:
          findString = `Match (n:Project) where n.address contains "${query}" return n`
          break
        case 3:
          findString = `Match (n:Project) where n.address contains "${query}" or n.name contains "${query}" return n`
          break
        case 4:
          findString = `Match (n:Project) where toString(datetime({datetime: n.DateOfChange, timezone: "${timzone}"})) contains "${query}" return n`
          break
        case 5:
          findString = `Match (n:Project) where n.address contains "${query}" or n.name contains "${query}" return n`
          break
        case 6:
          findString = `Match (n:Project) where n.address contains "${query}" or toString(datetime({datetime: n.DateOfChange, timezone: "${timzone}"})) contains "${query}" return n`
          break
        case 7:
          findString = `Match (n:Project) where n.address contains "${query}" or n.name contains "${query}" or toString(datetime({datetime: n.DateOfChange, timezone: "${timzone}"})) contains "${query}" return n`
          break        

      }
      response = await this.neo4jService.read(findString)
    }

    const projectList = response.records.map(x => x.get(0).properties)

    return {
      page: 1,
      total: projectList.length,
      projects: projectList.map(x => {
        return {
          id: x.id.toNumber(),
          name: x.name,
          date: x.DateOfChange.toStandardDate(),
          address: x.address
        }
      })
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
    return {
      floor: +floor,
      components: []
    }
  }

  @Post("/project/:id/save")
  async saveChanges(@Body() changes, @Param('id') id): Promise<any> {
    const name = changes.name
    const address = changes.address
    const floors = changes.floors
    let curId = id
    if (id == 'new') {
      curId = Date.now()
      const response = await this.neo4jService.write(`CREATE (p:Project {id: ${curId},address: "${address}",name: "${name}",DateOfChange: datetime("${new Date().toISOString()}")})`)
    }
    else
    {
      if (name) await this.neo4jService.write(`MATCH(p:Project {id: ${curId}}) SET p.name = "${name}"`)
    }

    if (address) await this.neo4jService.write(`MATCH(p:Project {id: ${curId}}) SET p.address = "${address}"`)

    if (floors) floors.forEach(async floor => {
      await this.neo4jService.write(`MATCH(p:Project {id: ${curId}}) 
      CREATE (p) <-[:FLOOR]- (f:Floor {number: ${floor.floor}, plan: ''})
      `)
    })

    return {
      id: curId
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
  async getComments(@Param('id') id): Promise<any>
  {
    const response = await this.neo4jService.read(`MATCH (n:Project {id: ${id}})<-[f:COMMENT]-(c:Comment) RETURN c`)
    const listOfComments = response.records.map(x => x.get(0).properties)
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
        data.projects.map(p => {
            this.neo4jService.write(`CREATE (p:Project {id: ${p.id},address: "${p.address}",name: "${p.name}",DateOfChange: datetime("${p.date}")})`)
            const floors = p.floors

            floors.map(f => {
              this.neo4jService.write(`MATCH(p:Project {id: ${p.id}}) 
            CREATE (p) <-[:FLOOR]- (f:Floor {number: ${f.number}, plan: "${f.plan}"})
            RETURN f`)
            })
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