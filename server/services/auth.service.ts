import { DuplicateDocumentError, ForbiddenError } from "../error/customError";
import User from "../models/user.model";
import redis from "../redis";
import { LoginRequest, RegisterRequest } from "../schemas/auth.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
class AuthService {
  private generateToken(user: any) {
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "30m",
    });

    const uniqueId = uuidv4();
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: "1d",
      jwtid: uniqueId,
    });

    redis.setex(`refreshToken:${uniqueId}`, 60 * 60 * 24, "valid");

    return { accessToken, refreshToken };
  }

  async login(request: LoginRequest): Promise<CommonLoginResponse> {
    const { email, password } = request;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new DuplicateDocumentError("User not found with this email");
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

  async refreshToken(token: string) {
    if (!token) {
      throw new DuplicateDocumentError("No token provided");
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);

    if (!decoded || typeof decoded === "string") {
      throw new DuplicateDocumentError("Invalid token");
    }

    const { jti: uniqueId } = decoded;

    const isValid = await redis.get(`refreshToken:${uniqueId}`);

    if (!isValid) {
      throw new DuplicateDocumentError("Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new DuplicateDocumentError("User not found");
    }

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "30m",
        jwtid: uniqueId,
      }
    );

    return accessToken;
  }
}

export default new AuthService();
