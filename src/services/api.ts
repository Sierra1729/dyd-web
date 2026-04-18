const API_URL = "https://dyd-web.onrender.com/api";

async function request(endpoint: string, options: RequestInit) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, options);

    // 🔥 IMPORTANT: handle non-JSON responses
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Not JSON response:", text);
      throw new Error("Server returned invalid response");
    }

    if (!res.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error: any) {
    console.error("API Error:", error.message);
    throw error;
  }
}

export const apiService = {
  // ✅ SAVE USER (Registration)
  saveUser: (data: any, token: string) =>
    request("/saveUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  // ✅ GET USER PROFILE
  getUser: (token: string) =>
    request("/getUser", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 🔐 Get all candidates (admin)
  getAllCandidates: (token: string) =>
    request("/allCandidates", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 🔐 Delete candidate (admin)
  deleteCandidate: (id: string, token: string) =>
    request(`/candidate/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 🔐 Update candidate (admin)
  updateCandidate: (id: string, data: any, token: string) =>
    request(`/candidate/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  // 🔐 Get analytics (admin)
  getAnalytics: (token: string) =>
    request("/analytics", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // 🔐 Update OWN profile
  updateProfile: (data: any, token: string) =>
    request("/updateProfile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }),

  // 🔐 Approve candidate (admin)

  aapproveCandidate: async (id: string, token: string) => {
    const res = await fetch(`${API_URL}/approve/${id}`, {
      method: "PUT", // ✅ MUST be PUT
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ API Error:", text);
      throw new Error("Approval failed");
    }

    return res.json();
  },


  // 🔐 Reject candidate (admin)
  rejectCandidate: (id: string, token: string) =>
    request(`/candidate/${id}/reject`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};