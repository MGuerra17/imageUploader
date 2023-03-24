import { useState, useEffect } from 'react'
import { uploadFile } from '../services/firebaseStorage'
import * as ImagePicker from 'expo-image-picker'

export default function useFiles() {
  const [currentFile, setCurrentFile] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ImagePicker.requestCameraPermissionsAsync().then(({ status }) => {
      console.log({ status })
      setPermissionStatus(status)
    })
  }, [])

  const pickFile = async () => {
    if (permissionStatus !== 'granted') {
      window.alert('No tiene los permisos')
      return
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All
      })

      if (!result.canceled) {
        setCurrentFile(result)
      }
    } catch (e) {
      setError(e)
    }
  }

  const takePhoto = async () => {
    if (permissionStatus !== 'granted') {
      window.alert('No tiene los permisos')
      return
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      })

      if (!result.canceled) {
        setCurrentFile(result)
      }
    } catch (e) {
      setError(e)
    }
  }

  const takeVideo = async () => {
    if (permissionStatus !== 'granted') {
      window.alert('No tiene los permisos')
      return
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        videoMaxDuration: 10
      })

      if (!result.canceled) {
        setCurrentFile(result)
      }
    } catch (e) {
      setError(e)
    }
  }

  const handleUploadFile = async () => {
    setLoading(true)
    const { uri } = currentFile.currentFile.assets[0]
    const { url } = await uploadFile('images', uri)
    console.log(url)
    setCurrentFile(null)
    setLoading(false)
  }

  return {
    currentFile,
    permissionStatus,
    error,
    loading,
    setCurrentFile,
    pickFile,
    takePhoto,
    takeVideo,
    handleUploadFile
  }
}
