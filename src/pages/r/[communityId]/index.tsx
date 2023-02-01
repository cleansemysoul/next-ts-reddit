import { Community } from "@/atoms/communitiesAtom";
import { firestore } from "@/firebase/clientApp";
import { doc, getDoc } from "firebase/firestore";
import { GetServerSidePropsContext } from "next";
import safeJsonStringify from "safe-json-stringify";
import React from "react";
import CommunityNotFound from "@/components/Community/CommunityNotFound";
import Header from "@/components/Community/Header";
import PageContent from "@/components/Layout/PageContent";
import useCommunityData from "@/hooks/useCommunityData";

type CommunityPageProps = {
  communityData: Community;
};

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  console.log(communityData);
  if (!communityData) return <CommunityNotFound />;
  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          <div>LHS</div>
          <div>LHS</div>
          <div>LHS</div>
          <div>LHS</div>
          <div>LHS</div>
          <div>LHS</div>
          <div>LHS</div>
          <div>LHS</div>
        </>
        <>
          <div>RHS</div>
        </>
      </PageContent>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const communityDocRef = doc(
      firestore,
      "communities",
      context.query.communityId as string
    );
    const communityDoc = await getDoc(communityDocRef);
    return {
      props: {
        communityData: communityDoc.exists()
          ? JSON.parse(
              safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
            )
          : "",
      },
    };
  } catch (e) {
    console.log("getServerSideProps error", e);
  }
}
export default CommunityPage;
