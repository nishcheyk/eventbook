import { Request, Response, NextFunction } from "express";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (user?.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Access forbidden: Admins only" });
};

export default adminMiddleware;
