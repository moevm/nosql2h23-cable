import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import { AppService } from './app.service';
import { Neo4jService } from 'nest-neo4j'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
              /*private readonly neo4jService: Neo4jService*/
  ) {
  }

  @Get()
  async getHello(): Promise<any> {
    // const res = await this.neo4jService.read(`MATCH (n) RETURN count(n) AS count`)

    // return `There are ${res.records[0].get('count')} nodes in the database`
  }

  @Get("/projects")
  async getProjects(): Promise<any> {
    let projects = [
      {
        id: "1",
        name: "Проект1",
        address: "add1r",
        date: new Date().toISOString(),
        floors: [{floor: 1, components: []}]
      },
      {
        id: "2",
        name: "Проект13",
        address: "add4234342342342342r2",
        date: new Date().toISOString(),
        floors: [{floor: 1, components: []}]
      },
      {
        id: "3",
        name: "Проект532351",
        address: "ad1r",
        date: new Date().toISOString(),
        floors: [{floor: 1, components: []}]
      },
      {
        id: "4",
        name: "Проект1353",
        address: "add42343442342r2",
        date: new Date().toISOString(),
        floors: [{floor: 1, components: []}]
      }
    ]

    return {
      page: 1,
      total: projects.length,
      projects: projects.map(x => {
        return {
          id: x.id,
          name: x.name,
          date: x.date,
          address: x.address
        }
      })
    }
  }

  @Get("/project/:id")
  async getProject(@Param('id') id): Promise<any> {

    return {
      id: id,
      name: `Project with id ${id}`,
      address: `Address of a project with id ${id}`,
      date: new Date().toISOString(),
      saved: true,
      floors: [
        {
          floor: 1,
        },
        {
          floor: 2,
        },
        {
          floor: 3,
        }
      ]
    }
  }

  @Get("/project/:id/floor/:floor")
  async getComponents(@Param('id') id,@Param('floor') floor): Promise<any> {
    return {
      floor: +floor,
      components:[{name:`компонент на этаже ${floor}`}]
    }
  }

  @Post("/project/:id/save")
  async saveChanges(@Body() changes): Promise<any> {
    console.log(changes)
    return {}
  }
}
