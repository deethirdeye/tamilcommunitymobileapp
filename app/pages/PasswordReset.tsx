import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { tailwind } from "react-native-tailwindcss";
import { LinearGradient } from "expo-linear-gradient";
import useTranslation from "@/app/i8n/useTranslationHook";
import PageHeader from "@/components/PageHeader";
import { useRouter } from "expo-router";
import { AppConfig } from "@/app/config/AppConfig";
import { RFValue } from "react-native-responsive-fontsize"; // For responsive font sizes
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen"; // For responsive dimensions

const PasswordReset: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState(""); // State for email validation error
  const { t } = useTranslation();

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format regex
    return emailRegex.test(email);
  };

  // Handle email input change and validate
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.trim() === "") {
      setEmailError(t("passwordReset.emailRequired"));
    } else if (!validateEmail(text)) {
      setEmailError(t("passwordReset.invalidEmail"));
    } else {
      setEmailError("");
    }
  };

  const handleSend = async () => {
    if (!email.trim()) {
      setEmailError(t("passwordReset.emailRequired"));
      Alert.alert(t("passwordReset.error"), t("passwordReset.emailRequired"));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t("passwordReset.invalidEmail"));
      Alert.alert(t("passwordReset.error"), t("passwordReset.invalidEmail"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${AppConfig.APIURL}/api/Account/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          t("passwordReset.success.title"),
          t("passwordReset.success.message")
        );
        router.push(`/pages/newPassword?email=${encodeURIComponent(email)}`);
      } else {
        Alert.alert(
          t("passwordReset.error"),
          result.message || t("passwordReset.errors.emailSend")
        );
      }
    } catch (error) {
      Alert.alert(t("passwordReset.error"), t("passwordReset.errors.generic"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[tailwind.flex1]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : hp(2)} // Responsive offset
    >
      <LinearGradient
        colors={["#E1F2FF", "#BFE6FF", "#99D6FF"]}
        style={[tailwind.flex1, { paddingHorizontal: wp(4) }]} // Responsive padding
      >
        <PageHeader title={t("passwordReset.passwordReset")} />
        <ScrollView
          style={[tailwind.flex1]}
          contentContainerStyle={[
            { paddingVertical: hp(10), paddingHorizontal: wp(2) }, // Responsive padding
          ]}
        >
          <View
            style={[tailwind.justifyCenter, tailwind.itemsCenter, { marginTop: hp(5) }]} // Responsive margin
          >
            <Text
              style={[
                tailwind.textXl,
                tailwind.fontBold,
                tailwind.textBlue900,
                tailwind.mB4,
                tailwind.textCenter,
                { fontSize: RFValue(20) }, // Responsive font size
              ]}
            >
              {t("passwordReset.title")}
            </Text>
            <View
              style={[{ width: wp(70) }, tailwind.mB4, tailwind.textCenter]} // 70% of screen width
            >
              <TextInput
                style={[
                  tailwind.wFull,
                  tailwind.border,
                  emailError ? tailwind.borderRed500 : tailwind.borderBlue200, // Red border on error
                  tailwind.bgWhite,
                  tailwind.roundedLg,
                  { paddingVertical: hp(1.5), paddingHorizontal: wp(4) }, // Responsive padding
                  tailwind.textBase,
                  tailwind.textCenter,
                  styles.inputShadow,
                  { fontSize: RFValue(16) }, // Responsive font size
                ]}
                placeholder={t("passwordReset.emailPlaceholder")}
                value={email}
                onChangeText={handleEmailChange} // Use validation handler
                placeholderTextColor="#64748B"
                textAlign="center"
                keyboardType="email-address" // Optimize for email input
                autoCapitalize="none" // Prevent auto-capitalization
                autoCorrect={false} // Disable auto-correct
              />
              {emailError ? (
                <Text
                  style={[
                    tailwind.textSm,
                    tailwind.textRed500,
                    tailwind.mT2,
                    tailwind.textCenter,
                    { fontSize: RFValue(12) }, // Responsive font size
                  ]}
                >
                  {emailError}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                tailwind.bgBlue600,
                { paddingVertical: hp(2) }, // Responsive padding
                tailwind.roundedLg,
                tailwind.shadowMd,
                { width: wp(90) }, // 90% of screen width
                tailwind.mB4,
                styles.buttonShadow,
              ]}
              onPress={handleSend}
              disabled={isLoading}
            >
              <Text
                style={[
                  tailwind.textWhite,
                  tailwind.textCenter,
                  tailwind.fontBold,
                  tailwind.textLg,
                  { fontSize: RFValue(18) }, // Responsive font size
                ]}
              >
                {isLoading
                  ? t("passwordReset.sendButton.sending")
                  : t("passwordReset.sendButton.send")}
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                tailwind.textBase,
                tailwind.textGray700,
                tailwind.textCenter,
                { paddingHorizontal: wp(4) }, // Responsive padding
                { fontSize: RFValue(14) }, // Responsive font size
              ]}
            >
              {t("passwordReset.verificationMessage")}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  buttonShadow: {
    shadowColor: "#0369A1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  inputShadow: {
    shadowColor: "#0369A1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default PasswordReset;