import { useEffect } from "react";
import { supabase } from "../lib/supabase";

function TestSupabase() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*");

      if (error) {
        console.error("❌ Supabase error:", error);
        return;
      }

      console.log("✅ Supabase connected!");
      console.log("Categories:", data);
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: "50px" }}>
      <h1>Supabase Test</h1>
      <p>Open F12 → Console to see the result.</p>
    </div>
  );
}

export default TestSupabase;