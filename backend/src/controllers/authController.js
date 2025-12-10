import { supabase } from "../utils/supabaseClient.js";

export async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create user with Supabase Auth (Admin)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // Insert profile in public.users
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        name,
        role: "member",
      });

    if (profileError) {
      return res.status(500).json({ message: profileError.message });
    }

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: authData.user.id,
        email,
        name,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    // Sign in using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ message: authError.message || "Invalid credentials" });
    }

    // Fetch user profile from DB
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      return res.status(500).json({ message: "Could not fetch user profile" });
    }

    return res.json({
      message: "Login successful",
      session: authData.session,
      user: userProfile,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
