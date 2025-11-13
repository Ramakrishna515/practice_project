import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [loading, setLoading] = useState(false);

  const closeModal = () => navigate(-1);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }
    if (!form.username || !form.email || !form.password) {
      setStatus("error");
      setMessage("Please fill in all fields");
      return;
    }

    setLoading(true);
    setMessage("");
    setStatus("idle");

    try {
      const { data } = await axios.post(`http://localhost:5001/api/signup`, form);

      const success =
        !!data?.user || /created/i.test(data?.message || "");

      if (success) {
        setStatus("success");
        setMessage(data?.message || "User created");
    
        setTimeout(() => navigate("/"), 1200);
      } else {
        setStatus("error");
        setMessage(data?.message || "Signup failed");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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

        <h2 className="text-2xl font-bold mb-4">Create Account</h2>

        <form onSubmit={handleSubmit} noValidate>
          <input
            className="w-full border p-2 mb-2 rounded"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
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
            className="w-full border p-2 mb-2 rounded"
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
          <input
            className="w-full border p-2 mb-4 rounded"
            name="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          <button
            className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700 disabled:bg-indigo-400"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
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
