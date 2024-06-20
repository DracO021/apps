import { useState } from 'react';
import {
  StyleSheet, Text, View, StatusBar, TextInput, Platform, Pressable, ScrollView,
  ActivityIndicator, Alert, Keyboard, ImageBackground
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const statusBarHeight = StatusBar.currentHeight;
const KEY_GPT = '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';

export default function App() {

  const [genero, setgenero] = useState("");
  const [tempo, settempo] = useState(3);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState("");
  const [error, setError] = useState(null);

  async function handleGenerate() {
    if (genero === "") {
      Alert.alert("Atenção", "Preencha o gênero do jogo!");
      return;
    }

    if (tempo > 7) {
      Alert.alert("Atenção", "O tempo de jogatina não deve ser em horário livre de compromissos e obrigações.");
      return;
    }

    setRecommendations("");
    setLoading(true);
    setError(null);
    Keyboard.dismiss();

    try {
      const prompt = createPrompt(genero, tempo);
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${KEY_GPT}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.20,
          max_tokens: 500,
          top_p: 1,
        })
      });

      const data = await response.json();
      // Corrigindo o acesso à resposta do GPT
      setRecommendations(data.choices[0].message.content); 
    } catch (error) {
      console.log(error);
      setError("Ocorreu um erro ao gerar as recomendações. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  function createPrompt(genero, tempo) {
    return `Recomende os 5 melhores jogos do genero ${genero} e gere uma pequena sinopse sobre o jogo.`;
  }

  return (
    <ImageBackground source={{uri: 'https://wallpapercave.com/wp/wp9383694.jpg'}} style={styles.backgroundImage}>
      <View style={styles.overlay}>
        <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />
        <Text style={styles.heading}>Joga AI</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Digite o gênero que você deseja obter recomendações de acordo com as notas do público</Text>
          <TextInput
            placeholder="Ex: Metroidvania"
            style={styles.input}
            value={genero}
            onChangeText={(text) => setgenero(text)}
          />

          <Text style={styles.label}>Tempo livre: <Text style={styles.tempo}>{tempo.toFixed(0)}</Text> horas</Text>
          <Slider
            minimumValue={1}
            maximumValue={10}
            minimumTrackTintColor="#009688"
            maximumTrackTintColor="#000000"
            value={tempo}
            onValueChange={(value) => settempo(value)}
          />
        </View>

        <Pressable style={styles.button} onPress={handleGenerate}>
          <Text style={styles.buttonText}>Gerar recomendações</Text>
          <MaterialIcons name="videogame-asset" size={24} color="#FFF" />
        </Pressable>

        <ScrollView contentContainerStyle={{ paddingBottom: 24, marginTop: 4 }} style={styles.containerScroll} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.content}>
              <Text style={styles.title}>Carregando recomendações... (especialmente pra você 😉​)</Text>
              <ActivityIndicator color="#000" size="large" />
            </View>
          )}

          {error && (
            <View style={styles.content}>
              <Text style={styles.title}>Erro ao gerar recomendações</Text>
              <Text style={{ lineHeight: 24 }}>{error}</Text>
              <Pressable style={styles.button} onPress={handleGenerate}>
                <Text style={styles.buttonText}>Tentar novamente</Text>
              </Pressable>
            </View>
          )}

          {recommendations && (
            <View style={styles.content}>
              <Text style={styles.title}>Recomendações de jogos 👇</Text>
              <Text style={{ lineHeight: 24 }}>{recommendations}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    alignItems: 'center',
    paddingTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingTop: Platform.OS === 'android' ? statusBarHeight : 54,
  },
  form: {
    backgroundColor: '#FFF',
    width: '90%',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#94a3b8',
    padding: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  tempo: {
    backgroundColor: '#F1F1F1',
  },
  button: {
    backgroundColor: '#FF5656',
    width: '90%',
    borderRadius: 8,
    flexDirection: 'row',
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    width:'100%',
  },
  content: {
    backgroundColor: '#FFF',
    padding: 16,
    width: '100%',
    marginTop: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },
  containerScroll: {
    width: '90%',
    marginTop: 8,
  },
});