import { authModalState } from "@/atoms/authModalAtom";
import {
  Community,
  CommunitySnippet,
  communityState,
} from "@/atoms/communitiesAtom";
import { auth, firestore } from "@/firebase/clientApp";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";

const useCommunityData = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);
  const setAuthModalState = useSetRecoilState(authModalState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    if (!user) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }
    if (isJoined) {
      leaveCommunity(communityData.id);
      return;
    }
    joinCommunity(communityData);
  };

  const getMySnippets = async () => {
    setLoading(true);
    try {
      const snippetDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      );
      const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
      }));
    } catch (e: any) {
      console.log("getMySnippets error", e.message);
      setError(e.message);
    }
    setLoading(false);
  };

  const joinCommunity = async (communityData: Community) => {
    try {
      const batch = writeBatch(firestore);
      const newSnippet: CommunitySnippet = {
        communityId: communityData.id,
        imageURL: communityData.imageURL || "",
      };
      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id
        ),
        newSnippet
      );
      batch.update(doc(firestore, "communities", communityData.id), {
        numberOfMembers: increment(1),
      });
      await batch.commit();

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }));
    } catch (e: any) {
      console.log("joinCommunity error", e.message);
      setError(e.message);
    }
    setLoading(false);
  };

  const leaveCommunity = async (communityId: string) => {
    setLoading(true);
    try {
      const batch = writeBatch(firestore);
      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
      );
      batch.update(doc(firestore, "communities", communityId), {
        numberOfMembers: increment(-1),
      });
      await batch.commit();
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          (item) => item.communityId !== communityId
        ),
      }));
    } catch (e: any) {
      console.log("leaveCommunity error", e.message);
      setError(e.message);
    }
    setLoading(false);
  };

  const getCommunityData = async (communityId: string) => {
    try {
      const communityDocRef = doc(firestore, "communities", communityId);
      const communityDoc = await getDoc(communityDocRef);
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          id: communityDoc.id,
          ...communityDoc.data(),
        } as Community,
      }));
    } catch (e) {
      console.log("getCommunityData", e);
    }
  };

  useEffect(() => {
    if (!user) {
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [],
      }));
      return;
    }
    getMySnippets();
  }, [user]);

  useEffect(() => {
    const { communityId } = router.query;
    if (communityId && !communityStateValue.currentCommunity) {
      getCommunityData(communityId as string);
    }
  }, [router.query, communityStateValue.currentCommunity]);
  return {
    communityStateValue,
    onJoinOrLeaveCommunity,
    loading,
  };
};
export default useCommunityData;
