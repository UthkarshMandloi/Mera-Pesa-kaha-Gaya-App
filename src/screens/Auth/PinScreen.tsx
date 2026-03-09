import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../constants/colors';
import { useAppStore } from '../../store/useAppStore';
import { getSetting, setSetting } from '../../database/queries';

const PinScreen = () => {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(true);

  const setAuthenticated = useAppStore((state) => state.setAuthenticated);

  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    const existingPin = await getSetting('app_password');
    if (existingPin && existingPin.length === 4) {
      setSavedPin(existingPin);
      setIsSettingUp(false);
    } else {
      setIsSettingUp(true);
    }
  };

  const handleKeyPress = async (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        if (isSettingUp) {
          await setSetting('app_password', newPin);
          Alert.alert('Success', 'PIN set successfully!');
          setAuthenticated(true);
        } else {
          if (newPin === savedPin) {
            setAuthenticated(true);
          } else {
            Alert.alert('Error', 'Incorrect PIN');
            setPin('');
          }
        }
      }
    }
  };

  const handleDelete = () => setPin(pin.slice(0, -1));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSettingUp ? 'Create a 4-Digit PIN' : 'Enter PIN'}</Text>
      <View style={styles.dotsContainer}>
        {[1, 2, 3, 4].map((_, index) => (
          <View key={index} style={[styles.dot, pin.length > index && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.padContainer}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((btn) => (
          <TouchableOpacity 
            key={btn} 
            style={[styles.padButton, btn === 'C' && { backgroundColor: 'transparent' }]} 
            onPress={() => {
              if (btn === '⌫') handleDelete();
              else if (btn === 'C') setPin('');
              else handleKeyPress(btn);
            }}
          >
            <Text style={styles.padText}>{btn}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 40 },
  dotsContainer: { flexDirection: 'row', gap: 15, marginBottom: 50 },
  dot: { width: 15, height: 15, borderRadius: 10, borderWidth: 1, borderColor: colors.primary, backgroundColor: 'transparent' },
  dotActive: { backgroundColor: colors.primary },
  padContainer: { width: '80%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 },
  padButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  padText: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
});

export default PinScreen;