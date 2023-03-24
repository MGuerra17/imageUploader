import { Audio } from 'expo-av'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, SafeAreaView, Button, View } from 'react-native'
import { useState } from 'react'
import { AndroidAudioEncoder, AndroidOutputFormat, IOSAudioQuality, IOSOutputFormat } from 'expo-av/build/Audio'
import * as FileSystem from 'expo-file-system'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [currentRecording, setCurrentRecording] = useState(null)
  const [finalRecording, setFinalRecording] = useState(null)
  const [message, setMessage] = useState('')
  const [transcriptionInfo, setTranscriptionInfo] = useState('')

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync()

      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        })

        const { recording } = await Audio.Recording.createAsync({
          isMeteringEnabled: true,
          android: {
            extension: '.amr',
            outputFormat: AndroidOutputFormat.AMR_WB,
            audioEncoder: AndroidAudioEncoder.AMR_WB,
            sampleRate: 16000,
            numberOfChannels: 2,
            bitRate: 128000
          },
          ios: {
            extension: '.m4a',
            outputFormat: IOSOutputFormat.MPEG4AAC,
            audioQuality: IOSAudioQuality.MAX,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000
          }
        })

        setCurrentRecording(recording)
      } else {
        setMessage('Please grant permission to app to access microphone')
      }
    } catch (err) {
      console.error('Failed to start recording', err)
    }
  }

  async function stopRecording() {
    await currentRecording.stopAndUnloadAsync()
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false
    })

    const { sound, status } = await currentRecording.createNewLoadedSoundAsync()
    setFinalRecording({
      sound,
      duration: getDurationFormatted(status.durationMillis),
      file: currentRecording.getURI()
    })

    setCurrentRecording(null)
  }

  function getDurationFormatted(millis) {
    const minutes = millis / 1000 / 60
    const minutesDisplay = Math.floor(minutes)
    const seconds = Math.round((minutes - minutesDisplay) * 60)
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
    return `${minutesDisplay}:${secondsDisplay}`
  }

  const convertAudioToText = async (uri) => {
    if (!uri) return
    setLoading(true)
    try {
      const fileData = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' })
      const response = await fetch('https://us-central1-testing-project-d844b.cloudfunctions.net/getTextFromAudio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: fileData, secret: 'docapp' })
      })
      const data = await response.json()
      console.log({ data })
      const transcription = data.results.map(result => result.alternatives[0].transcript).join(' | ')
      setTranscriptionInfo(transcription)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text>{message}</Text>
      <Button
        title={currentRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={currentRecording ? stopRecording : startRecording}
      />
      {loading && <Text>Loading...</Text>}
      {finalRecording && (
        <View style={styles.row}>
          <Text style={styles.fill}>Recording - {finalRecording.duration}</Text>
          <Button style={styles.button} onPress={() => finalRecording.sound.replayAsync()} title='Play' />
          <Button style={styles.button} onPress={() => convertAudioToText(finalRecording.file)} title='Get text' />
        </View>
      )}
      <Text>{transcriptionInfo}</Text>
      <StatusBar style='auto' />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 15
  },
  button: {
    backgroundColor: '#aaf',
    padding: 10,
    borderRadius: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fill: {
    flex: 1,
    margin: 16
  }
})
