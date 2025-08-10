import { Response } from "express";
import { PaginationUserRequest, UserRequest } from "../schemas/user.schema";
import { TypedRequest } from "../types/express";
import userService from "../services/user.service";
import { StatusCodes } from "http-status-codes";
const { OK, CREATED, NO_CONTENT } = StatusCodes;
class UserController {
  async getAllUsers(
    request: TypedRequest<{ TQuery: PaginationUserRequest }>,
    res: Response
  ) {
    const pagedResult = await userService.getAllUsers(request.query);

    res.status(OK).send(pagedResult.response);
  }

  async addUser(request: TypedRequest<{ TBody: UserRequest }>, res: Response) {
    const user = await userService.addUser(request.body);

    res.status(CREATED).send(user);
  }

  async editUser(
    request: TypedRequest<{ TBody: UserRequest; TParams: { id: string } }>,
    res: Response
  ) {
    const { id } = request.params;
    const userData = request.body;

    const updatedUser = await userService.editUser(id, userData);

    res.status(OK).send(updatedUser);
  }

  async deleteUser(
    request: TypedRequest<{ TParams: { id: string } }>,
    res: Response
  ) {
    const { id } = request.params;

    await userService.deleteUser(id);

    res.status(NO_CONTENT).send();
  }

  async banUser(
    request: TypedRequest<{
      TParams: { id: string };
      TBody: { isBanned: boolean };
    }>,
    res: Response
  ) {
    const { id } = request.params;
    const { isBanned } = request.body;
    await userService.banUser(id, isBanned);

    res.status(NO_CONTENT).send();
  }
}

export default new UserController();
