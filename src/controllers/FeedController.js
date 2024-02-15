const { GetObjectCommand } = require('@aws-sdk/client-s3')
const s3 = require('../config/s3')

class FeedController {
    async getFeed(req, res) {
        try {
            const params = {
                Bucket: 'backend-developer-teste',
                Key: 'jobs.json'
            };
            const data = await s3.send(new GetObjectCommand(params))
            const buffer = await streamToBuffer(data.Body)
            const jobs = JSON.parse(buffer.toString())

            return res.status(200).json({ success: true, jobs: jobs.jobs })
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message })
        }
    }
}

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

module.exports = new FeedController()