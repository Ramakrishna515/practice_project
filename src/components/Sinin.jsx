import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Sinin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "success" | "error"
  const [loading, setLoading] = useState(false);

  const closeModal = () => navigate(-1);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setStatus("error");
      setMessage("Please enter both email and password");
      return;
    }

    setLoading(true);
    setStatus("loading");
    setMessage("");

    try {
      const { data } = await axios.post(`http://localhost:5001/api/signin`, form);

      // Adjust success detection based on your backend response
      const success = !!data?.token || !!data?.user || /success|ok|logged/i.test(data?.message || "");

      if (success) {
        setStatus("success");
        setMessage(data?.message || "Signed in successfully");

        // Example: save token (uncomment if backend returns token)
        // localStorage.setItem("token", data.token);

        setTimeout(() => navigate("/"), 800); // close modal and go home
      } else {
        setStatus("error");
        setMessage(data?.message || "Sign-in failed");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={closeModal}
    >
      <div
        className="bg-white p-6 shadow-xl rounded-lg w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute right-3 top-3 text-gray-500 hover:text-black text-xl"
          type="button"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>

        <form onSubmit={handleSubmit} noValidate>
          <input
            className="w-full border p-2 mb-2 rounded"
            name="email"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <input
            className="w-full border p-2 mb-4 rounded"
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />

          <button
            className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          {message && (
            <p
              className={`text-center mt-3 text-sm ${
                status === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
