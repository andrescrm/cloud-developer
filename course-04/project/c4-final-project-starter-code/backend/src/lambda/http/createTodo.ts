import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { parseUserId } from '../../auth/utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.TODOS_S3_BUCKET
const logger = createLogger('todoCreation')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = uuid.v4()
  const imageId = uuid.v4()
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const newItem = await createTodo(todoId, imageId, jwtToken, event)

  logger.info('Todo payload to create', newItem)

  // TODO: OK - Implement creating a new TODO item
  await docClient
    .put({
      TableName: todosTable,
      Item: newItem
    }).promise()

  return {
    statusCode: 201,    
    body: JSON.stringify({
      newItem
    })
  }
})

handler.use(
  cors({
    credentials: true
  })
)

async function createTodo(todoId: string, imageId: string, jwtToken: string, event: any) {
  const createdAt = new Date().toISOString()
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const newItem = {
    todoId,    
    createdAt,    
    ...newTodo,
    done: false,
    attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`,
    userId: parseUserId(jwtToken)
  }  

  return newItem
}