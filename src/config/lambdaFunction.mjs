//This file contains the code for the AWS Lambda function used when firing the AWS SQS queue trigger.

import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from 'stream';

const s3 = new S3Client({ region: "us-east-1" });

let cache = null;

const handler = async (event) => {
    const job = event.Records[0].body;

    const jobData = JSON.parse(job);
    
    let jobs;
    
    if (cache) {
        jobs = cache;
    } else {
        const params = {
            Bucket: 'backend-developer-teste',
            Key: 'jobs.json'
        };
        const data = await s3.send(new GetObjectCommand(params));
        const buffer = await streamToBuffer(data.Body);
        jobs = JSON.parse(buffer.toString());
        
        cache = jobs;
    }


    if (jobData.status == "archived") {
        console.log("Job remove")
        const index = jobs.jobs.findIndex(j => j.id === jobData.id);
        if (index !== -1) {
            jobs.jobs.splice(index, 1);
        }
    } else if (jobData.status == "published") {
        console.log("Job add")
        jobs.jobs.push(jobData);
    }
    
    const newParams = {
        Bucket: 'backend-developer-teste',
        Key: 'jobs.json',
        Body: JSON.stringify(jobs)
    };
    await s3.send(new PutObjectCommand(newParams));

    console.log('Job processed successfully!');
};

async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}

export { handler };