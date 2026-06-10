export const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User session not found.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Role '${req.user.role}' does not have permission to access this resource.` 
      });
    }

    next();
  };
};
