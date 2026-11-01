const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated. Valid session required." });
    }
    const userRole = req.user.role || "customer";
    const hasRole =
      roles.includes(userRole) ||
      (roles.includes("guest") && userRole === "customer") ||
      (roles.includes("customer") && userRole === "guest");

    if (!hasRole) {
      return res.status(403).json({
        message: `Forbidden: role '${userRole}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { authorize };
