import { storage } from '../config/firebase'
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage'

export const uploadFile = async (fileCategory = '', uri) => {
  if (!uri) {
    window.alert('Error', 'Please select a file first!', [{ text: 'OK', onPress: () => console.log('OK Pressed') }])
    return
  }
  try {
    const response = await fetch(uri)
    const blob = await response.blob()
    const filename = fileCategory + '/' + uri.substring(uri.lastIndexOf('/') + 1)
    const reference = ref(storage, filename)
    await uploadBytes(reference, blob)
    const url = await getDownloadURL(reference)
    return { url }
  } catch (error) {
    return { error }
  }
}
