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
    })()

  }

  @Get("/projects")
  async getProjects(@Query() query): Promise<any> {

    let response
    
    {
      let queryList = []
      if (query.name !== undefined) queryList.push(`n.name contains "${query.name}"`)
      if (query.address !== undefined) queryList.push(`n.address contains "${query.address}"`)
      if (query.fromDate !== undefined) queryList.push(`n.DateOfChanges >= datetime("${query.fromDate}")`)
      if (query.toDate !== undefined) queryList.push(`n.DateOfChanges <= datetime("${query.toDate}")`)
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

      response = await this.neo4jService.read(`
      OPTIONAL MATCH (n:Project)<-[f:FLOOR]-(c:Floor) WITH n, count(c) as countFloor 
      OPTIONAL MATCH (n)<-[k:COMMENT]-(b:Comment) with n, countFloor, count(b) as countComment 
      ${whereStr}
      RETURN n, countFloor, countComment
      `)
    }

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