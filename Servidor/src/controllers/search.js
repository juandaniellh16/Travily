export class SearchController {
  constructor({ searchModel }) {
    this.searchModel = searchModel;
  }

  searchLocations = async (req, res, next) => {
    const { query, lang } = req.query;
    try {
      if (!query) return res.json([]);
      const results = await this.searchModel.searchLocations({
        query,
        lang: lang || undefined,
      });
      res.json(results);
    } catch (error) {
      next(error);
    }
  };

  searchUsers = async (req, res, next) => {
    const { query } = req.query;
    try {
      if (!query) return res.json([]);
      const results = await this.searchModel.searchUsers({ query });
      res.json(results);
    } catch (error) {
      next(error);
    }
  };
}
