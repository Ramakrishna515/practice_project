import { useNavigate } from "react-router-dom";

export default function Sinup() {
  const navigate = useNavigate();

  // close modal
  const closeModal = () => navigate(-1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 shadow-xl rounded-lg w-full max-w-md relative">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute right-3 top-3 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Create Account</h2>

        <input className="w-full border p-2 mb-2 rounded" placeholder="Username" />
        <input className="w-full border p-2 mb-2 rounded" placeholder="Email" />
        <input className="w-full border p-2 mb-2 rounded" placeholder="Password" type="password" />
        <input className="w-full border p-2 mb-4 rounded" placeholder="Confirm Password" type="password" />

        <button className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700">
          Sign Up
        </button>
      </div>
    </div>
  );
}
