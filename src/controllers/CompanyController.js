const db = require('../database')

class CompanyController {
    async index(_, res) {
        try {
            const companies = await db.get('companies')
            return res.status(200).json({ success: true, companies })
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message })
        }
    }

    async show(req, res) {
        try {
            const { id } = req.params
            const company = await db.getById('companies', id)

            if (!company) {
                return res.status(404).json({ success: false, error: 'Company not found' })
            }
            
            return res.status(200).json({ success: true, company })
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message })
        }
    }
}

module.exports = new CompanyController()