import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

const s3 = new AWS.S3({
  signatureVersion: 'v4'
})
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.TODOS_S3_BUCKET
const urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)
const logger = createLogger('uploadUrl')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId  
  let signedUrl = ''

  const result = await docClient.query({
    TableName: todosTable,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
      ':todoId': todoId
    },
    ScanIndexForward: false
  }).promise()

  if(result.Count != 0) {
    signedUrl = s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: result.Items[0].attachmentUrl.split('/')[3],
      Expires: urlExpiration
    })
  }   

  logger.info('TodoId SignedURL for image', { todoId, signedUrl })

  // TODO: OK - Return a presigned URL to upload a file for a TODO item with the provided id
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      "uploadUrl": signedUrl
    })
  }
}
