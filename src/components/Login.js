import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: "", password: "" });


  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        form.email, 
        form.password
      );
      
      const user = userCredential.user;
      onLogin({
        email: user.email,
        uid: user.uid,
        name: user.email.split('@')[0]
      });
    } catch (error) {
      console.error("Login error:", error);
      alert("Invalid email or password");
    } 
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{
        backgroundImage: `url(https://t4.ftcdn.net/jpg/01/88/93/17/360_F_188931734_lghk3pjsHPlO6E2jJsaAABAVpJKi8cWj.jpg)`,
        height: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="card p-4"
        style={{
          width: 500,
          height: 400,
          backgroundImage:
            "url(https://t4.ftcdn.net/jpg/08/73/40/25/360_F_873402587_bLTgWHoQHMGVYPyrj64pxYbuNbVWNELH.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          flexDirection: "column",
          borderRadius: 8,
          display: "flex",
          justifyContent: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        }}
      >
        <h2 className="text-center mb-4">LOGIN</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
          <button
            type="submit"
           
            style={{
              width: "100%",
              padding: "10px",
              height: "45px",
              backgroundColor: "#f0ad4e",
              border: "none",
              marginBottom: "15px",
              borderRadius: "4px",
              fontWeight: "bold",
              
            }}
          >SUBMIT
            
          </button>
          <p style={{ marginTop: "10px", textAlign: "center" }}>
            <a
              href="/forget"
              style={{ color: "#efe3e3ff", textDecoration: "none" }}
            >
              Forgot Password?
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;