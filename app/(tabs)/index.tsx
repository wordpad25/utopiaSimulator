import React, { useState, useEffect, useRef } from 'react';
import { Image, StyleSheet, ActivityIndicator, View, TouchableOpacity, Text, Animated } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const CLOUDFLARE_ACCOUNT_ID = "83f3a8b0093cf6a624908831023a903d";
const CLOUDFLARE_API_TOKEN = "oIz8sKeO1vaxMhJWcv2Lc2u7meQNe4uxtNImFdRm";
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;

export default function HomeScreen() {
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responseTimes, setResponseTimes] = useState([]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [titleText, setTitleText] = useState("Welcome to Utopia");

  const triggerFade = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        setTitleText("Economy is good!");
      }, 500);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };
  
  const fetchImage = async () => {
    setLoading(true);
    const startTime = performance.now();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          width: 1080,
          height: 1080,
          prompt: 'bit graphic for an icon for food policy'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      } else {
        console.error('Failed to fetch image:', response.status);
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    } finally {
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      setResponseTimes(prevTimes => [...prevTimes, duration]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImage();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.container}>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          imageBase64 && (
            <View style={styles.reactLogoContainer}>
              <Image source={{ uri: imageBase64 }} style={styles.reactLogo} />
            </View>
          )
        )}

        <View style={styles.contentContainer}>
          <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">{titleText}</ThemedText>
            <HelloWave />
          </ThemedView>

          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">API Response Times (seconds):</ThemedText>
            <ThemedText>
              {responseTimes.length > 0
                ? responseTimes.join(', ')
                : "Fetching..."}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.stepContainer}>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchImage}>
              <Text style={styles.refreshButtonText}>Refresh Image</Text>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.stepContainer}>
          <TouchableOpacity
  style={styles.fadeButton}
  onPress={() => {
    triggerFade();
  }}
>
  <Text style={styles.fadeButtonText}>Next</Text>
</TouchableOpacity>
          </ThemedView>
        </View>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reactLogoContainer: {
    width: '100%',
    aspectRatio: 1,     // Keeps the image square, aligned to the top
    backgroundColor: 'transparent',
  },
  reactLogo: {
    flex: 1,
    resizeMode: 'contain',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Text stays at the bottom
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fadeButton: {
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
  },
  fadeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
