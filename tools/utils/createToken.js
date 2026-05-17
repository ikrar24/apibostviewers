export const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://bostviewers.com" 
    : "https://apibostviewers.onrender.com" || process.env.NEXT_PUBLIC_BASE_URL ;

export async function createToken() {
  try {
    // Check stored timestamp
    const lastTokenTime = localStorage.getItem("token_created_at");

    if (lastTokenTime) {
      const diff = Date.now() - Number(lastTokenTime);
      const twoDays = 2 * 24 * 60 * 60 * 1000; // 2 days milliseconds

      // ✅ If 2 days are not completed → return without making request
      if (diff < twoDays) {
        // console.log("⏳ Token abhi valid hai. Request nahi bheji ja rahi.");
        return { message: "Token still valid (no request sent)" };
      }
    }

    // ✅ If 2 days gone or first time → Make request
    const res = await fetch(`${baseUrl}/create-token`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-client-key": process.env.NEXT_PUBLIC_SECRETE_KEY,
      },
    });

    const data = await res.json();

    // ✅ Save new timestamp in localStorage
    localStorage.setItem("token_created_at", Date.now().toString());

    // console.log("✅ New token stored, next request allowed after 2 days");

    return data;

  } catch (error) {
    console.log("Token Fetch Error:", error);
    return null;
  }
}
