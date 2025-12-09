const jwt = require("jsonwebtoken");

//new

import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "./generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

exports.protect = (roles = []) => {
  return (req, res, next) => {
    try {
      const header = req.headers.authorization;

      if (!header || !header.startsWith("Bearer "))
        return res.status(401).json({ message: "Not authorized" });

      const token = header.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: Access denied, insufficient role" });
      }

      req.user = decoded;
      next();
    } catch (err) {
      console.log(err);
      return res.status(401).json({ message: "Invalid JWT token" });
    }
  };
};
