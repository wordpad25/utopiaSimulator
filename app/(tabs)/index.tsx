import Sound from 'react-native-sound';
import { Audio } from 'expo-av';
import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  StyleSheet,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Text,
  Animated,
  ScrollView
} from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const CLOUDFLARE_ACCOUNT_ID = "83f3a8b0093cf6a624908831023a903d";
const CLOUDFLARE_API_TOKEN = "oIz8sKeO1vaxMhJWcv2Lc2u7meQNe4uxtNImFdRm";
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`;

const constructionSound = new Audio.Sound();
const choirSound = new Audio.Sound();


// Stop and start sound helper functions
const playConstruction = async () => {
  try {
    await choirSound.stopAsync();
    await constructionSound.loadAsync(require('../../../assets/sounds/construction.mp3'));
    await constructionSound.playAsync();
  } catch (error) {
    console.log('Failed to play construction sound:', error);
  }
};

const stopConstruction = async () => {
  try {
    await constructionSound.stopAsync();
    await constructionSound.unloadAsync(); // Unload to allow replaying later
    await choirSound.playAsync();
  } catch (error) {
    console.log('Failed to stop construction sound:', error);
  }
};

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
    fadeDuration: 3000
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chosenPolicies, setChosenPolicies] = useState([]);
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
          prompt: 'A vibrant, futuristic cityscape set in a communist utopia, where grand architectural buildings of equal height line the streets, adorned with red banners and symbols of unity. People of diverse backgrounds are joyfully collaborating in public squares filled with lush greenery and fountains, reflecting harmony and prosperity. Advanced technology seamlessly integrates with nature, showcasing eco-friendly infrastructure and public transportation systems. The atmosphere is bright and optimistic, with a sense of collective progress and shared wealth. Soft sunlight bathes the scene, highlighting the unity and equality among all citizens.'
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
    async function loadSounds() {
      try {
        await choirSound.loadAsync(require('../../../assets/sounds/choir.mp3'));
        await choirSound.setIsLoopingAsync(true);
        await choirSound.playAsync();
      } catch (error) {
        console.log('Failed to load choir sound:', error);
      }
    }
  
    loadSounds();
  
    // Cleanup on unmount
    return () => {
      choirSound.unloadAsync();
      constructionSound.unloadAsync();
    };
  }, []);

  const goToNextSlide = () => {
    if (currentSlide >= slides.length - 1) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500, 
      useNativeDriver: true
    }).start(() => {
      setCurrentSlide(prev => prev + 1);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: slides[currentSlide + 1].fadeDuration,
        useNativeDriver: true
      }).start();
    });
  };

  const handlePolicyChoice = (policy) => {
    setChosenPolicies(prev => [...prev, policy]);
    setLoading(true);
  
    // Fade out and play construction sound
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true
    }).start(async () => {
      playConstruction(); // Start construction sound
      setCurrentSlide(0);
  
      // Fetch a new image, then fade back in and stop construction sound
      fetchImage().then(() => {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }).start(() => {
          stopConstruction(); // Stop construction sound when fading in
        });
      });
    });
  };
  
  
  

  const slideData = slides[currentSlide];

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
            <ThemedText type="title">{slideData.title}</ThemedText>
            <HelloWave />
          </ThemedView>

          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">{slideData.subtitle}</ThemedText>
            <ThemedText>{slideData.text}</ThemedText>
          </ThemedView>

          {slideData.policies && (
            <View style={styles.policiesContainer}>
              {slideData.policies.map((policy, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.policyButton}
                  onPress={() => handlePolicyChoice(policy)}
                >
                  <Text style={styles.policyButtonText}>{policy}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <ThemedView style={styles.stepContainer}>
            <TouchableOpacity style={styles.fadeButton} onPress={goToNextSlide}>
              <Text style={styles.fadeButtonText}>Next</Text>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.stepContainer}>
            <ThemedText type="subtitle">Policies:</ThemedText>
            <ScrollView>
              {chosenPolicies.map((policy, idx) => (
                <Text key={idx} style={styles.policyText}>{policy}</Text>
              ))}
            </ScrollView>
          </ThemedView>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',  // Added for consistent background
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
    paddingHorizontal: 20, // Added padding for better text alignment
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10, // Added margin for spacing
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  policiesContainer: {
    marginVertical: 10,
    gap: 6,
  },
  policyButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  policyButtonText: {
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
    marginTop: 10,
  },
  fadeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  policyText: {
    color: '#444',
    fontSize: 14,
    marginBottom: 4,
  },
});

