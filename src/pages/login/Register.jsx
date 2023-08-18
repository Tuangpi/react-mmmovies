import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../configs/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { UserAuth } from "../../context/AuthContext";

const Register = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { createUser } = UserAuth();

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(true);
      return;
    }

    try {
      await createUser(email, password);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
      console.error(e.message);
    }
  };

  return (
    <div className="tw-h-screen tw-bg-slate-200">
      <div className="tw-flex tw-min-h-full tw-flex-col tw-justify-center">
        <div className="sm:tw-mx-auto sm:tw-w-full sm:tw-max-w-sm">
          <h2 className="tw-mt-10 tw-text-center tw-text-2xl tw-font-bold tw-leading-9 tw-tracking-tight tw-text-gray-900">
            Sign up
          </h2>
        </div>

        <div className="tw-mt-10 sm:tw-mx-auto sm:tw-w-full sm:tw-max-w-sm">
          <form onSubmit={handleSignUp} className="tw-space-y-6">
            <div>
              <label
                htmlFor="email"
                className="tw-block tw-text-sm tw-font-medium tw-leading-6 tw-text-gray-900"
              >
                Email address
              </label>
              <div className="tw-mt-2">
                <input
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="tw-block tw-w-full tw-rounded-md tw-border-0 tw-p-1.5 tw-text-gray-900 tw-shadow-sm  placeholder:tw-text-gray-400 sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="tw-block tw-text-sm tw-font-medium tw-leading-6 tw-text-gray-900"
              >
                Password
              </label>
              <div className="tw-mt-2">
                <input
                  id="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="tw-block tw-w-full tw-rounded-md tw-border-0 tw-p-1.5 tw-text-gray-900 tw-shadow-sm  placeholder:tw-text-gray-400 sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="tw-block tw-text-sm tw-font-medium tw-leading-6 tw-text-gray-900"
              >
                Confirm Password
              </label>
              <div className="tw-mt-2">
                <input
                  id="confirm-password"
                  placeholder="Confrim Password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  name="confirmPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="tw-block tw-w-full tw-rounded-md tw-border-0 tw-p-1.5 tw-text-gray-900 tw-shadow-sm  placeholder:tw-text-gray-400 sm:tw-text-sm sm:tw-leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="tw-flex tw-w-full tw-justify-center tw-rounded-md tw-bg-indigo-600 tw-px-3 tw-py-1.5 tw-text-sm tw-font-semibold tw-leading-6 tw-text-white tw-shadow-sm hover:tw-bg-indigo-500 focus-visible:tw-outline focus-visible:tw-outline-2 focus-visible:tw-outline-offset-2 focus-visible:tw-outline-indigo-600"
              >
                Sign up
              </button>
            </div>
            {error && <span className="tw-text-red-700">Something wrong!</span>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
