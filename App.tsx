import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  NativeModules,
  Button,
  ScrollView,
} from 'react-native';
const {MobileAppBridge} = NativeModules;

import {doBenchmarks, BenchmarkResult, RemoteDBInterface} from './benchmark';

type AppState = {
  hello?: string;
  res?: string;
  isBenchmarking?: boolean;
  benchmarkTime?: number;
  benchmarkResults: BenchmarkResult[];
};

const serverPort = 8082;

async function serverRequest(): Promise<string> {
  const dbPath = `${await MobileAppBridge.getDBDir()}/db.sqlite`;
  const dbInterface = new RemoteDBInterface(
    `http://127.0.0.1:${serverPort}`,
    dbPath,
  );

  await dbInterface.init();

  await dbInterface.addValues([{id: 5, value: 'hello'}]);

  const response = await dbInterface.getValues();
  return JSON.stringify(response);
}

export const App = (): JSX.Element => {
  const [state, setState] = useState<AppState>({
    benchmarkResults: [],
  });

  const displayHelloWorld = async () => {
    try {
      let text = await MobileAppBridge.sayHelloWorld('Android :)');
      setState({
        hello: text,
        benchmarkResults: [],
      });
      await MobileAppBridge.startServer(serverPort);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    displayHelloWorld();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>rust says: {state.hello}</Text>
      <Button
        title="Test Request"
        onPress={async () => {
          const response = await serverRequest();
          setState({
            ...state,
            res: response,
          });
        }}
      />
      <Text style={styles.welcome}>response: {state.res}</Text>
      <Button
        disabled={state.isBenchmarking}
        title="Benchmark"
        onPress={async () => {
          const dbPath = `${await MobileAppBridge.getDBDir()}/db.sqlite`;
          setState({
            ...state,
            isBenchmarking: true,
            benchmarkResults: [],
          });
          const start = Date.now();
          const response = await doBenchmarks(
            `http://127.0.0.1:${serverPort}`,
            dbPath,
          );
          setState({
            ...state,
            isBenchmarking: false,
            benchmarkTime: Date.now() - start,
            benchmarkResults: response,
          });
        }}
      />
      {!state.isBenchmarking &&
      state.benchmarkTime &&
      state.benchmarkTime > 0 ? (
        <Text style={styles.welcome}>
          Total benchmark time: {state.benchmarkTime}ms
        </Text>
      ) : undefined}
      <ScrollView>
        {state.benchmarkResults.map((result, i) => {
          return <Text key={i}>{JSON.stringify(result)}</Text>;
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
