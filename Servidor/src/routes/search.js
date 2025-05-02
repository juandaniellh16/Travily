import { Router } from "express";
import { SearchController } from "../controllers/search.js";

export const createSearchRouter = ({ searchModel }) => {
  const searchRouter = Router();

  const searchController = new SearchController({ searchModel });

  searchRouter.get("/locations", searchController.searchLocations);
  searchRouter.get("/users", searchController.searchUsers);

  return searchRouter;
};
