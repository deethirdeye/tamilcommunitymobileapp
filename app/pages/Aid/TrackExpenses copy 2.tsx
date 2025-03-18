import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
  StyleSheet
} from "react-native";
import { t, tailwind } from "react-native-tailwindcss";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useTranslation from "@/app/i8n/useTranslationHook";
import { LinearGradient } from 'expo-linear-gradient';
import PageHeader from '@/components/PageHeader';
import { AppConfig } from "@/app/config/AppConfig";
import { TamilCommunityApi } from "@/app/context/GlobalContext";
import { useDescriptionAndRecordingHandlers } from '@/components/handlers/DescriptionAndRecordingHandlers';
import { Audio } from "expo-av";
import TrackAidDetailsSelf from "./TrackAidDetailsSelf";

const { width, height } = Dimensions.get('window');

const formatDateTime = (dateString: any) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB");
};

interface AidRequestItem {
  RequestID: string;
  CreatedOn: string;
  ProcessStatus: string;
}

const RequestAid = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [aidDataSelf, setAidDataSelf] = useState<AidRequestItem[]>([]);
  const [aidDataSomeone, setAidDataSomeone] = useState<AidRequestItem[]>([]);
  const router = useRouter();
  const [userId, setUserId] = useState<string | number | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        setUserId(Number(storedUserId));
      } catch (error) {
        console.error("Failed to fetch userId from AsyncStorage:", error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
  if (!userId) return;

  const fetchAidData = async () => {
    try {
      const [selfResponse, someoneResponse] = await Promise.all([
        fetch(`${AppConfig.APIURL}${TamilCommunityApi.GET_BASIC_AID_BY_USER_ID}/${userId}`),
        fetch(`${AppConfig.APIURL}${TamilCommunityApi.GET_BASIC_AID_FOR_SOMEONE_BY_USER_ID}/${userId}`)
      ]);

      const selfData = await selfResponse.json();
      const someoneData = await someoneResponse.json();

      if (selfResponse.ok && selfData.ResponseData) {
        setAidDataSelf(selfData.ResponseData[0]);
      }
      if (someoneResponse.ok && someoneData.ResponseData) {
        setAidDataSomeone(someoneData.ResponseData[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again later.");
    }
  };

  fetchAidData();
}, [userId]);

  const filteredAidDataSelf = aidDataSelf.filter((item: AidRequestItem) => {
    const matchesSearch = item.RequestID
      ? item.RequestID.toLowerCase().includes(searchQuery.toLowerCase())
      : false;
    const matchesStatus =
      selectedStatus === "" || item.ProcessStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredAidDataSomeone = aidDataSomeone.filter((item: AidRequestItem) => {
    const matchesSearch = item.RequestID
      ? item.RequestID.toLowerCase().includes(searchQuery.toLowerCase())
      : false;
    const matchesStatus =
      selectedStatus === "" || item.ProcessStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleRowPress = (RequestID: string) => {
    router.push({
      pathname: "/pages/Aid/TrackAidDetailsSelf",
      params: { RequestID },
    });
  };

  const handleRowPressSomeone = (RequestID: string) => {
    router.push({
      pathname: "/pages/Aid/TrackAidDetailsSomeone",
      params: { RequestID },
    });
  };

  return (
    <LinearGradient
      colors={['#E1F2FF', '#BFE6FF', '#99D6FF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[tailwind.flex1]}
    >
      <ScrollView style={[tailwind.flex1]}>
        <PageHeader title={t('expenseTable.trackerTitle')} />

        {/* Search and Filter Section */}
        <View style={[tailwind.pX4, tailwind.mB4]}>
          <View style={[
            tailwind.bgWhite,
            tailwind.roundedLg,
            tailwind.shadowMd,
            tailwind.mB4,
            { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }
          ]}>
            <TextInput
              style={[
                tailwind.pX2,
                tailwind.pY2,
                tailwind.textBlue800
              ]}
              placeholder={t('expenseTable.searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94A3B8"
            />
          </View>
          <View style={[
            tailwind.bgWhite,
            tailwind.roundedLg,
            tailwind.shadowMd,
            tailwind.textBlue800,
            { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }
          ]}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={setSelectedStatus}
              style={[tailwind.p2, tailwind.textBlue800, tailwind.roundedLg]}
            >
              <Picker.Item label={t('expenseTable.allStatuses')} value="" />
              <Picker.Item label={t('.statusSent')} value="Sent" />
              <Picker.Item label={t('expenseTable.statusUnderReview')} value="Under Review" />
              <Picker.Item label={t('expenseTable.statusHold')} value="On Hold" />
              <Picker.Item label={t('expenseTable.statusAccepted')} value="Completed" />
              <Picker.Item label={t('expenseTable.statusRejected')} value="Denied" />
              <Picker.Item label={t('expenseTable.statusCancelled')} value="Cancelled" />
            </Picker>
          </View>
        </View>

        {/* Self Aid Table */}
        <View style={[
          tailwind.mX4,
          tailwind.bgWhite,
          tailwind.roundedLg,
          tailwind.shadowLg,
          tailwind.overflowHidden,
          { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }
        ]}>
          <LinearGradient
            colors={['#0369A1', '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[tailwind.p3]}
          >
            <Text style={[tailwind.textLg, tailwind.fontBold, tailwind.textWhite, tailwind.textCenter]}>
              {t('expenseTable.trackerForSelf')}
            </Text>
          </LinearGradient>

          {/* Table Header */}
          <View style={[tailwind.flexRow, tailwind.bgBlue100, tailwind.p3, tailwind.borderB, tailwind.borderGray200]}>
            <Text style={[tailwind.w12, tailwind.fontBold, tailwind.textBlue800]}>S.No</Text>
            <Text style={[tailwind.flex1, tailwind.fontBold, tailwind.textBlue800]}>Date</Text>
            <Text style={[tailwind.flex1, tailwind.fontBold, tailwind.textBlue800]}>Req. ID</Text>
            <Text style={[tailwind.w24, tailwind.fontBold, tailwind.textBlue800]}>Status</Text>
          </View>

          {/* Table Body */}
          {filteredAidDataSelf.length > 0 ? (
            filteredAidDataSelf.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleRowPress(item.RequestID)}
                style={[
                  tailwind.flexRow,
                  tailwind.pY3,
                  tailwind.pX2,
                  tailwind.borderB,
                  tailwind.borderGray200,
                  index % 2 === 0 ? tailwind.bgWhite : tailwind.bgBlue500
                ]}
              >
                <Text style={[tailwind.w12, tailwind.textBlue800]}>{index + 1}</Text>
                <Text style={[tailwind.flex1, tailwind.textBlue800]}>{formatDateTime(item.CreatedOn)}</Text>
                <Text style={[tailwind.flex1, tailwind.textBlue800]}>{item.RequestID}</Text>
                <View style={[tailwind.w24]}>
                  <Text style={[
                    tailwind.pX2,
                    tailwind.pY1,
                    tailwind.roundedFull,
                    tailwind.textSm,
                    tailwind.textCenter,
                    getStatusStyle(item.ProcessStatus)
                  ]}>
                    {item.ProcessStatus}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[tailwind.p6, tailwind.itemsCenter]}>
              <Text style={[tailwind.textGray600]}>{t('expenseTable.noResultsFound')}</Text>
            </View>
          )}
        </View>

        {/* Someone Else Aid Table */}
        <View style={[
          tailwind.mT10,
          tailwind.mB10,
          tailwind.mX4,
          tailwind.bgWhite,
          tailwind.roundedLg,
          tailwind.shadowLg,
          tailwind.overflowHidden,
          { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 }
        ]}>
          <LinearGradient
            colors={['#0369A1', '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[tailwind.p3]}
          >
            <Text style={[tailwind.textLg, tailwind.fontBold, tailwind.textWhite, tailwind.textCenter]}>
              {t('expenseTable.trackerForSomeone')}
            </Text>
          </LinearGradient>

          {/* Table Header */}
          <View style={[tailwind.flexRow, tailwind.bgBlue100, tailwind.p3, tailwind.borderB, tailwind.borderGray200]}>
            <Text style={[tailwind.w12, tailwind.fontBold, tailwind.textBlue800]}>S.No</Text>
            <Text style={[tailwind.flex1, tailwind.fontBold, tailwind.textBlue800]}>Date</Text>
            <Text style={[tailwind.flex1, tailwind.fontBold, tailwind.textBlue800]}>Req. ID</Text>
            <Text style={[tailwind.w24, tailwind.fontBold, tailwind.textBlue800]}>Status</Text>
          </View>

          {/* Table Body */}
          {filteredAidDataSomeone.length > 0 ? (
            filteredAidDataSomeone.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleRowPressSomeone(item.RequestID)}
                style={[
                  tailwind.flexRow,
                  tailwind.pY3,
                  tailwind.pX2,
                  tailwind.borderB,
                  tailwind.borderGray200,
                  index % 2 === 0 ? tailwind.bgWhite : tailwind.bgBlue500
                ]}
              >
                <Text style={[tailwind.w12, tailwind.textBlue800]}>{index + 1}</Text>
                <Text style={[tailwind.flex1, tailwind.textBlue800]}>{formatDateTime(item.CreatedOn)}</Text>
                <Text style={[tailwind.flex1, tailwind.textBlue800]}>{item.RequestID}</Text>
                <View style={[tailwind.w24]}>
                  <Text style={[
                    tailwind.pX2,
                    tailwind.pY1,
                    tailwind.roundedFull,
                    tailwind.textSm,
                    tailwind.textCenter,
                    getStatusStyle(item.ProcessStatus)
                  ]}>
                    {item.ProcessStatus}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[tailwind.p6, tailwind.itemsCenter]}>
              <Text style={[tailwind.textGray600]}>{t('expenseTable.noResultsFound')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'Sent':
      return [tailwind.bgBlue100, tailwind.textBlue800];
    case 'Under Review':
      return [tailwind.bgYellow100, tailwind.textYellow800];
    case 'Accepted':
      return [tailwind.bgGreen100, tailwind.textGreen800];
    case 'Rejected':
      return [tailwind.bgRed100, tailwind.textRed800];
    default:
      return [tailwind.bgGray100, tailwind.textGray800];
  }
};

export default RequestAid;