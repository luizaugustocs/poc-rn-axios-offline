/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Button,
  StatusBar,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useState} from 'react';
import offlineplugin, {consumeQueue} from './offlineplugin';
import axios from 'axios';
import {useEffect} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

axios.interceptors.request.use(async (config) => {
  console.log('inside interceptor');

  if (config.headers.teste) {
    console.log('inside interceptor 2');
    config.headers.teste2 = 'T2';
  }
  config.headers.teste = 'T1';
  return config;
});
const App: () => React$Node = () => {
  const [queueSize, setQueueSize] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    AsyncStorage.getAllKeys().then((keys) => setQueueSize(keys.length));
  });
  const makeRequest = () => {
    setRequestCount((oldValue) => oldValue + 1);
    axios
      .get(' http://www.randomnumberapi.com/api/v1.0/random', {
        adapter: offlineplugin,
      })
      .then(() => {
        console.log('success');
      })
      .catch((error) => {
        setErrorCount((oldValue) => oldValue + 1);
        console.error(error);
      });
  };
  const consume = () => {
    consumeQueue()
      .then((response) => {
        console.log('empty', response);
        setQueueSize(0);
      })
      .catch((error) => {
        console.error('RetryError', error);
      });
  };
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Queue Size : {queueSize}</Text>
              <Button onPress={consume} title={'Consume'} color={Colors.dark} />

              <Text style={styles.sectionTitle}>Requests : {requestCount}</Text>

              <Text style={styles.sectionTitle}>Errors : {errorCount}</Text>

              <Button
                onPress={makeRequest}
                title={'Make request'}
                color={Colors.dark}
              />

              <Button
                onPress={() => {
                  setErrorCount(0);
                  setRequestCount(0);
                }}
                title={'Reset'}
                color={Colors.dark}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
