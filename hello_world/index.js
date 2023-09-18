
const https = require('https');

const neo4j = require('neo4j-driver')

const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "password"))
const session = driver.session()

async function main() {

    try {
       await session.run(
            'CREATE (text:Greeting {text: $text, id: $id}) RETURN text',
            {text: "Hello world",id: "123"}
       )

        let result = await session.run(
            'MATCH (text:Greeting) WHERE text.id = "123" RETURN text',
        )
        const singleRecord = result.records[0]
        const node = singleRecord.get(0)
        console.log(node.properties.text)

    } finally {
        await session.close()
    }

// on application exit:
    await driver.close()
}


main()