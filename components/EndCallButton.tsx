import { useCall,useCallStateHooks } from "@stream-io/video-react-sdk";
import { useMutation,useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import toast from "react-hot-toast";

export default function EndCallButton(){
    const call=useCall();
    const router=useRouter();
    const{useLocalParticipant}=useCallStateHooks();
    const localParticipant=useLocalParticipant();

    const updateInterviewStatus =useMutation(api.interviews.updateInterviewStatus);
    const interview=useQuery(api.interviews.getInterviewByStreamCallId,{
        streamCallId:call?.id||"",
    })
    if(!call||!interview)return null;
    const isMeetingOwner =localParticipant?.userId===call.state.createdBy?.id;
    if(!isMeetingOwner)return null;

    const endCall=async()=>{
        try{
            await call.endCall();
        await updateInterviewStatus({
            id:interview._id,
            status:"completed",
        })
        toast.success("Meeting ended  for everyone");
        router.push("/");
        }
        catch(error){
            console.log(error);
            toast.error("Failed to end teh meeting");
        }

    }
    return(
        <Button variant={"destructive"} onClick={endCall}>End For All</Button>
    )

}