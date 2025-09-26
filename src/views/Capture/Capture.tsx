import { useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Preferences } from "@capacitor/preferences";
import {
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonRadioGroup,
  IonRadio,
  IonAlert,
  IonLoading,
} from "@ionic/react";
import { camera, checkmark } from "ionicons/icons";
import DetailHeader from "../../components/DetailHeader";
import "./Capture.scss";

const client = generateClient<Schema>();

interface LocalFind {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
  capturedAt: string;
  category: "plant" | "animal" | "not_sure";
  isSynced: boolean;
}

export default function Capture() {
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"plant" | "animal" | "not_sure">(
    "plant"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  useAuthenticator();

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      setCapturedImage(image.dataUrl || "");
    } catch (error) {
      console.error("Error taking picture:", error);
      setAlertMessage("Failed to take picture. Please try again.");
      setShowAlert(true);
    }
  };

  const saveLocally = async (findData: LocalFind): Promise<void> => {
    try {
      // Get existing local finds
      const { value } = await Preferences.get({ key: "localFinds" });
      const existingFinds: LocalFind[] = value ? JSON.parse(value) : [];

      // Add new find
      existingFinds.push(findData);

      // Save back to preferences
      await Preferences.set({
        key: "localFinds",
        value: JSON.stringify(existingFinds),
      });
    } catch (error) {
      console.error("Error saving locally:", error);
      throw error;
    }
  };

  const syncToServer = async (findData: LocalFind): Promise<boolean> => {
    try {
      await client.models.Find.create({
        name: findData.name,
        description: findData.description,
        imageUrl: findData.imageUrl,
        latitude: findData.latitude,
        longitude: findData.longitude,
        capturedAt: findData.capturedAt,
        category: findData.category,
        isSynced: true,
      });
      return true;
    } catch (error) {
      console.error("Error syncing to server:", error);
      return false;
    }
  };

  const saveFind = async () => {
    if (!capturedImage || !name.trim()) {
      setAlertMessage("Please take a photo and enter a name for your find.");
      setShowAlert(true);
      return;
    }

    setIsLoading(true);

    try {
      // Get current location (optional)
      let latitude: number | undefined;
      let longitude: number | undefined;

      try {
        if ("geolocation" in navigator) {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            }
          );
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        }
      } catch (geoError) {
        console.log("Geolocation not available or denied");
      }

      const findData: LocalFind = {
        id: Date.now().toString(),
        name: name.trim(),
        description: description.trim(),
        imageUrl: capturedImage,
        latitude,
        longitude,
        capturedAt: new Date().toISOString(),
        category,
        isSynced: false,
      };

      // Always save locally first
      await saveLocally(findData);

      // Try to sync to server
      const synced = await syncToServer(findData);

      if (synced) {
        // Update local record to show it's synced
        findData.isSynced = true;
        await saveLocally(findData);
        setAlertMessage("Find saved and synced to server successfully!");
      } else {
        setAlertMessage(
          "Find saved locally. Will sync when connection is available."
        );
      }

      setShowAlert(true);

      // Reset form
      setCapturedImage("");
      setName("");
      setDescription("");
      setCategory("plant");
    } catch (error) {
      console.error("Error saving find:", error);
      setAlertMessage("Failed to save find. Please try again.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DetailHeader title="Capture" />

      <IonContent className="ion-padding">
        <IonCard className="card-full-width">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={camera} className="icon-spacing" />
              New Find
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="capture__camera-section">
              {capturedImage ? (
                <div className="capture__image-preview">
                  <img src={capturedImage} alt="Captured find" />
                  <IonButton
                    fill="clear"
                    onClick={() => setCapturedImage("")}
                    className="capture__remove-image"
                  >
                    Remove
                  </IonButton>
                </div>
              ) : (
                <div className="capture__camera-placeholder">
                  <IonIcon icon={camera} className="capture__camera-icon" />
                  <p>Take a photo of your find</p>
                  <IonButton onClick={takePicture} className="btn-primary">
                    <IonIcon icon={camera} slot="start" />
                    Take Photo
                  </IonButton>
                </div>
              )}
            </div>

            <IonItem>
              <IonLabel position="stacked">Name *</IonLabel>
              <IonInput
                value={name}
                onIonInput={(e) => setName(e.detail.value!)}
                placeholder="What did you find?"
                required
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Description</IonLabel>
              <IonTextarea
                value={description}
                onIonInput={(e) => setDescription(e.detail.value!)}
                placeholder="Tell us more about your find..."
                rows={3}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Category</IonLabel>
              <IonRadioGroup
                value={category}
                onIonChange={(e) => {
                  console.log(e.detail.value);
                  setCategory(e.detail.value);
                }}
              >
                <IonItem lines="none" onClick={() => setCategory("plant")}>
                  <IonRadio slot="start" value="plant" />
                  <IonLabel>Plant</IonLabel>
                </IonItem>
                <IonItem lines="none" onClick={() => setCategory("animal")}>
                  <IonRadio slot="start" value="animal" />
                  <IonLabel>Animal</IonLabel>
                </IonItem>
                <IonItem lines="none" onClick={() => setCategory("not_sure")}>
                  <IonRadio slot="start" value="not_sure" />
                  <IonLabel style={{ whiteSpace: "nowrap" }}>Not sure</IonLabel>
                </IonItem>
              </IonRadioGroup>
            </IonItem>

            <IonButton
              expand="block"
              onClick={saveFind}
              disabled={!capturedImage || !name.trim() || isLoading}
              className="capture__save-button"
            >
              <IonIcon icon={checkmark} slot="start" />
              Save Find
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonLoading isOpen={isLoading} message="Saving your find..." />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Capture"
          message={alertMessage}
          buttons={["OK"]}
        />

      </IonContent>
    </>
  );
}
