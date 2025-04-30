import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet
} from 'react-native';
import * as Location from 'expo-location';
import { tailwind } from 'react-native-tailwindcss';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFormContext } from '@/app/context/FormContext';
import useTranslation from '@/app/i8n/useTranslationHook';
import { LinearGradient } from 'expo-linear-gradient';
import PageHeader from '@/components/PageHeader';
import AppConfig from '@/app/config/AppConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BasicDetailsSignup: React.FC = () => {
  const { formData, setFormData } = useFormContext();
  const router = useRouter();
  const { Email } = useLocalSearchParams();
  const { t } = useTranslation();

  const emailString = Array.isArray(Email) ? Email[0] : Email || '';
  //const emailString ='dee@gmail.com'
  const [dob, setDob] = useState(formData.basicDetails?.dob || '');
  const [fullNameString, setFullNameString] = useState(formData.basicDetails?.fullName || '');
  const [mobile, setMobile] = useState(formData.basicDetails?.mobileNumber || '');
  const [currentLocation, setCurrentLocation] = useState(formData.basicDetails?.currentLocation || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('alert.attention'), t('basicDetails.locationDenied'));
          setCurrentLocation(t('basicDetails.locationDeniedText') || "Location Denied By User");
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(`${location.coords.latitude}, ${location.coords.longitude}`);
      } catch (error) {
        console.error("Error getting location:", error);
        setCurrentLocation(t('basicDetails.locationError') || "Location Error");
      }
    })();
  }, []);

  const handleMobileChange = (text: string) => {
    const cleaned = text.replace(/[^0-9+]/g, '');
    if (text && !text.startsWith('+')) {
      setMobile('+' + cleaned);
    } else {
      setMobile(cleaned);
    }
  };

  const validateMobileNumber = (mobile: string): boolean => {
    const regex = /^(?:\+91|\+60|\+65|\+44|\+61)\d{6,14}$/;
    return regex.test(mobile);
  };

  const handleDobChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    let formattedDate = '';

    if (digits.length <= 2) {
      formattedDate = digits;
    } else if (digits.length <= 4) {
      formattedDate = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formattedDate = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }

    if (formattedDate.length === 10) {
      const [day, month, year] = formattedDate.split('/').map(Number);
      const enteredDate = new Date(year, month - 1, day);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (enteredDate.getTime() >= today.getTime()) {
        Alert.alert(t('alert.attention'), t('basicDetails.errorFutureDate'));
        return;
      }
    }

    setDob(formattedDate);
  };

  // Function to store JWT token and user details
  const storeToken = async (Token: string, UserID: string, UserCode: string, FullName: string) => {
    try {
      await AsyncStorage.setItem('userToken', Token);
      await AsyncStorage.setItem('userId', UserID.toString());
      await AsyncStorage.setItem('UserCode', UserCode);
      await AsyncStorage.setItem('FullName', FullName); 
      await AsyncStorage.setItem('isLoggedIn', JSON.stringify(true));
      
      // Verify the stored values
      const token = await AsyncStorage.getItem('userToken');
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
      console.log("Stored token:", token);
      console.log("Login status:", isLoggedIn);
    } catch (error) {
      console.error("Error storing user data:", error);
      throw error;
    }
  };

//   const handleLoginAfterSignup = async (mobileNumber: string) => {
//     try {
//       const response = await fetch(`${AppConfig.APIURL}/api/Account/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           mobileNumber: mobileNumber,
//           password: 'TC@2025AUTO',
//         }),
//       });

//       const data = await response.json();
// console.log("Login response:", data);
//       if (data.ResponseCode === 1) {
//         // Store token and user details
//         await storeToken(
//           data.Token,
//           data.UserID.toString(),
//           data.UserCode,
//           data.FullName
//         );
        
        
        
//         return true;
//       } else {
//         console.error("Login failed:", data.Message);
//         return false;
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       return false;
//     }
//   };


const handleLoginAfterSignup = async (mobileNumber: string) => {
  try {
    const response = await fetch(`${AppConfig.APIURL}/api/Account/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobileNumber: mobileNumber,
        password: 'TC@2025AUTO',
      }),
    });

    const data = await response.json();
    console.log("Login response:2", data);
    
    if (data.ResponseCode === 1) {
      // Check if ResponseData exists and has at least one item
      if (data.ResponseData && data.ResponseData.length > 0) {
        const userData = data.ResponseData[0];
        // Store token and user details - make sure these fields exist in userData
        await storeToken(
          userData.Token,
          userData.UserID.toString(),
          userData.UserCode,
          userData.FullName
        );
        return true;
      } else {
        console.error("Login successful but no user data in ResponseData");
        return false;
      }
    } else {
      console.error("Login failed:", data.Message);
      return false;
    }
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

  const handleNext = async () => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) {
      Alert.alert(t('alert.attention'), t('basicDetails.errorDateFormat'));
      return;
    }

    if (!validateMobileNumber(mobile)) {
      Alert.alert(
        t('alert.attention'),
        t('basicDetails.errorMobileFormat') || 'Please add the country code before your number in the format +XX'
      );
      return;
    }

    const url = `${AppConfig.APIURL}/api/Account/SignupGoogle`;
    const payload = {
      FullName: fullNameString,
      Email: emailString,
      MobileNumber: mobile,
      password: 'AutoGeneratedPassword',
    };

    try {
      setIsLoading(true);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (response.ok) {
        // First save the basic details to context
        setFormData(prev => ({
          ...prev,
          basicDetails: {
            fullName: fullNameString,
            email: emailString,
            mobileNumber: mobile,
            dob,
            currentLocation,
          },
        }));
        
        // Then attempt to login with the default password
        const loginSuccess = await handleLoginAfterSignup(mobile);
    console.log("Login success:", loginSuccess);
        if (loginSuccess) {
          router.push('./nativedetails');
        } else {
          Alert.alert(t('alert.attention'), t('signup.loginAfterSignupFailed'));
        }
      } else if (responseData.ResponseCode === 2) {
        Alert.alert(t('alert.attention'), responseData.Message || t('signup.userAlreadyExists'));
      } else {
        Alert.alert(t('alert.attention'), responseData.Message || t('signup.somethingWentWrong'));
      }
    } catch (error) {
      Alert.alert(t('alert.attention'), t('signup.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#E1F2FF', '#BFE6FF', '#99D6FF']}
      style={[tailwind.flex1]}
    >
      <KeyboardAvoidingView
        style={[tailwind.flex1]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView style={[tailwind.flex1]}>
          <PageHeader title={t('basicDetails.completeProfile')} />

          <View style={[tailwind.p6]}>
            <Text style={[tailwind.textBlue800, tailwind.fontBold, tailwind.mB4, tailwind.text2xl]}>
              {t('basicDetails.personalDetails')}
            </Text>

            <TextInput
              style={[styles.input, tailwind.mB4]}
              placeholder={t('basicDetails.fullName')}
              placeholderTextColor="#718096"
              onChangeText={setFullNameString}
              value={fullNameString}
              editable={!isLoading}
            />

            <TextInput
              style={[styles.input, tailwind.mB4]}
              placeholder={t('basicDetails.email')}
              placeholderTextColor="#718096"
              value={emailString}
              //value='dee@gmail.com'
              editable={false}
            />

            <TextInput
              style={[styles.input, tailwind.mB4]}
              placeholder={t('basicDetails.mobileNumber') + ' (+12025550123)'}
              placeholderTextColor="#718096"
              value={mobile}
              onChangeText={handleMobileChange}
              keyboardType="phone-pad"
              maxLength={15}
              editable={!isLoading}
            />

            <TextInput
              style={[styles.input, tailwind.mB4]}
              placeholder={t('basicDetails.dobPlaceholder')}
              placeholderTextColor="#718096"
              value={dob}
              onChangeText={handleDobChange}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[tailwind.mT8, styles.button]}
              onPress={handleNext}
              disabled={isLoading}
            >
              <Text style={[tailwind.textWhite, tailwind.textLg, tailwind.fontBold]}>
                {isLoading ? t('basicDetails.saving') : t('basicDetails.nextButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  input: {
    ...tailwind.bgWhite,
    ...tailwind.p4,
    ...tailwind.roundedLg,
    ...tailwind.textLg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#0369A1',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    ...tailwind.bgBlue600,
    ...tailwind.p4,
    ...tailwind.roundedLg,
    ...tailwind.itemsCenter,
    shadowColor: '#0369A1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default BasicDetailsSignup;