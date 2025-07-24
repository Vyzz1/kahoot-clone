import { PagedResult } from "../config/paged-result";
import {
  DocumentNotFoundError,
  DuplicateDocumentError,
} from "../error/customError";
import User, { UserDocument } from "../models/user.model";
import { PaginationUserRequest, UserRequest } from "../schemas/user.schema";
import bcrypt from "bcrypt";
class UserService {
  async getAllUsers(
    request: PaginationUserRequest
  ): Promise<PagedResult<UserDocument>> {
    let {
      pageSize = 10,
      currentPage = 1,
      sortBy = "createdAt",
      sortOrder = "asc",
      search,
      providers,
      statuses,
    } = request;

    const skip = (currentPage - 1) * pageSize;

    // const query: any = {
    //   role: { $ne: "admin" },
    // };
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

    if (typeof statuses === "string") {
      statuses = [statuses];
    }

    if (statuses) {
      query.isBanned = { $in: statuses };
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === "ascend" ? 1 : -1;

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

    if (!userData.password) {
      throw new Error("Password is required");
    }
    const password = bcrypt.hashSync(userData.password!, 10);

    const newUser = await User.create({
      ...userData,
      password,
      provider: "local",
      providerId: email,
    });
    return newUser;
  }

  async editUser(id: string, userData: UserRequest): Promise<UserDocument> {
    const user = await User.findById(id).exec();
    if (!user) {
      throw new DocumentNotFoundError("User not found");
    }

    const { email, ...updateData } = userData;

    if (updateData.password) {
      console.log("Updating password for user:", id);
      const password = bcrypt.hashSync(updateData.password, 10);
      updateData.password = password;
    }

    Object.assign(user, updateData);
    await user.save();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new DocumentNotFoundError("User not found");
    }
  }

  async banUser(id: string, isBanned: boolean): Promise<void> {
    const user = await User.findById(id);
    if (!user) {
      throw new DocumentNotFoundError("User not found");
    }

    user.isBanned = isBanned;
    await user.save();
  }
}

export default new UserService();
