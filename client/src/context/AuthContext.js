// AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { Altaxios } from "../frontend/Altaxios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mustVerifyEmail, setMustVerifyEmail] = useState(false);
  // Validate logged-in user when app loads or refreshes

  useEffect(() => {
  const checkLogin = async () => {
    setLoading(true);
    setMustVerifyEmail(false);
    try {
      // make sure Altaxios sends cookies (or configure globally)
      const res = await Altaxios.get("/users/vefiryUsersLog");
      // backend returns { message, AccessData: { ... } }
      const access = res.data?.AccessData;

      // store only the AccessData shape you expect
      setUser(access);
      setMustVerifyEmail(true);
    } catch (err) {
      // if server responded with a message, handle it specially
      if (err?.response?.data?.message === "Verify your email") {
        setUser("Verify your email");
        setMustVerifyEmail(false);
      } else {
        setUser("Verify your email");
        setMustVerifyEmail(false);
      }
    } finally {
      setLoading(false);
    }
  };

  checkLogin();
}, []);
  // LOGIN
  const login = async (email, password) => {
    const res = await Altaxios.post("/users/useLogin", { email, password });
    if (res.status === 200) {
      setUser(res.data.AccessData);
      return { success: true, data: res.data.AccessData };
    }

    return { success: false };
  };

  // REGISTER
// REGISTER (Correct)
const register = async (companyData) => {
  const res = await Altaxios.post("/users/register", companyData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // store user access data
  setUser(res.data.AccessData);

  return res; // return full axios response
};

  // LOGOUT
  const logout = async () => {
    try {
      await Altaxios.get("/users/logout");
      setUser(null);
      return true;        // ❗ Caller will handle redirect
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const updateEmployee = async (employeeId,employeeData) => {
      const updEmployee = await Altaxios.put(`/newemplyee/updateEmployee/${employeeId}`,employeeData);
      setUser(updEmployee.data.AccessData);
      return updEmployee;
  };

    const updateProfile = async (employeeId,employeeData) => {
    const updEmployeeProfile = await Altaxios.put(`/newemplyee/ChangeProfile/${encodeURIComponent(employeeId)}`,employeeData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
      setUser(updEmployeeProfile.data.AccessData);
      return updEmployeeProfile;
  };



  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, mustVerifyEmail, updateEmployee, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
