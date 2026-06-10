import { ZodError } from 'zod';

export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate req.body, req.query, and req.params if they are present in the schema
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed.',
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};
