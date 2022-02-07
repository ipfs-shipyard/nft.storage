import AWS from 'aws-sdk'
import { sleep } from '../timers'

const dynamoDb = new AWS.DynamoDB.DocumentClient()

export async function store(event) {
  const records = event.Records.map((x) => JSON.parse(x.body))

  let tableBatch = []
  for (const record of records) {
    const result = dynamoDb
      .put({
        TableName: process.env.fetchedRecordsTableName,
        Item: {
          ...record,
          created_at: Date.now(),
        },
      })
      .promise()
    tableBatch.push(result)
  }

  await Promise.all(tableBatch)

  return {
    statusCode: 200,
    message: `Stored ${records.length} Fetched Record`,
  }
}