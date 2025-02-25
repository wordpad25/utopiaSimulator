import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
  Animated
} from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const CLOUDFLARE_ACCOUNT_ID = "83f3a8b0093cf6a624908831023a903d";
const CLOUDFLARE_API_TOKEN = "oIz8sKeO1vaxMhJWcv2Lc2u7meQNe4uxtNImFdRm";
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;

const slides = [
  {
    title: "Communist Utopia is here!",
    subtitle: "Intro",
    text: "Yay! After hard work we finally built a utopia!",
    fadeDuration: 500
  },
  {
    title: "Communist Utopia is here!",
    subtitle: "Society",
    text: "A harmonious community where resources are shared equally...",
    fadeDuration: 500
  },
  {
    title: "Communist Utopia is here!",
    subtitle: "Work Life",
    text: "Individuals contribute according to abilities and receive according to needs...",
    fadeDuration: 500
  },
  {
    title: "Communist Utopia is here!",
    subtitle: "Personal Life",
    text: "People pursue fulfillment with ample leisure time and communal resources...",
    fadeDuration: 500
  },
  {
    title: "Oh, NO!",
    subtitle: "Work Life",
    text: "Due to mismanagement of crops, there's mass starvation, riots, and the city is on fire...",
    fadeDuration: 6000 // longer fade
  },
  {
    title: "What should we do next time?",
    subtitle: "",
    text: "Select a policy that might have helped:",
    fadeDuration: 500,
    policies: [
      "Panel of experts to guide economic decisions",
      "Better crop management system",
      "Real-time public feedback mechanisms",
      "Restructured farmland policies"
    ]
  }
];

export default function HomeScreen() {
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responseTimes, setResponseTimes] = useState([]);

  // Track current slide index:
  const [currentSlide, setCurrentSlide] = useState(0);

  // For fading in/out
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Fetch image code
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

  // Initial fetch
  useEffect(() => {
    fetchImage();
  }, []);

  // Handle fade out/in to next slide
  const goToNextSlide = () => {
    // If we’re at the last slide, do nothing
    if (currentSlide >= slides.length - 1) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500, 
      useNativeDriver: true
    }).start(() => {
      // Update slide index
      setCurrentSlide(prev => prev + 1);

      // Fade in with the slide’s specified duration
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: slides[currentSlide + 1].fadeDuration,
        useNativeDriver: true
      }).start();
    });
  };

  const slideData = slides[currentSlide];

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.container}>
        {/* Example image usage */}
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
            <ThemedText type="title">{slideData.title}</ThemedText>
            <HelloWave />
          </ThemedView>

          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">{slideData.subtitle}</ThemedText>
            <ThemedText>{slideData.text}</ThemedText>
          </ThemedView>

          {/* If there are policy suggestions in this slide, show them */}
          {slideData.policies && (
            <View style={styles.policiesContainer}>
              {slideData.policies.map((policy, idx) => (
                <TouchableOpacity key={idx} style={styles.policyButton}>
                  <Text style={styles.policyButtonText}>{policy}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Simple list of response times, to keep your original functionality */}
          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">API Response Times (s):</ThemedText>
            <ThemedText>
              {responseTimes.length > 0
                ? responseTimes.join(', ')
                : "Fetching..."}
            </ThemedText>
          </ThemedView>

          {/* Refresh button: re-fetch the image */}
          <ThemedView style={styles.stepContainer}>
            <TouchableOpacity style={styles.refreshButton} onPress={fetchImage}>
              <Text style={styles.refreshButtonText}>Refresh Image</Text>
            </TouchableOpacity>
          </ThemedView>

          {/* Next button to move to the next slide */}
          <ThemedView style={styles.stepContainer}>
            <TouchableOpacity style={styles.fadeButton} onPress={goToNextSlide}>
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
    aspectRatio: 1,
    backgroundColor: 'transparent',
  },
  reactLogo: {
    flex: 1,
    resizeMode: 'contain',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
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
  policiesContainer: {
    marginVertical: 10,
    gap: 6
  },
  policyButton: {
    backgroundColor: '#aaa',
    padding: 10,
    borderRadius: 5
  },
  policyButtonText: {
    color: '#fff'
  },
});
