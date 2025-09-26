import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonAvatar,
  IonActionSheet,
} from "@ionic/react";
import { person, logOut, menu, camera, location, list } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./Home.scss";

const client = generateClient<Schema>();

export default function Home() {
  const [profile, setProfile] = useState<Schema["UserProfile"]["type"] | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isMenuActionSheetOpen, setIsMenuActionSheetOpen] = useState(false);
  const { user, signOut } = useAuthenticator();
  const history = useHistory();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: profiles } = await client.models.UserProfile.list({});
      if (profiles.length > 0) {
        setProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const showActionSheet = () => {
    setIsActionSheetOpen(true);
  };

  const navigateToProfile = () => {
    setIsActionSheetOpen(false);
    history.push("/profile");
  };

  const handleSignOut = () => {
    setIsActionSheetOpen(false);
    signOut();
  };

  const showMenuActionSheet = () => {
    setIsMenuActionSheetOpen(true);
  };

  const navigateToCapture = () => {
    setIsMenuActionSheetOpen(false);
    history.push("/capture");
  };

  const navigateToMyFinds = () => {
    setIsMenuActionSheetOpen(false);
    // TODO: Navigate to my finds page
    console.log('Navigate to My Finds');
  };

  const navigateToFindsMap = () => {
    setIsMenuActionSheetOpen(false);
    // TODO: Navigate to finds map page
    console.log('Navigate to Finds Map');
  };

  const getDisplayName = () => {
    if (profile?.handle) {
      return profile.handle;
    }
    return user?.signInDetails?.loginId?.split('@')[0] || 'User';
  };

  const getAvatarLetter = () => {
    const displayName = getDisplayName();
    return displayName.charAt(0).toUpperCase();
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={showMenuActionSheet}>
              <IonIcon icon={menu} className="icon-spacing" />
            </IonButton>
          </IonButtons>
          <IonTitle>BuscoVida</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={showActionSheet}>
              <IonIcon icon={person} className="icon-spacing" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="home__welcome-section">
          <h2 className="home__welcome-message">
            Hello {getDisplayName()}
          </h2>

          <div className="home__avatar-container">
            <IonAvatar className="home__avatar">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="home__avatar-image"
                />
              ) : (
                <div className="home__avatar-placeholder">
                  {getAvatarLetter()}
                </div>
              )}
            </IonAvatar>
          </div>
        </div>

        <div className="home__welcome-footer">
          <p className="home__app-message">
            🥳 Welcome to BuscoVida!
          </p>
        </div>

        <IonActionSheet
          isOpen={isActionSheetOpen}
          onDidDismiss={() => setIsActionSheetOpen(false)}
          buttons={[
            {
              text: 'Profile',
              icon: person,
              handler: navigateToProfile
            },
            {
              text: 'Log Out',
              icon: logOut,
              role: 'destructive',
              handler: handleSignOut
            }
          ]}
        />

        <IonActionSheet
          isOpen={isMenuActionSheetOpen}
          onDidDismiss={() => setIsMenuActionSheetOpen(false)}
          buttons={[
            {
              text: 'Capture',
              icon: camera,
              handler: navigateToCapture
            },
            {
              text: 'My Finds',
              icon: list,
              handler: navigateToMyFinds
            },
            {
              text: 'Finds Map',
              icon: location,
              handler: navigateToFindsMap
            }
          ]}
        />
      </IonContent>
    </>
  );
}