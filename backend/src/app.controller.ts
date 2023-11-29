import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import { AppService } from './app.service';
import { Neo4jService } from 'nest-neo4j'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              private readonly neo4jService: Neo4jService
  ) {
  }

  @Get("/projects")
  async getProjects(): Promise<any> {
    const response = await this.neo4jService.read(`MATCH (n:Project) RETURN n`)

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
      const response = await this.neo4jService.write(`CREATE (p:Project {id: ${curId},address: ${address},name: ${name},DateOfChange: datetime${new Date().toISOString()}})`)
    }
    else
    {
      if (name) await this.neo4jService.write(`MATCH(p:Project {id: ${curId}}) SET p.name = ${name}`)
    }

    if (address) await this.neo4jService.write(`MATCH(p:Project {id: ${curId}}) SET p.address = ${address}`)

    if (floors) floors.forEach(async floor => {
      await this.neo4jService.write(`MATCH(p:Project {id: ${curId}}) 
      CREATE (p) <-[:FLOOR]- (f:Floor {number: ${floor.floor}, plan: ''})
      `)
    })

    return {

    }
  }
}
