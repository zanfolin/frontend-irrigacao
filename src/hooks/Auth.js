import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
// import { useUsersDatabase } from "../../database/useUsersDatabase";

const AuthContext = createContext();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BACKEND_URL =
  "https://crowded-fishsticks-pwjgjx97p9j27v6-3000.app.github.dev/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    autenticated: false,
    user: null,
    role: null,
  });
  //   const { authUser } = useUsersDatabase();

  const authUser = async (email, password) => {
    // console.log("Fetch:", email, password);
    try {
      const res = await fetch(`${BACKEND_URL}/signin`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          // 'User-Agent' só se precisar — no React Native geralmente não é necessário
        },
        body: JSON.stringify({ usuario: email, senha: password }),
      });

      //   console.log("Response status:", res.status, " ", res.ok);

      if (!res.ok) {
        // backend devolveu erro (401, 400, 500, ...)
        const msg = res?.body?.message || "Erro desconhecido do servidor.";
        return { ok: false, status: res.status, error: msg, data: res.body };
      }

      const resBody = await res.json();

      return { ok: true, status: res.status, data: resBody };
    } catch (err) {
      console.log("Fetch error:", err);
      if (err.name === "AbortError") {
        return { ok: false, status: 0, error: "Requisição expirou (timeout)." };
      }
      return { ok: false, status: 0, error: err.message || "Erro de rede." };
    }
  };

  useEffect(() => {
    const getUserStoraged = async () => {
      const userLogged = await AsyncStorage.getItem("@user:irrigacao");
      if (userLogged) {
        setUser({
          autenticated: true,
          user: JSON.parse(userLogged),
          role: JSON.parse(userLogged).role,
        });
      } else {
        setUser({
          autenticated: false,
          user: null,
          role: null,
        });
      }
    };
    getUserStoraged();
  }, []);

  const signIn = async ({ email, password }) => {
    // console.log("Tentando logar com:", email, password);
    const userExists = await authUser(email, password);
    // console.log("authUser returned:", userExists?.data?.token);

    const token = userExists?.data?.token || null;

    if (token === null) {
      console.log("Token inválido");
      setUser({
        autenticated: false,
        user: null,
        role: null,
      });
      await AsyncStorage.removeItem("@user:irrigacao");
      throw new Error("Usuário ou senha inválidos");
    }
    await AsyncStorage.setItem("@user:irrigacao", JSON.stringify(userExists.data));
    setUser({
      autenticated: true,
      user: userExists.data,
      role: userExists.role,
    });

    return userExists.data;
  };

  const signOut = async () => {
    await AsyncStorage.removeItem("@user:irrigacao");
    setUser({
      autenticated: false,
      user: null,
      role: null,
    });
  };

  if (user === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Carregando usuários</Text>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a AuthProvider");
  }

  return context;
}
