import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

/**
 * Tipos de autenticação disponíveis na api
 */
const TiposAutenticacao = {
  FINGERPRINT: 1,
  FACIAL_RECOGNITION: 2,
  IRIS: 3,
};

/**
 * Chave do armazenamento criptografado
 */
const SECURE_STORAGE_KEY = "DADOS_AUTENTICACAO_UFJF";

export default function App() {
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [temBiometria, setTemBiometria] = useState(null);
  const [dadosLogin, setDadosLogin] = useState({ username: "", senha: "" });
  const [autenticado, setAutenticado] = useState(false);

  /**
   * Checa condições que garantem que a biometria vai funcionar, como se há suporte de hardware
   * se há suporte ao armazenamento criptografado (android 6+ e ios), se há métodos de autenticação
   * biométrica disponíveis.
   * No caso de haver suporte a biometria, checa se há dados de login salvos
   */
  async function checaPresencaDeBiometria() {
    let hasHardware = await LocalAuthentication.hasHardwareAsync();
    let hasSecureStorage = await SecureStore.isAvailableAsync();
    let biometria = false;
    if (hasHardware) {
      let temDadosBiometricosDefinidos = await LocalAuthentication.isEnrolledAsync();
      let metodosSuportados = await LocalAuthentication.supportedAuthenticationTypesAsync();

      //checa se tem suporte completo a biometria
      biometria =
        metodosSuportados.length > 0 &&
        temDadosBiometricosDefinidos &&
        hasSecureStorage;

      if (biometria) {
        //obtem dados de login do armazenamento criptografado
        let dadosLoginSecureStorage = JSON.parse(
          await SecureStore.getItemAsync(SECURE_STORAGE_KEY)
        );
        console.log("dadosLoginSecureStorage:", dadosLoginSecureStorage);
        //setDadosLogin(dadosLoginSecureStorage);
      }

      console.log("metodosSuportados:", metodosSuportados);
      console.log(
        "temDadosBiometricosDefinidos:",
        temDadosBiometricosDefinidos
      );
    }
    setTemBiometria(biometria);
    if (!biometria) {
      Alert.alert(
        "Teste Biometria",
        "O dispositivo não possui hardware de biometria"
      );
    }
  }

  useEffect(() => {
    if (temBiometria === null) {
      checaPresencaDeBiometria();
    }
  });

  /**
   * Autentica o usuário automaticamente usando biometria. Se o usuário for autenticado
   * busca do armazenamento seguro as credenciais
   */
  async function obtemBiometria() {
    let objAuth = await LocalAuthentication.authenticateAsync({
      promptMessage: "Autenticação Biométrica",
      cancelLabel: "Cancelar",
    });
    if (objAuth.success) {
      console.log("usuário autenticado");
      if(dadosLogin.username = 'Teste' && dadosLogin.senha == '1234'){
        console.log("credenciais salvas verificadas como ok");
        setAutenticado(true);
      }
    } else {
      console.log("Erro de biometria:", objAuth.error);
    }
  }

  const onPressEntrar = () => {
    let erroStr = "";
    if (username == "") {
      erroStr = "Digite o seu username";
    } else if (senha == "") {
      erroStr = "Digite a sua senha";
    } else if (username === "Teste" && senha === "1234") {
      if (temBiometria) {
        SecureStore.setItemAsync(
          SECURE_STORAGE_KEY,
          JSON.stringify({ username, senha })
        );
      }
      setAutenticado(true);
    } else {
      erroStr = "Usuário ou senha incorretos";
    }

    if (erroStr !== "") {
      Alert.alert("Teste Biometria", erroStr);
    }
  };

  const onPressEntrarBiometria = () => {
    obtemBiometria();
  };
  const onPressLogoff = () => {
    setAutenticado(false);
  };

  return (
    <View style={styles.container}>
      {!autenticado ? (
        <View style={styles.login}>
          <Text style={styles.label}>Usuário (Teste)</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setUsername(text)}
            value={username}
          />
          <Text style={styles.label}>Senha (1234)</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setSenha(text)}
            value={senha}
          />
          <View style={styles.botaoContainer}>
            <Button onPress={onPressEntrar} title="Entrar" color="#841584" />
          </View>
          {temBiometria ? (
            <Button
              onPress={onPressEntrarBiometria}
              title="Entrar com Biometria"
              color="#841584"
              disabled={dadosLogin.username==='' || dadosLogin.senha === ''}
            />
          ) : null}
        </View>
      ) : (
        <Button
          onPress={onPressLogoff}
          title="Deslogar"
          color="#841584"
        />
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  login: {
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
  },
  label: {
    width: "100%",
    height: 22,
  },
  botaoContainer: {
    marginBottom: 8,
  },
});
