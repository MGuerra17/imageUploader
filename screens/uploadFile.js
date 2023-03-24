import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, Image, SafeAreaView, Pressable, View } from 'react-native'
import useFiles from '../hooks/useFiles'

export default function App() {
  const {
    currentFile,
    error,
    loading,
    pickFile,
    takePhoto,
    takeVideo,
    handleUploadFile
  } = useFiles()

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Image picker</Text>
      <Pressable style={styles.button} onPress={pickFile}>
        <Text>Select file</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={takePhoto}>
        <Text>Take photo</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={takeVideo}>
        <Text>Take video</Text>
      </Pressable>
      {error && <Text>{error}</Text>}
      {currentFile && (
        <View>
          <Image source={{ uri: currentFile.assets[0].uri }} style={{ height: 300, aspectRatio: 1, resizeMode: 'contain' }} />
          <Pressable style={styles.button} onPress={handleUploadFile}>
            <Text>Upload</Text>
          </Pressable>
        </View>
      )}
      {loading && <Text>Loading...</Text>}
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
  }
})
