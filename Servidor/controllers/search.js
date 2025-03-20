export class SearchController {
  constructor ({ searchModel }) {
    this.searchModel = searchModel
  }

  search = async (req, res, next) => {
    const query = req.query.query?.trim()
    try {
      if (!query) return res.json([])
      const results = await this.searchModel.search({ query })
      res.json(results)
    } catch (error) {
      next(error)
    }
  }
}
