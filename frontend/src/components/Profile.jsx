import React, { useEffect, useState } from "react";

// Decode JWT payload (no verification) to extract user info stored in token
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    // base64url -> base64
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
  
}

export default function Profile() {
  const [user, setUser] = useState({ username: "", email: "" });
  const [photo, setPhoto] = useState(() => {
    return localStorage.getItem("profilePhoto") || "";
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const decoded = decodeToken(token);
    if (decoded) {
      setUser({
        username: decoded.username || "",
        email: decoded.email || "",
      });
    }
  }, []);

  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPhoto(dataUrl);
      localStorage.setItem("profilePhoto", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setPhoto("");
    localStorage.removeItem("profilePhoto");
  }

  return (
    <div style={{ maxWidth: 640, margin: "24px auto", padding: 20 }}>
      <h2 style={{ marginBottom: 12 }}>Profile</h2>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              overflow: "hidden",
              background: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {photo ? (
              <img
                src={photo}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: "#666" }}>
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </span>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          {photo && (
            <div style={{ marginTop: 8 }}>
              <button onClick={removePhoto}>Remove photo</button>
            </div>
          )}
        </div>

        <div>
          <div style={{ marginBottom: 8 }}>
            <strong>Name:</strong> {user.username || "(not set)"}
          </div>
          <div>
            <strong>Email:</strong> {user.email || "(not set)"}
          </div>
        </div>
      </div>
    </div>
  );
}
