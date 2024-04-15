import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PushNotification from 'react-native-push-notification';

const OfflineNotification = () => {
  // Function to show offline notification
  const showOfflineNotification = () => {
    PushNotification.localNotification({
      title: "No Internet Connection",
      message: "You are currently offline. Please check your internet connection.",
    });
  };

//   showOfflineNotification();

  return (
    <View style={styles.container}>
      <Text style={styles.message}>You are offline</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    padding: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default OfflineNotification;
