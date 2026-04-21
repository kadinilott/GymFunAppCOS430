import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-header">
        <h1>GymFun</h1>
        <p>Making working out social and motivating</p>
      </div>

      <div className="login-card">
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />

        <button onClick={() => navigate("/home")}>Log in</button>

        <p className="forgot-password">Forgot password?</p>
      </div>

      <div className="signup-text">
        <p>Don&apos;t have an account?</p>
        <span>Sign up</span>
      </div>
    </div>
  );
}

export default LoginPage;