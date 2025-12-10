import { supabase } from "../utils/supabaseClient.js";

export const protect = (roles = []) => {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization;

      if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not authorized" });
      }

      const token = header.split(" ")[1];

      // Verify token with Supabase
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      // Get user role from database
      const { data: userProfile } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // Check role if specified
      if (roles.length && !roles.includes(userProfile?.role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: Access denied, insufficient role" });
      }

      req.user = {
        id: data.user.id,
        email: data.user.email,
        role: userProfile?.role,
      };
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: "Token verification failed" });
    }
  };
};
