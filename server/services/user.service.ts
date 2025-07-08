import { PagedResult } from "../config/paged-result";
import {
  DocumentNotFoundError,
  DuplicateDocumentError,
} from "../error/customError";
import User, { UserDocument } from "../models/user.model";
import { PaginationUserRequest, UserRequest } from "../schemas/user.schema";

class UserService {
  async getAllUsers(
    request: PaginationUserRequest
  ): Promise<PagedResult<UserDocument>> {
    let {
      pageSize = 10,
      currentPage = 0,
      sortBy = "createdAt",
      sortOrder = "asc",
      search,
      providers,
      roles,
    } = request;

    const skip = currentPage * pageSize;

    console.log("Skip:", skip);

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (typeof providers === "string") {
      providers = [providers];
    }

    if (providers && providers.length > 0) {
      query.provider = { $in: providers };
    }

    if (typeof roles === "string") {
      roles = [roles];
    }

    if (roles && roles.length > 0) {
      query.role = { $in: roles, $ne: "admin" };
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const totalCount = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password")
      .sort(sort)
      .skip(skip < 0 ? 0 : skip)
      .limit(pageSize);

    return new PagedResult(users, totalCount, currentPage, pageSize);
  }

  async addUser(userData: UserRequest): Promise<UserDocument> {
    const { email } = userData;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new DuplicateDocumentError("User with this email already exists");
    }

    const newUser = await User.create({
      ...userData,
      provider: "local",
      providerId: email,
    });
    return newUser;
  }

  async editUser(email: string, userData: UserRequest): Promise<UserDocument> {
    const user = await User.findByEmail(email);
    if (!user) {
      throw new DocumentNotFoundError("User not found");
    }

    Object.assign(user, userData);
    await user.save();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new DocumentNotFoundError("User not found");
    }
  }
}

export default new UserService();
