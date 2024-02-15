const db = require('../database')
const sqs = require('../config/sqs')
const { SendMessageCommand } = require("@aws-sdk/client-sqs")

class JobController {
    async register(req, res) {
        try {
            const data = req.body

            if (!data.company_id || !data.title || !data.description || !data.notes || !data.location) {
                return res.status(400).json({ success: false, error: 'Missing required fields' })
            }

            const company = await db.getById('companies', data.company_id)
            if (!company) {
                return res.status(404).json({ success: false, error: 'Company not found' })
            }

            await db.create('jobs', { ...data })

            return res.status(201).json({ success: true, message: 'Job created' })
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message })
        }
    }

    async publish(req, res) {
        try {
            const { job_id } = req.params

            const jobVerification = await db.getById('jobs', job_id)
            if (!jobVerification) {
                return res.status(404).json({ success: false, error: 'Job not found' })
            }

            if (jobVerification.status === 'published') {
                return res.status(400).json({ success: false, error: 'Job already published' })
            }

            await db.update('jobs', job_id, { status: "published" })

            const job = await db.getJob(job_id)

            const command = new SendMessageCommand({
                QueueUrl: process.env.AWS_QUEUE_URL,
                MessageBody: JSON.stringify(job[0])
            })

            await sqs.send(command)
            .then(data => {
                console.log(`Message sent to the queue: ${data.MessageId}`)
            })
            .catch(error => {
                console.error(error, error.stack)
            })

            return res.status(200).json({ success: true, message: 'Job published' })
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message })
        }
    }

    async update(req, res) {
        try {
            const { job_id } = req.params

            const job = await db.getById('jobs', job_id)
            if (!job) {
                return res.status(404).json({ success: false, error: 'Job not found' })
            }

            if (job.status === 'published') {
                return res.status(400).json({ success: false, error: 'Cannot update a published job' })
            }

            const data = req.body

            await db.update('jobs', job_id, { ...data })

            return res.status(200).json({ success: true, message: 'Job updated' })
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message })
        }
    }

    async delete(req, res) {
        try {
            const { job_id } = req.params

            const job = await db.getById('jobs', job_id)

            if (!job) {
                return res.status(404).json({ success: false, error: 'Job not found' })
            }

            if (job.status === 'published') {
                return res.status(400).json({ success: false, error: 'Cannot delete a published job' })
            }

            await db.delete('jobs', job_id)

            return res.status(204).json({ success: true, message: 'Job deleted' })
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message })
        }
    }

    async archive(req, res) {
        try {
            const { job_id } = req.params

            const jobVerification = await db.getById('jobs', job_id)
            if (!jobVerification) {
                return res.status(404).json({ success: false, error: 'Job not found' })
            }

            await db.update('jobs', job_id, { status: "archived" })

            const job = await db.getJob(job_id)

            const command = new SendMessageCommand({
                QueueUrl: process.env.AWS_QUEUE_URL,
                MessageBody: JSON.stringify(job[0])
            })

            await sqs.send(command)
            .then(data => {
                console.log(`Message sent to the queue: ${data.MessageId}`)
            })
            .catch(error => {
                console.error(error, error.stack)
            })

            return res.status(200).json({ success: true, message: 'Job archived' })
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message })
        }
    }
}

module.exports = new JobController()