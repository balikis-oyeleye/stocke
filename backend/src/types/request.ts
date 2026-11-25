import type { Request } from "express";
import type { z } from "zod";

export type ValidatedRequest<T extends z.ZodType> = Request<{}, {}, z.infer<T>>;
