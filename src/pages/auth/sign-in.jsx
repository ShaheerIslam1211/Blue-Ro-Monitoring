import { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard/home");
    } catch (error) {
      let errorMessage = "Failed to sign in";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Invalid email address";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled";
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password";
          break;
        default:
          errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/path-to-your-logo.png" 
            alt="RO Plant Logo" 
            className="h-16 w-16"
            onError={(e) => e.target.style.display = 'none'} // Fallback if logo doesn't exist
          />
        </div>
        <Typography variant="h3" className="text-blue-900 font-bold">
          Blue Tech- RO Plant Monitoring
        </Typography>
        <Typography variant="paragraph" color="blue-gray" className="mt-1">
          Management Software
        </Typography>
      </div>

      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center">
          <Typography variant="h4" className="font-bold text-blue-900">
            Welcome Back
          </Typography>
          <Typography variant="paragraph" color="blue-gray" className="mt-2 font-normal">
            Enter your credentials to access your account
          </Typography>
        </div>
        
        <form className="mt-8 mb-2 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Email Address
              </Typography>
              <Input
                type="email"
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="!border-t-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                disabled={isLoading}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                Password
              </Typography>
              <Input
                type="password"
                size="lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="!border-t-blue-gray-200 focus:!border-blue-500"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <Typography variant="small" color="red" className="flex items-center justify-center mt-2">
              <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full">
                {error}
              </span>
            </Typography>
          )}

          <Button
            type="submit"
            className="mt-6 bg-blue-500 hover:bg-blue-600 transition-colors"
            fullWidth
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>

          <Typography variant="small" className="text-center font-normal text-blue-gray-600">
            Need help?{" "}
            <Link to="/contact-support" className="font-medium text-blue-500 hover:text-blue-700 transition-colors">
              Contact Support
            </Link>
          </Typography>
        </form>
      </Card>

      <Typography variant="small" className="text-center mt-8 text-blue-gray-500">
        © {new Date().getFullYear()} RO Plant Tracking. All rights reserved.
      </Typography>
    </section>
  );
}

export default SignIn;
