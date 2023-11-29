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

  @Post("/project/:id/comment")
  async addComment(@Body() comment): Promise<any> {
    console.log(comment.text)
    return {date: new Date().toISOString(),text:comment.text}
  }
  @Get("/project/:id/comments")
  async getComments(): Promise<any> {

    return {comments:[{date:new Date(),text:"Because you can return or throw responses in loaders and actions, you can use redirect to redirect to another route.\n" +
            "\n" +
            "import { redirect } from \"react-router-dom\";\n" +
            "\n" +
            "const loader = async () => {\n" +
            "  const user = await getUser();\n" +
            "  if (!user) {\n" +
            "    return redirect(\"/login\");\n" +
            "  }\n" +
            "  return null;\n" +
            "};\n" +
            "It's really just a shortcut for this:\n" +
            "\n" +
            "new Response(\"\", {\n" +
            "  status: 302,\n" +
            "  headers: {\n" +
            "    Location: someUrl,\n" +
            "  },\n" +
            "});\n" +
            "It's recommended to use redirect in loaders and actions rather than useNavigate in your components when the redirect is in response to data.\n" +
            "\n" +
            "See also:"},
        {date:new Date(),text:"234"},
        {
          date:new Date(),text:"Что нужно заложить под натяжной потолок, чтобы после его не пришлось снимать? В моих ремонтах вы часто видите натяжные потолки, на которые установлены светильники, гардины и даже рельсы шкафа-купе, а потолки при этом не прогибаются и на них не образуются складки. Сегодня расскажу, как мы это делаем:)"
        },
        {
          date:new Date(),text:"1) Закладные под декоративные перегородки. Как правило, мы добавляем эти закладные, если у заказчика разнополые дети и нам через несколько лет нужно будет разделить детскую комнату на две зоны. Как правило, для этих целей мы используем лёгкие ажурные конструкции, которые не перекрывают световой поток, но при этом зонируют комнату. При этом, мы заранее определяем габариты и сечение будущих перегородок, чтобы установить закладные соответствующего размера. "
        }
      ]}
  }
}
