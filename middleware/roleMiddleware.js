// Usage: authorize("admin") or authorize("admin", "user")
// Must be used AFTER the `protect` middleware, since it relies on req.user
// being set from the decoded JWT.
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no user found" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: role '${req.user.role}' is not allowed to perform this action`,
      });
    }

    next();
  };
};

module.exports = { authorize };
