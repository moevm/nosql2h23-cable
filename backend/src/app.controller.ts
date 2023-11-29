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
