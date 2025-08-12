import {
  BadRequestError,
  DuplicateDocumentError,
  ForbiddenError,
} from "../error/customError";
import User from "../models/user.model";
import redis from "../redis";
import {
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
} from "../schemas/auth.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
class AuthService {
  async register(request: RegisterRequest): Promise<CommonLoginResponse> {
    const { email, fullName, password } = request;

    const findExistingUser = await User.findByEmail(email);

    if (findExistingUser) {
      throw new DuplicateDocumentError("User already exists with this email");
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      email,
      fullName,
      password: passwordHash,
      provider: "local",
      providerId: email,
    });

    const { accessToken, refreshToken } = this.generateToken(newUser);

    return {
      accessToken,
      refreshToken,
      user: {
        _id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.fullName,
        avatar: newUser.avatar || null,
      },
    };
  }

  private generateToken(user: any) {
    const uniqueId = uuidv4();
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      jti: uniqueId,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "30m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "1d",
    });

    redis.setex(
      `refreshToken:${payload.userId}:${uniqueId}`,
      60 * 60 * 24,
      "valid"
    );

    return { accessToken, refreshToken };
  }

  async login(request: LoginRequest): Promise<CommonLoginResponse> {
    const { email, password } = request;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new DuplicateDocumentError("User not found with this email");
    }

    if (user.provider !== "local") {
      throw new BadRequestError(
        `Your Account is linked with ${user.provider}. Please login using ${user.provider}.`
      );
    }

    if (user.isBanned) {
      throw new ForbiddenError("User is banned");
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password || "");

    if (!isPasswordValid) {
      throw new DuplicateDocumentError("Invalid password");
    }

    const { accessToken, refreshToken } = this.generateToken(user);
    user.lastLogin = new Date();
    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatar: user.avatar || null,
      },
    };
  }

  async refreshToken(token: string) {
    if (!token) {
      throw new DuplicateDocumentError("No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);

    if (!decoded || typeof decoded === "string") {
      throw new DuplicateDocumentError("Invalid token");
    }

    const { jti: uniqueId, userId } = decoded;

    const isValid = await redis.get(`refreshToken:${userId}:${uniqueId}`);

    if (!isValid) {
      throw new DuplicateDocumentError("Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new DuplicateDocumentError("User not found");
    }

    const { accessToken } = this.generateToken(user);

    return accessToken;
  }
  async changePassword(
    request: ChangePasswordRequest,
    userReq: any,
    refreshToken: string
  ) {
    try {
      const user = await User.findOne({ email: userReq.email })
        .select("+password")
        .exec();

      if (!user) {
        throw new Error("User not found");
      }

      const { newPassword } = request;

      const isValidPassword = bcrypt.compareSync(
        request.oldPassword,
        user.password || ""
      );

      if (!isValidPassword) {
        throw new BadRequestError("Old password is incorrect.");
      }

      const isSamePassword = bcrypt.compareSync(
        newPassword,
        user.password || ""
      );

      if (isSamePassword) {
        throw new BadRequestError(
          "New password cannot be the same as the old password."
        );
      }

      const newHashedPassword = bcrypt.hashSync(newPassword, 12);

      user.password = newHashedPassword;

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!);

      const { userId } = decoded as { jti: string; userId: string };

      const pattern = `refreshToken:${userId}:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }

      await redis.set(
        `TOKEN_IAT_AVAILABLE_${userReq.userId}`,
        Math.floor(Date.now() / 1000),
        {
          ex: 60 * 60 * 24,
        }
      );

      await user.save();

      return {
        message: "Password changed successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(user: any) {
    const blackListKey = `TOKEN_BLACK_LIST_${user.userId}_${user.jti}`;

    await redis.set(blackListKey, 1, {
      ex: 60 * 30,
    });

    await redis.del(`refreshToken:${user.jti}`);
  }

  async oAuthLogin(user: any): Promise<CommonLoginResponse> {
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = this.generateToken(user);

    return {
      accessToken,
      refreshToken,
      user: {
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        avatar: user.avatar || null,
      },
    };
  }
}

export default new AuthService();
