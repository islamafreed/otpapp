import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

export interface RegistrationData {
  name: string
  age: string
  gender: string
  address: string
  mobile: string
  phoneVerified: boolean
  registrationNumber?: string
}

export const saveRegistration = async (data: RegistrationData) => {
  try {
    // Generate a unique registration number
    const registrationNumber = `BKL${Date.now().toString().slice(-6)}`

    const registrationData = {
      ...data,
      registrationNumber,
      createdAt: serverTimestamp(),
      status: "registered",
    }

    const docRef = await addDoc(collection(db, "registrations"), registrationData)

    return {
      success: true,
      registrationNumber,
      docId: docRef.id,
    }
  } catch (error) {
    console.error("Error saving registration:", error)
    return {
      success: false,
      error: "Failed to save registration data",
    }
  }
}
