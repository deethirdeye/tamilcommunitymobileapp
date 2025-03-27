import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Linking,
  BackHandler,
  Alert,
} from "react-native";
import useTranslation from "@/app/i8n/useTranslationHook";
import { router, useFocusEffect } from "expo-router";
import { t, tailwind } from "react-native-tailwindcss";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RFValue } from "react-native-responsive-fontsize"; // For responsive font sizes
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen"; // For responsive dimensions

// Get screen dimensions (optional, for reference)
const { height, width } = Dimensions.get("window");

interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
}

const Aid = () => {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setIsLoading(true);

    const urls = [
      "https://api.rss2json.com/v1/api.json?rss_url=https://www.thestar.com.my/rss/News",
      "https://feed2json.org/convert?url=https://www.thestar.com.my/rss/News",
    ];

    let data;
    let error;

    try {
      const response = await fetch(urls[0]);
      if (!response.ok) throw new Error("Failed to fetch from first URL");
      data = await response.json();
    } catch (err) {
      error = err;
      console.error("Error fetching from first URL:", err);

      try {
        const response = await fetch(urls[1]);
        if (!response.ok) throw new Error("Failed to fetch from second URL");
        data = await response.json();
      } catch (err) {
        error = err;
        console.error("Error fetching from second URL:", err);
      }
    }

    console.log("API Response:", data);

    if (data && data.items && Array.isArray(data.items)) {
      const formattedNews: NewsItem[] = data.items.map((item: any) => {
        let formattedDate = "Unknown";
        if (item.pubDate) {
          const parsedDate = new Date(item.pubDate);
          if (!isNaN(parsedDate.getTime())) {
            formattedDate = parsedDate.toLocaleDateString();
          }
        }

        return {
          id: item.guid || item.link,
          title: item.title || "No Title",
          description: item.description || "No description available",
          source: "The Star Malaysia",
          url: item.link || "#",
          publishedAt: formattedDate,
        };
      });

      setNews(formattedNews);
    } else {
      setNews([
        {
          id: "1",
          title: "Unable to load news at the moment",
          description: "Please check back later",
          source: "System",
          url: "",
          publishedAt: new Date().toLocaleDateString(),
        },
      ]);
    }

    setIsLoading(false);
  };

  const renderNewsSection = () => (
    <View
      style={[
        tailwind.p4,
        styles.newsSection,
        tailwind.mB12,
        { paddingHorizontal: wp(4) }, // 4% of screen width
      ]}
    >
      <Text
        style={[
          tailwind.text2xl,
          tailwind.fontBold,
          tailwind.textBlue900,
          tailwind.mB4,
          { fontSize: RFValue(24) }, // Responsive font size
        ]}
      >
        {t("aid.communityNews")}
      </Text>
      {isLoading ? (
        <View style={[tailwind.p4, tailwind.itemsCenter]}>
          <Text style={{ fontSize: RFValue(16) }}>
            {t("aid.loadingNews")}
          </Text>
        </View>
      ) : news.length === 0 ? (
        <View style={[tailwind.p4, tailwind.itemsCenter]}>
          <Text style={{ fontSize: RFValue(16) }}>{t("aid.noNews")}</Text>
        </View>
      ) : (
        news.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              tailwind.p4,
              tailwind.mB4,
              styles.newsCard,
              { padding: wp(4) }, // 4% of screen width
            ]}
            onPress={() => Linking.openURL(item.url)}
          >
            <Text
              style={[
                tailwind.textLg,
                tailwind.fontSemibold,
                tailwind.textBlue800,
                { fontSize: RFValue(18) },
              ]}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text
                style={[
                  tailwind.textSm,
                  tailwind.textGray700,
                  tailwind.mT2,
                  { fontSize: RFValue(14) },
                ]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
            <View
              style={[tailwind.flexRow, tailwind.justifyBetween, tailwind.mT2]}
            >
              <Text
                style={[
                  tailwind.textSm,
                  tailwind.textBlue600,
                  { fontSize: RFValue(12) },
                ]}
              >
                {item.source}
              </Text>
              <Text
                style={[
                  tailwind.textSm,
                  tailwind.textGray600,
                  { fontSize: RFValue(12) },
                ]}
              >
                {item.publishedAt}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const handleBackPress = () => {
    Alert.alert(
      t("exit.title", "Exit Account"),
      t("exit.message", "You are about to exit your account. Do you want to continue?"),
      [
        {
          text: t("exit.cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("exit.confirm", "Exit"),
          onPress: () => BackHandler.exitApp(),
        },
      ],
      { cancelable: false }
    );
    return true;
  };

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );
      return () => backHandler.remove();
    }, [])
  );

  return (
    <LinearGradient
      colors={["#E1F2FF", "#BFE6FF", "#99D6FF"]}
      style={[tailwind.flex1]}
    >
      <ScrollView style={[tailwind.flex1]}>
        <View
          style={[
            tailwind.pX6,
            tailwind.mT8,
            { paddingHorizontal: wp(6) }, // 6% of screen width
          ]}
        >
          <Text
            style={[
              tailwind.text3xl,
              tailwind.fontBold,
              tailwind.textBlue900,
              tailwind.textCenter,
              tailwind.mB6,
              { fontSize: RFValue(28) },
            ]}
          >
            {t("aid.addressGrievance")}
          </Text>
        </View>
        <View
          style={[
            tailwind.pX4,
            { height: hp(25), paddingHorizontal: wp(4) }, // 25% of screen height, 4% of screen width
          ]}
        >
          <View
            style={[
              tailwind.flexRow,
              tailwind.justifyAround,
              tailwind.mT4,
              { gap: wp(2) }, // 2% of screen width for gap
            ]}
          >
            <TouchableOpacity
              style={[
                tailwind.itemsCenter,
                styles.iconContainer,
                { width: wp(25) }, // 25% of screen width
              ]}
              onPress={() => router.push("../../pages/Aid/Aidforme")}
            >
              <View
                style={[
                  styles.iconBackground,
                  {
                    padding: wp(4), // 4% of screen width
                    borderRadius: wp(5), // 5% of screen width
                  },
                ]}
              >
                <Ionicons
                  name="person"
                  size={RFValue(32)} // Responsive icon size
                  color="#0369A1"
                />
              </View>
              <Text
                style={[
                  tailwind.textSm,
                  tailwind.fontMedium,
                  tailwind.textBlue800,
                  tailwind.mT2,
                  tailwind.textCenter,
                  { fontSize: RFValue(12) },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t("requestAid.myself")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                tailwind.itemsCenter,
                styles.iconContainer,
                { width: wp(25) },
              ]}
              onPress={() => router.push("../../pages/Aid/AidForSomeone")}
            >
              <View
                style={[
                  styles.iconBackground,
                  {
                    padding: wp(4),
                    borderRadius: wp(5),
                  },
                ]}
              >
                <Ionicons
                  name="people"
                  size={RFValue(32)}
                  color="#0369A1"
                />
              </View>
              <Text
                style={[
                  tailwind.textSm,
                  tailwind.fontMedium,
                  tailwind.textBlue800,
                  tailwind.mT2,
                  tailwind.textCenter,
                  { fontSize: RFValue(12) },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t("requestAid.someoneElse")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                tailwind.itemsCenter,
                styles.iconContainer,
                { width: wp(25) },
              ]}
              onPress={() => router.push("../../pages/Aid/TrackExpenses")}
            >
              <View
                style={[
                  styles.iconBackground,
                  {
                    padding: wp(4),
                    borderRadius: wp(5),
                  },
                ]}
              >
                <Ionicons
                  name="document-text"
                  size={RFValue(32)}
                  color="#0369A1"
                />
              </View>
              <Text
                style={[
                  tailwind.textSm,
                  tailwind.fontMedium,
                  tailwind.textBlue800,
                  tailwind.mT2,
                  tailwind.textCenter,
                 { fontSize: RFValue(12) },
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {t("requestAid.trackAidsComplaints")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {renderNewsSection()}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    // Width is set dynamically in the component
  },
  iconBackground: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#0369A1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  newsSection: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: hp(60), // 60% of screen height
  },
  newsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    shadowColor: "#0369A1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
});

export default Aid;