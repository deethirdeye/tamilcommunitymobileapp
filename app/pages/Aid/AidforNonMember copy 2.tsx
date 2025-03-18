import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useFormContext } from '@/app/context/FormContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useTranslation from "@/app/i8n/useTranslationHook";
import PageHeader from "@/components/PageHeader";
import { AppConfig } from '@/app/config/AppConfig';

const NonMemberDetails: React.FC = () => {
  const { formData, setFormData } = useFormContext(); 
  const router = useRouter();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState(formData.nonMemberDetails?.fullName || '');
  const [email, setEmail] = useState(formData.nonMemberDetails?.email || '');
  const [mobileNumber, setMobileNumber] = useState(formData.nonMemberDetails?.mobileNumber || '');
  const [EmergencyContactPersonName, setEmergencyContactPersonName] = useState(formData.nonMemberDetails?.EmergencyContactPersonName || '');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(formData.nonMemberDetails?.emergencyContactNumber || '');
  const [userId, setUserId] = useState<string | number | null>(null); 

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId !== null) {
          setUserId(Number(storedUserId));
        }
      } catch (error) {
        console.error("Failed to fetch userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  const validateForm = () => {
    if (!fullName) return t('validations.fullNameRequired');
    if (fullName.length < 3) return t('validations.fullNameMinLength');
    if (!email) return t('validations.emailRequired');
    if (!/\S+@\S+\.\S+/.test(email)) return t('validations.emailInvalid');
    if (!mobileNumber) return t('validations.mobileRequired');
    if (!/^\d{10}$/.test(mobileNumber)) return t('validations.mobileInvalid');
    if (!EmergencyContactPersonName) return t('validations.emergencyContactNameRequired');
    if (EmergencyContactPersonName.length < 3) return t('validations.emergencyContactNameMinLength');
    if (!emergencyContactNumber) return t('validations.emergencyContactNumberRequired');
    if (!/^\d{10}$/.test(emergencyContactNumber)) return t('validations.emergencyContactNumberInvalid');
    return null;
  };

  const handleNext = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert(t('alerts.error'), validationError);
      return;
    }

    try {
      const response = await fetch(`${AppConfig.APIURL}/api/NonMember/AddNonMemberDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId, fullName, mobileNumber, email, EmergencyContactPersonName, emergencyContactNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/pages/Aid/AidForSomeoneNonMember");
      } else {
        Alert.alert(t('alerts.error'), data.message || t('alerts.emailExists'));
      }
    } catch (error) {
      Alert.alert(t('alerts.error'), t('alerts.networkError'));
    }
  };

  return (
    <LinearGradient colors={['#E1F2FF', '#BFE6FF', '#99D6FF']} style={styles.container}>
      <PageHeader title={t('aidForNonMember.title')} />

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder={t('aidForNonMember.fullNamePlaceholder')}
            placeholderTextColor="#94A3B8"
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder={t('aidForNonMember.emailPlaceholder')}
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder={t('aidForNonMember.mobileNumberPlaceholder')}
            placeholderTextColor="#94A3B8"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder={t('aidForNonMember.emergencyContactPersonNamePlaceholder')}
            placeholderTextColor="#94A3B8"
            value={EmergencyContactPersonName}
            onChangeText={setEmergencyContactPersonName}
          />

          <TextInput
            style={styles.input}
            placeholder={t('aidForNonMember.emergencyContactNumberPlaceholder')}
            placeholderTextColor="#94A3B8"
            value={emergencyContactNumber}
            onChangeText={setEmergencyContactNumber}
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleNext}>
            <Text style={styles.submitButtonText}>{t('aidForNonMember.nextButton')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  formContainer: { padding: 16 },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
    color: '#0369A1',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitButton: {
    backgroundColor: '#0369A1',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default NonMemberDetails;
