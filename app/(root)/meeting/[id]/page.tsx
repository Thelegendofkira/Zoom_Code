"use client"

import LoaderUI from "@/components/LoaderUI"
import { useUser } from "@clerk/nextjs"
import { StreamCall,StreamTheme } from "@stream-io/video-react-sdk"
import { useParams } from "next/navigation"
import { useState } from "react"
import useGetCallById from "@/hooks/useCallGetById"
import MeetingSetup from "@/components/MeetingSetup"
import MeetingRoom from "@/components/MeetingRoom"

function Meetingpage() {
  const {id}=useParams();
  const {isLoaded}=useUser();
  const {call,isCallLoading}=useGetCallById(id!);
  const [isSetUpComplete,setIsSetupComplete]=useState(false);

  if(!isLoaded||isCallLoading)return <LoaderUI/>
  if(!call){
     return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-2xl font-semibold">Meeting not found</p>
      </div>
    );
  }
   return (
    <StreamCall call={call}>
      <StreamTheme>
        {!isSetUpComplete ? (
          <MeetingSetup onSetupComplete={() => setIsSetupComplete(true)} />
        ) : (
          <MeetingRoom />
         
        )}
      </StreamTheme>
    </StreamCall>
  );
}

export default Meetingpage