import User from "../models/user.model";
import Quiz from "../models/quiz.model";
import Question from "../models/question.model";
import MigrationVersion from "../models/migrationVersion.model";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
}

interface MigrationWithStatus {
  version: number;
  name: string;
  status: 'Applied' | 'Pending'; 
}

const allMigrations: Migration[] = [
  {
    version: 1,
    name: "Initial migration: Add 'points' field to Question model",
    up: async () => {
      console.log("Running migration v1: Adding 'points' field to Question model...");
      await Question.updateMany(
        { points: { $exists: false } },
        { $set: { points: 1 } }
      );
      console.log("Migration v1 completed: 'points' field added.");
    },
  },
  {
    version: 2,
    name: "Migration v2: Add 'category' field to Quiz model",
    up: async () => {
      console.log("Running migration v2: Adding 'category' field to Quiz model...");
      await Quiz.updateMany(
        { category: { $exists: false } },
        { $set: { category: "Uncategorized" } }
      );
      console.log("Migration v2 completed: 'category' field added.");
    },
  },
  {
    version: 3,
    name: "Migration v3: Add 'difficulty' field to Question model",
    up: async () => {
      console.log("Running migration v3: Adding 'difficulty' field to Question model...");
      await Question.updateMany(
        { difficulty: { $exists: false } },
        { $set: { difficulty: "easy" } }
      );
      console.log("Migration v3 completed: 'difficulty' field added.");
    },
  },
];

class MigrationService {
  /**
   * Tạo dữ liệu mẫu (người dùng, quiz, câu hỏi)
   * Chỉ chạy khi database trống hoặc cần reset dữ liệu test
   */
  async seedSampleData(): Promise<void> {
    console.log("Starting to seed sample data...");

    await User.deleteMany({});
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    await MigrationVersion.deleteMany({});
    console.log("Cleared existing data.");

    const hashedPassword = await bcrypt.hash("password123", 10);

    const adminUser = await User.create({
      fullName: "Admin User",
      email: "admin@example.com",
      role: "admin",
      password: hashedPassword,
      provider: "local",
      providerId: "admin@example.com",
      avatar: "https://placehold.co/100x100/ADD8E6/000000?text=Admin",
    });

    const regularUser = await User.create({
      fullName: "Regular User",
      email: "user@example.com",
      role: "user",
      password: hashedPassword,
      provider: "local",
      providerId: "user@example.com",
      avatar: "https://placehold.co/100x100/90EE90/000000?text=User",
    });

    const sampleQuiz1 = await Quiz.create({
      title: "Sample Quiz 1: General Knowledge",
      description: "A quiz to test your general knowledge.",
      user: adminUser._id,
      isPublic: true,
      tags: ["general", "easy"],
    });

    const sampleQuiz2 = await Quiz.create({
      title: "Sample Quiz 2: Science Trivia",
      description: "Test your knowledge about science!",
      user: regularUser._id,
      isPublic: false,
      tags: ["science", "medium"],
    });

    const question1_1 = await Question.create({
      quiz: sampleQuiz1._id,
      type: "multiple_choice",
      content: "What is the capital of France?",
      timeLimit: 20,
      options: [
        { text: "Berlin", isCorrect: false },
        { text: "Madrid", isCorrect: false },
        { text: "Paris", isCorrect: true },
        { text: "Rome", isCorrect: false },
      ],
      points: 1,
    });

    const question1_2 = await Question.create({
      quiz: sampleQuiz1._id,
      type: "true_false",
      content: "The Earth is flat.",
      timeLimit: 15,
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
      points: 1,
    });

    const question2_1 = await Question.create({
      quiz: sampleQuiz2._id,
      type: "short_answer",
      content: "What is the chemical symbol for water?",
      timeLimit: 30,
      answerText: "H2O",
      points: 1,
    });

    const question2_2 = await Question.create({
      quiz: sampleQuiz2._id,
      type: "ordering",
      content: "Order the planets from the Sun outwards (first 4).",
      timeLimit: 45,
      correctOrder: ["Mercury", "Venus", "Earth", "Mars"],
      points: 1,
    });

    await Quiz.findByIdAndUpdate(sampleQuiz1._id, {
      $push: { questions: [question1_1._id, question1_2._id] },
    });
    await Quiz.findByIdAndUpdate(sampleQuiz2._id, {
      $push: { questions: [question2_1._id, question2_2._id] },
    });

    console.log("Sample data seeding completed.");
  }

  /**
   * Lấy trạng thái migration hiện tại của database và danh sách các migration đã định nghĩa.
   * @returns {Promise<{ currentVersion: number, migrations: MigrationWithStatus[] }>} 
   */
  async getMigrationStatus(): Promise<{ currentVersion: number, migrations: MigrationWithStatus[] }> {
    const dbVersionDoc = await MigrationVersion.findOne();
    const currentDbVersion = dbVersionDoc ? dbVersionDoc.version : 0;

    const migrationsWithStatus: MigrationWithStatus[] = allMigrations.map(m => ({
      version: m.version,
      name: m.name,
      status: (m.version <= currentDbVersion ? 'Applied' : 'Pending') as 'Applied' | 'Pending'
    }));

    return {
      currentVersion: currentDbVersion,
      migrations: migrationsWithStatus
    };
  }

  /**
   * Chạy các migration schema
   * Hệ thống này sẽ đảm bảo các migration chạy theo đúng thứ tự và chỉ chạy một lần.
   * @returns {Promise<{ message: string, migrationsRun: { version: number, name: string }[], newVersion: number }>}
   */
  async runSchemaMigrations(): Promise<{ message: string, migrationsRun: { version: number, name: string }[], newVersion: number }> {
    console.log("Starting schema migrations...");

    let dbVersionDoc = await MigrationVersion.findOne();
    let currentDbVersion = dbVersionDoc ? dbVersionDoc.version : 0;
    console.log(`Current database version: ${currentDbVersion}`);

    const pendingMigrations = allMigrations.filter(
      (m) => m.version > currentDbVersion
    ).sort((a, b) => a.version - b.version);

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations to run. Database is up to date.");
      return {
        message: "Database is already up to date.",
        migrationsRun: [],
        newVersion: currentDbVersion
      };
    }

    console.log(`Found ${pendingMigrations.length} pending migrations.`);
    const migrationsRun: { version: number, name: string }[] = [];
    let newVersion = currentDbVersion;

    for (const migration of pendingMigrations) {
      try {
        console.log(`Executing migration v${migration.version}: ${migration.name}`);
        await migration.up(); 

        dbVersionDoc = await MigrationVersion.findOneAndUpdate(
          {},
          { version: migration.version, lastRun: new Date() },
          { upsert: true, new: true }
        );
        newVersion = migration.version;
        migrationsRun.push({ version: migration.version, name: migration.name });
        console.log(`Successfully completed migration v${migration.version}. Database version updated to ${dbVersionDoc?.version}.`);
      } catch (error) {
        console.error(`Error executing migration v${migration.version}: ${migration.name}`, error);
        throw new Error(`Migration failed at version ${migration.version}: ${migration.name}. Error: ${(error as Error).message}`);
      }
    }

    console.log("All pending schema migrations completed.");
    return {
      message: "Schema migrations executed successfully!",
      migrationsRun: migrationsRun,
      newVersion: newVersion
    };
  }
}

export default new MigrationService();
