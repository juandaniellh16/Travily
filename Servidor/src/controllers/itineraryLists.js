import { InvalidInputError, UnauthorizedError } from "../errors/errors.js";
import {
  validateItineraryList,
  validatePartialItineraryList,
} from "../schemas/itineraryLists.js";

export class ItineraryListController {
  constructor({ itineraryListModel }) {
    this.itineraryListModel = itineraryListModel;
  }

  getAll = async (req, res, next) => {
    const { user } = req.session;
    const {
      userId,
      username,
      likedBy,
      visibility = "public",
      sort,
      limit = 10,
    } = req.query;
    try {
      if (userId && username) {
        throw new InvalidInputError(
          "You cannot filter by userId and username at the same time",
        );
      }
      if (visibility !== "public" && !user) {
        throw new UnauthorizedError(
          "You are not authorized to view private itinerary lists",
        );
      }
      const limitValue = parseInt(limit, 10);
      const lists = await this.itineraryListModel.getAll({
        userId,
        username,
        likedBy,
        visibility,
        sort,
        limit: limitValue,
        userIdSession: user?.id,
      });
      res.json(lists);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    const { user } = req.session;
    const { id } = req.params;
    try {
      if (!id) throw new InvalidInputError("Id parameter is required");

      const list = await this.itineraryListModel.getById({ id });

      if (!list.isPublic && (!user || user.id !== list.userId)) {
        throw new UnauthorizedError(
          "You are not authorized to view this itinerary list",
        );
      }

      res.json(list);
    } catch (error) {
      next(error);
    }
  };

  create = async (req, res, next) => {
    const { user } = req.session;
    try {
      if (!user) throw new UnauthorizedError("Access not authorized");

      const result = validateItineraryList(req.body);

      if (!result.success) {
        throw new InvalidInputError(
          "Invalid itinerary list data: " +
            JSON.stringify(result.error.message),
        );
      }

      if (user.id !== req.body.userId) {
        throw new UnauthorizedError(
          "You are not authorized to create an itinerary list for another user",
        );
      }

      const listId = await this.itineraryListModel.create({
        input: result.data,
      });

      const locationUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}/${listId}`;

      res.status(201).set("Location", locationUrl).end();
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    const { user } = req.session;
    const { id } = req.params;
    try {
      if (!user) throw new UnauthorizedError("Access not authorized");
      if (!id) throw new InvalidInputError("Id parameter is required");

      const list = await this.itineraryListModel.getById({ id });
      if (list.userId !== user.id) {
        throw new UnauthorizedError(
          "You are not authorized to delete this itinerary list",
        );
      }

      await this.itineraryListModel.delete({ id });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    const { user } = req.session;
    const { id } = req.params;
    try {
      if (!user) throw new UnauthorizedError("Access not authorized");
      if (!id) throw new InvalidInputError("Id parameter is required");

      const result = validatePartialItineraryList(req.body);

      if (!result.success) {
        throw new InvalidInputError(
          "Invalid itinerary list data: " +
            JSON.stringify(result.error.message),
        );
      }

      const list = await this.itineraryListModel.getById({ id });
      if (list.userId !== user.id) {
        throw new UnauthorizedError(
          "You are not authorized to update this itinerary list",
        );
      }

      await this.itineraryListModel.update({ id, input: result.data });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  like = async (req, res, next) => {
    const { user } = req.session;
    const listId = req.params.id;
    try {
      if (!user) throw new UnauthorizedError("Access not authorized");
      if (!listId) {
        throw new InvalidInputError("Itinerary list id parameter is required");
      }

      const userId = user.id;

      await this.itineraryListModel.likeItineraryList({ userId, listId });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  unlike = async (req, res, next) => {
    const { user } = req.session;
    const listId = req.params.id;
    try {
      if (!user) throw new UnauthorizedError("Access not authorized");
      if (!listId) {
        throw new InvalidInputError("Itinerary list id parameter is required");
      }

      const userId = user.id;

      await this.itineraryListModel.unlikeItineraryList({ userId, listId });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  checkIfLiked = async (req, res, next) => {
    const { user } = req.session;
    const listId = req.params.id;
    try {
      if (!user) throw new UnauthorizedError("Access not authorized");
      if (!listId) {
        throw new InvalidInputError("Itinerary list id parameter is required");
      }

      const userId = user.id;

      const result = await this.itineraryListModel.checkIfLiked({
        listId,
        userId,
      });
      res.json({ isLiked: result });
    } catch (error) {
      next(error);
    }
  };

  addItineraryToList = async (req, res, next) => {
    const { user } = req.session;
    const listId = req.params.id;
    const { itineraryId } = req.body;
    try {
      if (!user) throw new UnauthorizedError("Access not authorized");
      if (!listId) {
        throw new InvalidInputError("Itinerary list id parameter is required");
      }

      const list = await this.itineraryListModel.getById({ id: listId });
      if (list.userId !== user.id) {
        throw new UnauthorizedError(
          "You are not authorized to add itineraries to this list",
        );
      }

      await this.itineraryListModel.addItineraryToList({ listId, itineraryId });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  removeItineraryFromList = async (req, res, next) => {
    const { user } = req.session;
    const listId = req.params.id;
    const { itineraryId } = req.body;
    try {
      if (!user) throw new UnauthorizedError("Access not authorized");
      if (!listId) {
        throw new InvalidInputError("Itinerary list id parameter is required");
      }

      const list = await this.itineraryListModel.getById({ id: listId });
      if (list.userId !== user.id) {
        throw new UnauthorizedError(
          "You are not authorized to remove itineraries from this list",
        );
      }

      await this.itineraryListModel.removeItineraryFromList({
        listId,
        itineraryId,
      });
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
