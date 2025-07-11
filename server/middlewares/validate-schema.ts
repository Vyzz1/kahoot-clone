import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects } from "zod";

type TypedRequest = "body" | "query" | "params";

const validateSchema = (
  schema: AnyZodObject | ZodEffects<any>,
  type: TypedRequest = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationTarget =
      type === "body" ? req.body : type === "query" ? req.query : req.params;

    if (!validationTarget) {
      res.status(400).json({ message: "No data to validate" });
      return;
    }

    const result = schema.safeParse(validationTarget);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

      res.status(400).send({
        message: "Validation error",
        details: errorMessages,
      });

      return;
    }
    next();
  };
};

export default validateSchema;
