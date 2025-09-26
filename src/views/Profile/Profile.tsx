import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { updatePassword } from "aws-amplify/auth";
import type { Schema } from "../../../amplify/data/resource";
import {
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonAvatar,
  IonIcon,
  IonAlert,
  IonLoading,
  IonAccordion,
  IonAccordionGroup,
  IonActionSheet,
} from "@ionic/react";
import { person, save, key, camera, image, link } from "ionicons/icons";
import DetailHeader from "../../components/DetailHeader";
import "./Profile.scss";

const client = generateClient<Schema>();

export default function Profile() {
  const { user } = useAuthenticator();
  const [profile, setProfile] = useState<Schema["UserProfile"]["type"] | null>(null);
  const [handle, setHandle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isAvatarActionSheetOpen, setIsAvatarActionSheetOpen] = useState(false);
  const [showAvatarUrlAlert, setShowAvatarUrlAlert] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: profiles } = await client.models.UserProfile.list({});
      if (profiles.length > 0) {
        const userProfile = profiles[0];
        setProfile(userProfile);
        setHandle(userProfile.handle);
        setAvatarUrl(userProfile.avatarUrl || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const saveProfile = async () => {
    if (!handle.trim()) {
      setAlertMessage("User handle is required");
      setShowPasswordAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      if (profile) {
        // Update existing profile
        await client.models.UserProfile.update({
          id: profile.id,
          handle: handle.trim(),
          avatarUrl: avatarUrl.trim() || null,
        });
      } else {
        // Create new profile
        await client.models.UserProfile.create({
          handle: handle.trim(),
          avatarUrl: avatarUrl.trim() || null,
        });
      }

      setAlertMessage("Profile saved successfully!");
      setShowSuccessAlert(true);
      await loadProfile(); // Refresh profile data
    } catch (error) {
      console.error("Error saving profile:", error);
      setAlertMessage("Failed to save profile. Please try again.");
      setShowPasswordAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setAlertMessage("All password fields are required");
      setShowPasswordAlert(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlertMessage("New password and confirmation do not match");
      setShowPasswordAlert(true);
      return;
    }

    if (newPassword.length < 8) {
      setAlertMessage("New password must be at least 8 characters long");
      setShowPasswordAlert(true);
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword({
        oldPassword,
        newPassword,
      });

      setAlertMessage("Password changed successfully!");
      setShowSuccessAlert(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      setAlertMessage(error.message || "Failed to change password. Please try again.");
      setShowPasswordAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarClick = () => {
    setIsAvatarActionSheetOpen(true);
  };

  const handleCameraCapture = () => {
    setIsAvatarActionSheetOpen(false);
    // TODO: Implement camera capture
    setAlertMessage("Camera functionality will be implemented in a future update");
    setShowPasswordAlert(true);
  };

  const handlePhotoLibrary = () => {
    setIsAvatarActionSheetOpen(false);
    // TODO: Implement photo library access
    setAlertMessage("Photo library functionality will be implemented in a future update");
    setShowPasswordAlert(true);
  };

  const handleAvatarUrl = () => {
    setIsAvatarActionSheetOpen(false);
    setShowAvatarUrlAlert(true);
  };

  const updateAvatarUrl = (newUrl: string) => {
    if (newUrl.trim()) {
      setAvatarUrl(newUrl.trim());
      setAlertMessage("Avatar URL updated! Don't forget to save your profile.");
      setShowSuccessAlert(true);
    }
  };


  return (
    <>
      <DetailHeader title="Profile" />

      <IonContent className="ion-padding">
        <IonCard className="card-full-width">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={person} className="icon-spacing" />
              User Information
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="profile__avatar-container">
              <IonAvatar className="profile__avatar profile__avatar--clickable" onClick={handleAvatarClick}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="profile__avatar-image" />
                ) : (
                  <div className="profile__avatar-placeholder">
                    {handle.charAt(0).toUpperCase() || user?.signInDetails?.loginId?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
              </IonAvatar>
            </div>

            <IonItem>
              <IonLabel position="stacked">User Handle *</IonLabel>
              <IonInput
                value={handle}
                onIonInput={(e) => setHandle(e.detail.value!)}
                placeholder="Enter your handle"
                required
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Avatar URL</IonLabel>
              <IonInput
                value={avatarUrl}
                onIonInput={(e) => setAvatarUrl(e.detail.value!)}
                placeholder="Enter avatar image URL"
              />
            </IonItem>

            <IonButton
              expand="block"
              onClick={saveProfile}
              className="profile__save-button"
              disabled={isLoading}
            >
              <IonIcon icon={save} slot="start" />
              Save Profile
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonAccordionGroup className="card-margin-top">
          <IonAccordion value="password">
            <IonItem slot="header">
              <IonIcon icon={key} className="icon-spacing" />
              <IonLabel>Change Password</IonLabel>
            </IonItem>
            <div className="ion-padding" slot="content">
              <IonItem>
                <IonLabel position="stacked">Current Password</IonLabel>
                <IonInput
                  type="password"
                  value={oldPassword}
                  onIonInput={(e) => setOldPassword(e.detail.value!)}
                  placeholder="Enter current password"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">New Password</IonLabel>
                <IonInput
                  type="password"
                  value={newPassword}
                  onIonInput={(e) => setNewPassword(e.detail.value!)}
                  placeholder="Enter new password"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Confirm New Password</IonLabel>
                <IonInput
                  type="password"
                  value={confirmPassword}
                  onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                  placeholder="Confirm new password"
                />
              </IonItem>

              <IonButton
                expand="block"
                onClick={changePassword}
                className="profile__password-button"
                disabled={isLoading}
                color="secondary"
              >
                <IonIcon icon={key} slot="start" />
                Change Password
              </IonButton>
            </div>
          </IonAccordion>
        </IonAccordionGroup>

        <IonLoading isOpen={isLoading} message="Please wait..." />

        <IonAlert
          isOpen={showPasswordAlert}
          onDidDismiss={() => setShowPasswordAlert(false)}
          header="Error"
          message={alertMessage}
          buttons={["OK"]}
        />

        <IonAlert
          isOpen={showSuccessAlert}
          onDidDismiss={() => setShowSuccessAlert(false)}
          header="Success"
          message={alertMessage}
          buttons={["OK"]}
        />

        <IonActionSheet
          isOpen={isAvatarActionSheetOpen}
          onDidDismiss={() => setIsAvatarActionSheetOpen(false)}
          header="Change Avatar"
          buttons={[
            {
              text: 'Take Photo',
              icon: camera,
              handler: handleCameraCapture
            },
            {
              text: 'Choose from Library',
              icon: image,
              handler: handlePhotoLibrary
            },
            {
              text: 'Enter URL',
              icon: link,
              handler: handleAvatarUrl
            }
          ]}
        />

        <IonAlert
          isOpen={showAvatarUrlAlert}
          onDidDismiss={() => setShowAvatarUrlAlert(false)}
          header="Avatar URL"
          message="Enter the URL for your avatar image:"
          inputs={[
            {
              name: "avatarUrl",
              type: "url",
              placeholder: "https://example.com/avatar.jpg",
              value: avatarUrl
            }
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel"
            },
            {
              text: "Update",
              handler: (data) => {
                updateAvatarUrl(data.avatarUrl);
              }
            }
          ]}
        />

      </IonContent>
    </>
  );
}