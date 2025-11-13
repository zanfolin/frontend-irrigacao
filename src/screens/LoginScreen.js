import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import InputField from "../components/InputField";
import ButtonPrimary from "../components/ButtonPrimary";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../hooks/Auth";

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = React.useState("adm");
  const [senha, setSenha] = React.useState("minha_senha_123");

  const { signIn } = useAuth();

  const handleLogin = async () => {
    try {
      const result = await signIn({email: usuario, password: senha});
      // console.log("Login bem-sucedido:", result);
      if (result?.token) {
         navigation.replace('Main');
      }

    } catch (error) {
      console.log("Erro: ", error.message);
      Alert.alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="water" size={60} color="#fff" />
        <Text style={styles.titleHeader}>
          SISTEMA DE{"\n"}IRRIGAÇÃO{"\n"}INTELIGENTE
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Login</Text>
        <InputField
          placeholder="Usuário"
          value={usuario}
          onChangeText={setUsuario}
        />
        <InputField
          placeholder="Senha"
          secure={true}
          value={senha}
          onChangeText={setSenha}
        />
        <ButtonPrimary title="ENTRAR" onPress={handleLogin} />
        <TouchableOpacity onPress={() => navigation.navigate("Cadastro")}>
          <Text style={styles.footerText}>
            Não tem cadastro?{" "}
            <Text style={{ color: "#0b2a47" }}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flex: 1,
    backgroundColor: "#0b2a47",
    alignItems: "center",
    justifyContent: "center",
  },
  titleHeader: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },
  form: { flex: 2, backgroundColor: "#fff", padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0b2a47",
    marginBottom: 20,
  },
  footerText: { textAlign: "center", marginTop: 10, color: "#0b2a47" },
});
