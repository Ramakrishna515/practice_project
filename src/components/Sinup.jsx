import React, { useState } from "react";
import axios from "axios";

export default function Sinup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/signup", form);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-lg rounded-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Create Account</h2>

        <input
          className="w-full border p-2 mb-2 rounded"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
        <input
          className="w-full border p-2 mb-2 rounded"
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          className="w-full border p-2 mb-2 rounded"
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />
        <input
          className="w-full border p-2 mb-4 rounded"
          name="confirmPassword"
          placeholder="Confirm Password"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button
          className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700"
          type="submit"
        >
          Sign Up
        </button>

        {message && <p className="text-center mt-3 text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
